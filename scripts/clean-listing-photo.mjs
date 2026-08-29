// @ts-nocheck
import jpeg from "jpeg-js";

const MAX_BYTES = 5_000_000;
const MAX_PIXELS = 4_000_000;
const CACHE_LIMIT = 280;
export const CLEANER_VERSION = "v8";
const cache = new Map();

function medianChannel(values) {
  const s = values.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)] ?? 255;
}

function boxBlurMasked(data, w, h, mask, radius) {
  const copy = Buffer.from(data);
  const idx = (x, y) => (y * w + x) * 4;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      if (mask[row + x] < 20) continue;
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const xx = Math.min(w - 1, Math.max(0, x + dx));
          const yy = Math.min(h - 1, Math.max(0, y + dy));
          const i = idx(xx, yy);
          r += copy[i];
          g += copy[i + 1];
          b += copy[i + 2];
          n++;
        }
      }
      const i = idx(x, y);
      data[i] = Math.round(r / n);
      data[i + 1] = Math.round(g / n);
      data[i + 2] = Math.round(b / n);
    }
  }
}

function paperIntegral(L, sat, w, h, lMin, sMax) {
  const IW = w + 1;
  const integ = new Uint32Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let run = 0;
    const row = y * w;
    const irow = (y + 1) * IW;
    const prow = y * IW;
    for (let x = 0; x < w; x++) {
      if (L[row + x] >= lMin && sat[row + x] <= sMax) run++;
      integ[irow + x + 1] = integ[prow + x + 1] + run;
    }
  }
  return integ;
}

function winSum(integ, w, h, x, y, R) {
  const IW = w + 1;
  const x0 = Math.max(0, x - R);
  const y0 = Math.max(0, y - R);
  const x1 = Math.min(w, x + R + 1);
  const y1 = Math.min(h, y + R + 1);
  return integ[y1 * IW + x1] - integ[y0 * IW + x1] - integ[y1 * IW + x0] + integ[y0 * IW + x0];
}

function dilate(src, w, h, steps) {
  let cur = src;
  for (let s = 0; s < steps; s++) {
    const next = new Uint8Array(cur);
    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 0; x < w; x++) {
        const i = row + x;
        if (!cur[i]) continue;
        if (x > 0) next[i - 1] = 1;
        if (x + 1 < w) next[i + 1] = 1;
        if (y > 0) next[i - w] = 1;
        if (y + 1 < h) next[i + w] = 1;
      }
    }
    cur = next;
  }
  return cur;
}

function labelComponents(mask, w, h) {
  const nPix = w * h;
  const parent = new Int32Array(nPix);
  parent.fill(-1);
  const find = (a) => {
    let r = a;
    while (parent[r] !== r) r = parent[r];
    while (parent[a] !== r) {
      const p = parent[a];
      parent[a] = r;
      a = p;
    }
    return r;
  };
  const unite = (a, b) => {
    a = find(a);
    b = find(b);
    if (a !== b) parent[b] = a;
  };

  for (let i = 0; i < nPix; i++) {
    if (!mask[i]) continue;
    parent[i] = i;
    const x = i % w;
    if (x > 0 && mask[i - 1]) unite(i, i - 1);
    if (i >= w && mask[i - w]) unite(i, i - w);
  }

  const boxes = new Map();
  for (let i = 0; i < nPix; i++) {
    if (!mask[i]) continue;
    const r = find(i);
    const x = i % w;
    const y = (i / w) | 0;
    let b = boxes.get(r);
    if (!b) {
      b = { minX: x, minY: y, maxX: x, maxY: y, area: 0, sumL: 0, root: r };
      boxes.set(r, b);
    }
    if (x < b.minX) b.minX = x;
    if (y < b.minY) b.minY = y;
    if (x > b.maxX) b.maxX = x;
    if (y > b.maxY) b.maxY = y;
    b.area++;
  }
  return { parent, find, boxes };
}

