#!/usr/bin/env python3
"""Verify assigned UPCs against upcitemdb product pages, then fill featured gaps via trial search."""
from __future__ import annotations

import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path("/workspace")
LISTINGS = json.loads((ROOT / "src/data/listings.json").read_text())
OUT = ROOT / "src/data/barcodes.json"
UA = "Mozilla/5.0 (compatible; SolBeautifulCatalog/1.0)"

NOISE = {
    "oz", "ml", "g", "nib", "new", "size", "full", "makeup", "choose", "color",
    "colour", "original", "formula", "unboxed", "htf", "rare", "piece", "one",
    "the", "and", "for", "with", "from", "pack", "sealed", "spray", "default",
    "item", "in", "of", "a", "an", "to", "by", "or", "spf", "hour", "wear",
}

def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()

def tokens(s: str) -> list[str]:
    return [t for t in norm(s).split() if t not in NOISE and len(t) > 1]

def shade_codes(s: str) -> set[str]:
    n = norm(s)
    codes = set(re.findall(r"\b[a-z]{1,3}\d{1,3}[a-z]?\d{0,2}\b", n))
    codes |= set(re.findall(r"\b\d{1,2}[a-z]\d\b", n))
    # keep 2-digit shade numbers only if paired with a word (Bisque 29)
    return {c for c in codes if not c.isdigit() or len(c) >= 2}

def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/json"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", "replace")

def upc_title(upc: str) -> str | None:
    for slug in (upc, upc.lstrip("0") or upc):
        try:
            html = fetch(f"https://www.upcitemdb.com/upc/{slug}")
        except Exception:
            continue
        m = re.search(r"<title>([^<]+)</title>", html, re.I)
        if not m:
            continue
        t = re.sub(r"\s+", " ", m.group(1))
        t = re.sub(r"\s*\|\s*upcitemdb.*$", "", t, flags=re.I)
        t = re.sub(r"^(UPC|EAN)\s+\d+\s*-\s*", "", t, flags=re.I)
        return t.strip()
    return None

def strict_ok(vendor: str, variant: str, product: str, hit: str) -> bool:
    hit_n = norm(hit)
    brand = tokens(vendor)
    if brand and not any(b in hit_n for b in brand[:2]):
        return False
    label = variant if variant and variant != "Default" else product
    sc = shade_codes(label)
    hc = shade_codes(hit)
    if sc and sc & hc:
        return True
    vt = tokens(label)
    if variant == "Default":
        vt = tokens(product)[:6]
    if len(vt) >= 2 and all(t in hit_n for t in vt[:4]):
        return True
    return False

def trial_search(query: str) -> list[tuple[str, str]]:
    q = urllib.parse.quote(query[:110])
    url = f"https://api.upcitemdb.com/prod/trial/search?s={q}"
    data = json.loads(fetch(url))
    out = []
    for it in data.get("items") or []:
        upc = re.sub(r"\D", "", str(it.get("upc") or it.get("ean") or ""))
        if len(upc) == 11:
            upc = "0" + upc
        title = it.get("title") or ""
        color = it.get("color") or ""
        if upc and title:
            out.append((upc, f"{title} {color}".strip()))
    return out

def main() -> None:
    assigned = json.loads(OUT.read_text()) if OUT.exists() else {}
    unique = sorted(set(assigned.values()))
    print("verifying", len(unique), "unique UPCs")
    titles: dict[str, str] = {}
    for i, upc in enumerate(unique, 1):
        for attempt in range(4):
            try:
                t = upc_title(upc)
                titles[upc] = t or ""
                print(f"{i:03d} {upc} :: {(t or 'NO TITLE')[:90]}")
                time.sleep(0.7)
                break
            except Exception as e:
                wait = 4 + attempt * 3
                print(f"  retry {upc} {e} sleep {wait}")
                time.sleep(wait)
        else:
            titles[upc] = ""

    # remap strictly
    by_vid = {}
    for p in LISTINGS:
        for v in p["variants"]:
            by_vid[v["id"]] = p, v

    clean: dict[str, str] = {}
    used = set()
    kept = dropped = 0
    for vid, upc in assigned.items():
        meta = by_vid.get(vid)
        if not meta:
            continue
        p, v = meta
        hit = titles.get(upc, "")
        if hit and strict_ok(p.get("vendor") or "", v.get("title") or "", p.get("title") or "", hit):
            if upc in used:
                dropped += 1
                continue
            clean[vid] = upc
            used.add(upc)
            kept += 1
        else:
            dropped += 1
    print(f"strict keep {kept} drop {dropped}")

    # fill featured gaps via trial API
    featured = [p for p in LISTINGS if p.get("featured")]
    print("trial search featured", len(featured))
    for i, p in enumerate(featured, 1):
        missing = [v for v in p["variants"] if v["id"] not in clean]
        if not missing:
            continue
        vendor = p.get("vendor") or ""
        title = re.sub(r"(?i)\b(nib|nwt|htf|choose color|full size|original formula)\b", " ", p.get("title") or "")
        title = re.sub(r"(?i)\b\d+(\.\d+)?\s?(oz|ml|g)\b", " ", title)
        q = f"{vendor} {title}"
        q = re.sub(r"[\s./-]+", " ", q).strip()
        # if few missing, search with shade
        queries = [q]
        if 1 <= len(missing) <= 6:
            for v in missing[:6]:
                queries.append(f"{vendor} {title} {v.get('title')}")
        for query in queries[:3]:
            try:
                hits = trial_search(query)
            except Exception as e:
                print("trial fail", e)
                time.sleep(2)
                continue
            print(f"feat {i:02d} hits={len(hits)} {query[:70]}")
            time.sleep(0.9)
            for v in missing:
                if v["id"] in clean:
                    continue
                best = None
                for upc, ht in hits:
                    if upc in used:
                        continue
                    if strict_ok(vendor, v.get("title") or "", p.get("title") or "", ht):
                        best = upc
                        break
                if best:
                    clean[v["id"]] = best
                    used.add(best)

    OUT.write_text(json.dumps(clean, indent=0, sort_keys=True) + "\n")
    print("wrote", len(clean), "verified barcodes")

if __name__ == "__main__":
    main()
