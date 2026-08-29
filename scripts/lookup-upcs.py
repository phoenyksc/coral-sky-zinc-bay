#!/usr/bin/env python3
"""Look up manufacturer UPCs for catalog variants via upcitemdb (HTML name search).

upclookup.com is a barcode-in SPA (Price Tracker) without a public product-name API.
upcitemdb.com is the public UPC lookup that returns barcode + title for a name search,
which is what we need to attach real UPCs to shades.
"""
from __future__ import annotations

import json
import random
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path("/workspace")
LISTINGS = ROOT / "src/data/listings.json"
OUT = ROOT / "src/data/barcodes.json"
UA = "Mozilla/5.0 (compatible; SolBeautifulCatalog/1.0; +https://solbeautiful.com)"

NOISE = {
    "oz", "ml", "g", "nib", "new", "size", "full", "makeup", "choose", "color",
    "colour", "original", "formula", "unboxed", "htf", "rare", "piece", "one",
    "the", "and", "for", "with", "from", "pack", "sealed", "spray", "bottle",
    "default", "item", "box", "nwt", "fs", "f", "s", "in", "of", "a", "an",
    "to", "by", "or", "set", "kit", "travel", "mini", "tester",
}

def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return s.strip()

def tokens(s: str) -> list[str]:
    return [t for t in norm(s).split() if t not in NOISE and len(t) > 1]

def shade_codes(s: str) -> set[str]:
    return set(re.findall(r"\b[a-z]{1,3}\d{1,3}[a-z]?\d{0,2}\b", norm(s))) | set(
        re.findall(r"\b\d{1,2}[a-z]\d\b", norm(s))
    )

def pad_upc(raw: str) -> str | None:
    d = re.sub(r"\D", "", raw)
    if len(d) == 11:
        d = "0" + d
    if len(d) == 13 and d.startswith("0"):
        d = d[1:]
    if len(d) not in (12, 13, 14):
        return None
    return d

def family_query(vendor: str, title: str) -> str:
    t = title
    t = re.sub(r"(?i)\b(nib|nwt|htf|fs|f/s|unboxed|choose color|choose colour|1 piece|full size|original formula|rare|hard to find|new in box)\b", " ", t)
    t = re.sub(r"(?i)\b\d+(\.\d+)?\s?(oz|ml|g)\b", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    if vendor.lower() not in t.lower():
        t = f"{vendor} {t}"
    words = t.split()
    return " ".join(words[:10])

def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", "replace")

def search_upcitemdb(query: str) -> list[tuple[str, str]]:
    q = urllib.parse.quote_plus(query[:120])
    url = f"https://www.upcitemdb.com/query?s={q}&type=2"
    html = fetch(url)
    out: list[tuple[str, str]] = []
    for m in re.finditer(
        r'href="/upc/(\d+)"[^>]*>\s*([0-9]{11,14})\s*</a>\s*<p>([^<]+)</p>',
        html,
        re.I,
    ):
        upc = pad_upc(m.group(2))
        title = re.sub(r"\s+", " ", m.group(3)).strip()
        if upc and title:
            out.append((upc, title))
    # fallback: just /upc/ links with nearby text
    if not out:
        for m in re.finditer(r'class="rImage">.*?(\d{11,14}).*?<p>([^<]+)</p>', html, re.S):
            upc = pad_upc(m.group(1))
            title = re.sub(r"\s+", " ", m.group(2)).strip()
            if upc and title:
                out.append((upc, title))
    # unique by upc
    seen = set()
    uniq = []
    for upc, title in out:
        if upc in seen:
            continue
        seen.add(upc)
        uniq.append((upc, title))
    return uniq

def score_match(vendor: str, variant: str, hit_title: str) -> int:
    vt = tokens(variant)
    ht = tokens(hit_title)
    hv = set(ht)
    brand = tokens(vendor)
    if brand and not any(b in hv or b in " ".join(ht) for b in brand):
        # brand missing is a weak hit
        brand_ok = vendor.lower().split()[0][:5] in hit_title.lower()
        if not brand_ok:
            return 0
    sc = shade_codes(variant)
    hc = shade_codes(hit_title)
    if sc and sc & hc:
        return 50 + 10 * len(sc & hc)
    if not vt:
        return 5 if brand else 0
    overlap = [t for t in vt if t in hv]
    if len(overlap) == len(vt) and len(vt) >= 1:
        return 20 + 5 * len(overlap)
    if len(overlap) >= 2:
        return 10 + 3 * len(overlap)
    return 0

def main() -> None:
    listings = json.loads(LISTINGS.read_text())
    existing = {}
    if OUT.exists():
        try:
            existing = json.loads(OUT.read_text())
        except json.JSONDecodeError:
            existing = {}

    # rank products: featured, many variants, sold
    ranked = sorted(
        listings,
        key=lambda p: (
            not p.get("featured"),
            -len(p.get("variants") or []),
            -(p.get("sold") or 0),
        ),
    )

    families: dict[str, list] = {}
    for p in ranked:
        q = family_query(p.get("vendor") or "", p.get("title") or "")
        families.setdefault(q, []).append(p)

    # cap searches so we finish in a few minutes
    queries = list(families.keys())[:90]
    assigned: dict[str, str] = dict(existing)
    cache: dict[str, list[tuple[str, str]]] = {}

    print(f"searching {len(queries)} families covering {sum(len(families[q]) for q in queries)} products")

    for i, q in enumerate(queries, 1):
        try:
            hits = search_upcitemdb(q)
        except Exception as e:
            print(f"FAIL {i} {q[:60]!r}: {e}")
            time.sleep(1.5)
            continue
        cache[q] = hits
        print(f"{i:03d} hits={len(hits):2d}  {q[:70]}")
        time.sleep(0.55 + random.random() * 0.25)

        for p in families[q]:
            vendor = p.get("vendor") or ""
            for v in p.get("variants") or []:
                vid = v.get("id")
                if not vid or vid in assigned:
                    continue
                title = v.get("title") or ""
                # skip generic Default unless only one variant
                best = None
                best_s = 12  # threshold
                for upc, ht in hits:
                    s = score_match(vendor, title if title != "Default" else p.get("title") or "", ht)
                    if title == "Default":
                        s = score_match(vendor, p.get("title") or "", ht)
                    if s > best_s:
                        best_s = s
                        best = upc
                if best:
                    assigned[vid] = best

        if i % 10 == 0:
            OUT.write_text(json.dumps(assigned, indent=0, sort_keys=True))
            print(f"  checkpoint {len(assigned)} barcodes")

    OUT.write_text(json.dumps(assigned, indent=0, sort_keys=True))
    print(f"wrote {len(assigned)} barcodes to {OUT}")

if __name__ == "__main__":
    main()