export function isListingPhotoUrl(raw) {
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && (u.hostname === "i.ebayimg.com" || u.hostname.endsWith(".ebayimg.com"));
  } catch {
    return false;
  }
}

export function cleanJpegBuffer(buf) {
  const raw = jpeg.decode(buf, { useTArray: true, maxMemoryUsageInMB: 128, maxResolutionInMP: 12 });
  const w = raw.width;
  const h = raw.height;
  if (w * h > MAX_PIXELS) return buf;
  const data = raw.data;
  const nPix = w * h;
  const L = new Float32Array(nPix);
  const satA = new Uint8Array(nPix);
  for (let i = 0; i < nPix; i++) {
    const o = i * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    L[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    satA[i] = Math.max(r, g, b) - Math.min(r, g, b);
  }

  const paper = paperIntegral(L, satA, w, h, 232, 32);
  const keep = new Uint8Array(nPix);

  // Pass 1: white-floor row bands (classic bottom wordmark)
  const yFloor = Math.floor(h * 0.55);
  const candRow = new Uint8Array(h);
  for (let y = yFloor; y < h; y++) {
    let dark = 0;
    let faint = 0;
    let white = 0;
    const row = y * w;
    for (let x = 0; x < w; x++) {
      const l = L[row + x];
      const s = satA[row + x];
      if (l < 80) dark++;
      else if (l < 245 && s < 48) faint++;
      if (l >= 232 && s < 32) white++;
    }
    if (dark <= Math.max(18, w * 0.04) && faint >= 10 && white >= w * 0.32) candRow[y] = 1;
  }
  const maxBand = Math.max(56, Math.floor(h * 0.16));
  for (let y = yFloor; y < h; ) {
    if (!candRow[y]) {
      y++;
      continue;
    }
    let y1 = y + 1;
    while (y1 < h && candRow[y1]) y1++;
    if (y1 - y >= 3 && y1 - y <= maxBand) {
      for (let yy = y; yy < y1; yy++) {
        const row = yy * w;
        for (let x = 0; x < w; x++) {
          const i = row + x;
          if (L[i] >= 72 && L[i] < 246 && satA[i] < 52) keep[i] = 1;
        }
      }
    }
    y = y1;
  }

  // Pass 2: gray strokes sitting on studio paper, anywhere in the frame
  const R = 8;
  const winArea = (2 * R + 1) * (2 * R + 1);
  const need = Math.floor(winArea * 0.38);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      const i = row + x;
      if (satA[i] >= 42) continue;
      if (L[i] < 70 || L[i] >= 246) continue;
      if (winSum(paper, w, h, x, y, R) < need) continue;
      keep[i] = 1;
    }
  }

  let marked = 0;
  for (let i = 0; i < nPix; i++) if (keep[i]) marked++;
  if (marked < 12) return buf;

  const fat = dilate(keep, w, h, 3);
  const { boxes } = labelComponents(fat, w, h);
  const accept = new Uint8Array(nPix);

  for (const b of boxes.values()) {
    const bw = b.maxX - b.minX + 1;
    const bh = b.maxY - b.minY + 1;
    if (b.area < 40) continue;
    if (bh > h * 0.28) continue;
    if (bw < w * 0.07 && b.area < 220) continue;
    const ratio = bw / Math.max(1, bh);
    const wide = ratio >= 1.55 || bw >= w * 0.16;
    if (!wide) continue;
    if (b.area > nPix * 0.14) continue;

    let paperIn = 0;
    let sumL = 0;
    let nKeep = 0;
    let dark = 0;
    for (let y = b.minY; y <= b.maxY; y++) {
      const row = y * w;
      for (let x = b.minX; x <= b.maxX; x++) {
        const i = row + x;
        if (L[i] >= 232 && satA[i] < 32) paperIn++;
        if (!keep[i] && !fat[i]) continue;
        if (keep[i]) {
          sumL += L[i];
          nKeep++;
          if (L[i] < 55) dark++;
        }
      }
    }
    const boxArea = bw * bh;
    if (paperIn / boxArea < 0.42) continue;
    if (nKeep && sumL / nKeep < 78) continue;
    if (dark > nKeep * 0.18) continue;

    for (let y = b.minY; y <= b.maxY; y++) {
      const row = y * w;
      for (let x = b.minX; x <= b.maxX; x++) {
        const i = row + x;
        if (fat[i]) accept[i] = 1;
      }
    }
  }

  let acc = 0;
  for (let i = 0; i < nPix; i++) if (accept[i]) acc++;
  if (acc < 12) return buf;

  const pad = dilate(accept, w, h, 1);

  const floorR = [];
  const floorG = [];
  const floorB = [];
  for (let i = 0; i < nPix; i += 2) {
    if (L[i] >= 240 && satA[i] < 28) {
      const o = i * 4;
      floorR.push(data[o]);
      floorG.push(data[o + 1]);
      floorB.push(data[o + 2]);
    }
  }
  const bg = floorR.length >= 20 ? [medianChannel(floorR), medianChannel(floorG), medianChannel(floorB)] : [255, 255, 255];

  const fill = new Uint8Array(nPix);
  for (let i = 0; i < nPix; i++) {
    if (!pad[i]) continue;
    if (satA[i] >= 58 && L[i] < 200) continue;
    fill[i] = 255;
    const o = i * 4;
    data[o] = bg[0];
    data[o + 1] = bg[1];
    data[o + 2] = bg[2];
  }

  boxBlurMasked(data, w, h, fill, 1);
  return jpeg.encode({ data, width: w, height: h }, 92).data;
}

function cacheSet(key, value) {
  if (cache.size >= CACHE_LIMIT) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  cache.set(key, value);
}

export async function cleanListingPhoto(url) {
  const key = `${CLEANER_VERSION}:${url}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; SolBeautiful/1.0)",
      Accept: "image/jpeg,image/*;q=0.8",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`photo fetch ${res.status}`);
  const ctype = res.headers.get("content-type") || "image/jpeg";
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    const passthrough = { body: buf, contentType: ctype };
    cacheSet(key, passthrough);
    return passthrough;
  }
  let body = buf;
  let contentType = ctype;
  if (/jpeg|jpg/i.test(ctype) || url.includes(".jpg")) {
    try {
      body = Buffer.from(cleanJpegBuffer(buf));
      contentType = "image/jpeg";
    } catch {
      body = buf;
    }
  }
  const out = { body, contentType };
  cacheSet(key, out);
  return out;
}

export async function handleCleanPhotoRequest(request) {
  const src = new URL(request.url).searchParams.get("u") || "";
  if (!isListingPhotoUrl(src)) {
    return new Response("invalid photo", { status: 400 });
  }
  try {
    const { body, contentType } = await cleanListingPhoto(src);
    return new Response(body, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=604800, immutable",
      },
    });
  } catch {
    return new Response("photo unavailable", { status: 502 });
  }
}

export function attachCleanPhotoMiddleware(server) {
  server.middlewares.use(async (req, res, next) => {
    const rawUrl = req.url ?? "";
    const pathOnly = rawUrl.split("?", 1)[0] ?? "";
    if (pathOnly !== "/api/photo") {
      next();
      return;
    }
    if ((req.method ?? "GET").toUpperCase() !== "GET") {
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }
    try {
      const host = String(req.headers.host ?? "localhost:8080");
      const request = new Request(`http://${host}${rawUrl}`);
      const response = await handleCleanPhotoRequest(request);
      res.statusCode = response.status;
      response.headers.forEach((value, key) => res.setHeader(key, value));
      const body = Buffer.from(await response.arrayBuffer());
      res.end(body);
    } catch (err) {
      console.error("[photo-clean]", err);
      if (!res.headersSent) {
        res.statusCode = 502;
        res.end("photo unavailable");
      }
    }
  });
}
