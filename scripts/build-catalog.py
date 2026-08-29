#!/usr/bin/env python3
"""Build Sol Beautiful catalog JSON + collection/hero images from the eBay export."""
from __future__ import annotations

import csv
import json
import os
import re
import ssl
import urllib.request
from collections import defaultdict
from datetime import datetime
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

ROOT = Path("/workspace")
CSV_PATH = ROOT / "attachments" / "8-20-2026-Ebay-Listings-493593.csv"
OUT_JSON = ROOT / "src" / "data" / "listings.json"
PUBLIC = ROOT / "public"
CTX = ssl.create_default_context()

BRANDS = [
    ("YVES SAINT LAURENT", "Yves Saint Laurent"),
    ("GIORGIO ARMANI", "Giorgio Armani"),
    ("BUMBLE AND BUMBLE", "Bumble and Bumble"),
    ("BUMBLE AND BB", "Bumble and Bumble"),
    ("BUMBLE AND BB.", "Bumble and Bumble"),
    ("ELIZABETH AND JAMES", "Elizabeth and James"),
    ("ELIZABETH ARDEN", "Elizabeth Arden"),
    ("CHARLOTTE TILBURY", "Charlotte Tilbury"),
    ("TOMMY HILFIGER", "Tommy Hilfiger"),
    ("TOMMY BOY", "Tommy Hilfiger"),
    ("TOMMY GIRL", "Tommy Hilfiger"),
    ("VIKTOR & ROLF", "Viktor & Rolf"),
    ("VIKTOR AND ROLF", "Viktor & Rolf"),
    ("MAKE UP FOR EVER", "Make Up For Ever"),
    ("MAKEUP FOREVER", "Make Up For Ever"),
    ("MICHAEL KORS", "Michael Kors"),
    ("RALPH LAUREN", "Ralph Lauren"),
    ("LAURA MERCIER", "Laura Mercier"),
    ("MARIO BADESCU", "Mario Badescu"),
    ("MARC JACOBS", "Marc Jacobs"),
    ("TORY BURCH", "Tory Burch"),
    ("DONNA KARAN", "Donna Karan"),
    ("THE ORDINARY", "The Ordinary"),
    ("GLOW RECIPE", "Glow Recipe"),
    ("INNBEAUTY PROJECT", "INNBEAUTY Project"),
    ("IT COSMETICS", "IT Cosmetics"),
    ("KAT VON D", "Kat Von D"),
    ("URBAN DECAY", "Urban Decay"),
    ("BOBBI BROWN", "Bobbi Brown"),
    ("TOO FACED", "Too Faced"),
    ("ESTEE LAUDER", "Estée Lauder"),
    ("ESTÉE LAUDER", "Estée Lauder"),
    ("COVER FX", "Cover FX"),
    ("COVERFX", "Cover FX"),
    ("COVER GIRL", "CoverGirl"),
    ("COVERGIRL", "CoverGirl"),
    ("MAX FACTOR", "Max Factor"),
    ("L'OREAL", "L'Oréal"),
    ("LOREAL", "L'Oréal"),
    ("CREATION LAMIS", "Creation Lamis"),
    ("ACQUA DI GIO", "Giorgio Armani"),
    ("KIEHL'S", "Kiehl's"),
    ("KIEHLS", "Kiehl's"),
    ("PRESCRIPTIVES", "Prescriptives"),
    ("PHILOSOPHY", "Philosophy"),
    ("SMASHBOX", "Smashbox"),
    ("CLINIQUE", "Clinique"),
    ("LANCOME", "Lancôme"),
    ("LANCÔME", "Lancôme"),
    ("GUERLAIN", "Guerlain"),
    ("GIVENCHY", "Givenchy"),
    ("JO MALONE", "Jo Malone"),
    ("TOM FORD", "Tom Ford"),
    ("MAYBELLINE", "Maybelline"),
    ("GLAMGLOW", "GLAMGLOW"),
    ("ORIGINS", "Origins"),
    ("REVLON", "Revlon"),
    ("COLOR WOW", "Color Wow"),
    ("MILK MAKEUP", "Milk Makeup"),
    ("TATOUAGE COUTURE", "Yves Saint Laurent"),
    ("DR. WEIL", "Origins"),
    ("DR WEIL", "Origins"),
    ("ACTEUR POUR", "Azzaro"),
    ("ARMANI", "Giorgio Armani"),
    ("CHANEL", "Chanel"),
    ("SEPHORA", "Sephora"),
    ("AVEDA", "Aveda"),
    ("AERIN", "AERIN"),
    ("NARS", "NARS"),
    ("BECCA", "BECCA"),
    ("DKNY", "DKNY"),
    ("ARAMIS", "Aramis"),
    ("NABLA", "Nabla"),
    ("TOVA", "Tova"),
    ("TABU", "Dana"),
    ("YSL", "Yves Saint Laurent"),
    ("KVD", "Kat Von D"),
    ("MAC", "MAC"),
]

STORE_CAT_BRAND = {
    "551382010": "Estée Lauder",
    "551384010": "Clinique",
    "551385010": "Lancôme",
    "551383010": "MAC",
    "551392010": "Bobbi Brown",
    "551394010": "Prescriptives",
    "551396010": "Smashbox",
    "551398010": "Yves Saint Laurent",
    "551386010": "L'Oréal",
    "2340988010": "Tom Ford",
    "2379505010": "Philosophy",
}

FRAGRANCE_CATS = {
    "Women's Fragrances",
    "Men's Fragrances",
    "Unisex Fragrances",
    "Body Sprays & Mists",
    "Home Fragrance",
    "Aftershave",
}
SKINCARE_CATS = {
    "Moisturizers",
    "Cleansers & Toners",
    "Anti-Aging Products",
    "Eye Treatments & Masks",
    "Sunscreen",
    "Skin Masks",
    "Exfoliators & Scrubs",
    "Makeup Remover",
    "Acne & Blemish Treatments",
    "Night Treatments",
    "Skin Peels",
    "Massage Oils & Lotions",
    "Other Natural Remedies",
}
HAIR_CATS = {
    "Styling Products",
    "Shampoos & Conditioners",
    "Treatments, Oils & Protectors",
    "Hair Loss Treatments",
    "Hair Color",
    "Shampooing & Washing",
    "Eyelash & Eyebrow Growth",
    "Brushes & Combs",
}
BATH_CATS = {
    "Body Washes & Shower Gels",
    "Bath & Body Mixed Items",
    "Body Soaps",
    "Body Powders",
    "Self-Tanning Products",
    "Tanning Lotion",
    "Candles",
    "Deodorants & Antiperspirants",
    "Shaving Creams, Foams & Gels",
    "Bath Sets & Kits",
    "Cold & Hot Packs & Wraps",
}

SMALL_WORDS = {
    "a", "an", "and", "as", "at", "by", "de", "di", "du", "for", "in", "of", "on",
    "or", "the", "to", "vs", "w", "with", "x",
}
KEEP_UPPER = {
    "NIB", "NIP", "SPF", "EDP", "EDT", "UB", "HTF", "LE", "FS", "F/S", "NEW",
    "MAC", "YSL", "NARS", "DKNY", "AERIN", "KVD", "BB", "CC", "UV", "PEARL",
    "SPF15", "SPF20", "SPF40", "SPF50", "SPF8", "SPF10", "ML", "OZ", "PC", "PCS",
}

HANDLE_RE = re.compile(r"[^a-z0-9]+")
IMG_HASH = re.compile(r"/z/([^/]+)/")


def num(val, default=0.0):
    try:
        if val is None or val == "" or val == "null":
            return default
        return float(str(val).replace(",", "").strip())
    except ValueError:
        return default


def inum(val, default=0):
    return int(num(val, default))


def pretty_title(raw: str) -> str:
    raw = re.sub(r"\s+", " ", raw).strip()
    parts = []
    for i, tok in enumerate(raw.split(" ")):
        clean = tok.strip()
        if not clean:
            continue
        upper = re.sub(r"[^A-Z0-9/]+", "", clean.upper())
        if upper in KEEP_UPPER or re.fullmatch(r"SPF\d+", upper):
            parts.append(clean.upper() if clean.isalpha() or clean.upper().startswith("SPF") else clean)
            continue
        if re.fullmatch(r"\d+(\.\d+)?", clean):
            parts.append(clean)
            continue
        if re.fullmatch(r"#?\d+", clean):
            parts.append(clean)
            continue
        word = re.sub(r"[^A-Za-z0-9'./+-]+", "", clean)
        low = word.lower()
        if i != 0 and low in SMALL_WORDS:
            parts.append(low)
        elif word.isupper() or word.islower() or word.istitle():
            parts.append(word[:1].upper() + word[1:].lower() if word else clean)
        else:
            parts.append(clean.title())
    title = " ".join(parts)
    title = title.replace("Lancome", "Lancôme").replace("Estee Lauder", "Estée Lauder")
    title = title.replace("L'oreal", "L'Oréal").replace("Loreal", "L'Oréal")
    title = title.replace("Kiehls", "Kiehl's").replace("Kiehl's's", "Kiehl's")
    return title


def slugify(text: str) -> str:
    s = HANDLE_RE.sub("-", text.lower()).strip("-")
    return s[:70].strip("-") or "item"


def detect_brand(title: str, store_cat: str) -> str:
    t = title.upper()
    for needle, name in BRANDS:
        if needle == "MAC":
            if re.search(r"\bMAC\b", t):
                return name
            continue
        if needle == "NARS":
            if re.search(r"\bNARS\b", t):
                return name
            continue
        if needle == "IT COSMETICS":
            if "IT COSMETICS" in t or re.search(r"\bIT BUILD", t) or re.search(r"\bIT COSMETICS\b", t):
                return name
            continue
        if needle in t:
            return name
    if store_cat in STORE_CAT_BRAND:
        return STORE_CAT_BRAND[store_cat]
    return "Sol Beautiful"


def classify(cat: str, title: str) -> tuple[str, str]:
    t = title.upper()
    if cat in FRAGRANCE_CATS or any(k in t for k in ("EAU DE", "PARFUM", "COLOGNE", "EDT", "EDP", "FRAGRANCE", "PERFUME")):
        if cat in SKINCARE_CATS and "PERFUMED" not in t and "FRAGRANCE" not in t:
            pass
        else:
            if cat in FRAGRANCE_CATS or any(k in t for k in ("EAU DE", "COLOGNE", " PERFUME", "PARFUM")):
                return "Fragrance", "fragrances"
    if cat in SKINCARE_CATS:
        return "Skincare", "skincare"
    if cat in HAIR_CATS:
        return "Hair", "hair"
    if cat in BATH_CATS:
        return "Bath & Body", "bath-body"
    if cat in {"Sets & Kits"}:
        if any(k in t for k in ("EAU DE", "PARFUM", "COLOGNE", "EDP")):
            return "Fragrance", "fragrances"
        return "Makeup", "makeup"
    return "Makeup", "makeup"


def upgrade_image(url: str) -> str:
    if not url:
        return ""
    m = IMG_HASH.search(url)
    if m:
        return f"https://i.ebayimg.com/images/g/{m.group(1)}/s-l800.jpg"
    url = re.sub(r"\$_\d+", "s-l800", url)
    return url.split("?")[0]


def parse_variation(raw: str) -> tuple[str, str]:
    raw = (raw or "").strip()
    if not raw or raw in {"null", "[object Object]", "undefined"}:
        return "Option", "Default"
    if ":" in raw:
        key, _, val = raw.partition(":")
        key = key.strip().title() or "Option"
        val = val.lstrip(":").strip() or "Default"
        if key.lower() in {"size type", "size"}:
            key = "Size"
        elif key.lower() in {"color", "product color", "shade"}:
            key = "Shade"
        elif key.lower() in {"quantity / amount", "quantity"}:
            key = "Quantity"
        elif key.lower() == "packaging":
            key = "Packaging"
        return key, val
    return "Option", raw


def parse_start(s: str) -> str:
    s = (s or "").strip()
    for fmt in ("%d/%m/%Y %H:%M", "%d/%m/%Y", "%m/%d/%Y %H:%M", "%m/%d/%Y"):
        try:
            return datetime.strptime(s, fmt).strftime("%Y-%m-%dT%H:%M:%SZ")
        except ValueError:
            continue
    return "2020-01-01T00:00:00Z"


def condition_bits(title: str) -> tuple[list[str], str]:
    t = title.upper()
    tags = []
    bits = []
    if "NIB" in t or "NEW IN BOX" in t:
        tags.append("new-in-box")
        bits.append("New in box")
    if "NIP" in t or "NEW IN PACKAGE" in t:
        tags.append("new-in-package")
        bits.append("New in package")
    if "UNBOXED" in t or re.search(r"\bUB\b", t):
        tags.append("unboxed")
        bits.append("New, unboxed")
    if "SEALED" in t:
        tags.append("sealed")
        bits.append("Factory sealed")
    if any(k in t for k in ("RARE", "HTF", "HARD TO FIND", "DISCONTINUED", "LIMITED EDITION", " L.E.")):
        tags += ["rare", "hard-to-find"]
        if "DISCONTINUED" in t:
            tags.append("discontinued")
            bits.append("Discontinued / hard to find")
        else:
            bits.append("Limited or hard-to-find")
    return tags, (", ".join(bits) if bits else "Authentic designer stock")


def fetch_image(url: str, timeout=12) -> Image.Image | None:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 SolBeautiful/1.0"})
        with urllib.request.urlopen(req, timeout=timeout, context=CTX) as resp:
            data = resp.read()
        im = Image.open(BytesIO(data)).convert("RGB")
        return im
    except Exception as e:
        print("img fail", url[:80], e)
        return None


def fit_cover(im: Image.Image, w: int, h: int) -> Image.Image:
    scale = max(w / im.width, h / im.height)
    nw, nh = int(im.width * scale), int(im.height * scale)
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - w) // 2
    top = (nh - h) // 2
    return im.crop((left, top, left + w, top + h))


def compose_hero(images: list[Image.Image], path: Path) -> None:
    W, H = 1920, 1080
    canvas = Image.new("RGB", (W, H), (26, 22, 19))
    cols, rows = 4, 2
    tw, th = W // cols, H // rows
    for i, im in enumerate(images[: cols * rows]):
        x, y = (i % cols) * tw, (i // cols) * th
        tile = fit_cover(im, tw + 4, th + 4)
        canvas.paste(tile, (x, y))
    overlay = Image.new("RGB", (W, H), (26, 22, 19))
    canvas = Image.blend(canvas.filter(ImageFilter.GaussianBlur(0.4)), overlay, 0.18)
    # darken lower third for type
    shade = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(shade)
    for y in range(H):
        t = 0
        if y > H * 0.45:
            t = int(180 * ((y - H * 0.45) / (H * 0.55)))
        d.line([(0, y), (W, y)], fill=min(200, t))
    black = Image.new("RGB", (W, H), (26, 22, 19))
    canvas = Image.composite(black, canvas, shade)
    canvas.save(path, "JPEG", quality=86, optimize=True)
    print("hero", path, canvas.size, path.stat().st_size)


def main() -> None:
    with CSV_PATH.open(newline="", encoding="utf-8", errors="replace") as f:
        rows = list(csv.DictReader(f))

    grouped: dict[str, list[dict]] = defaultdict(list)
    for r in rows:
        grouped[r["Item ID"]].append(r)

    products = []
    used_handles: set[str] = set()

    for item_id, group in grouped.items():
        parent = group[0]
        title_raw = parent.get("Title") or "Untitled"
        title = pretty_title(title_raw)
        brand = detect_brand(title_raw, parent.get("Store Category ID") or "")
        cat = parent.get("Category Name") or "Makeup"
        ptype, col = classify(cat, title_raw)
        cond_tags, cond_label = condition_bits(title_raw)
        img = upgrade_image(parent.get("Image URL") or "")
        weight = num(parent.get("Weight"), 0.25) or 0.25
        watchers = inum(parent.get("Watchers"))
        parent_sold = inum(parent.get("Quantity Sold"))
        parent_inv = inum(parent.get("Warehouse Inventory"))
        parent_price = num(parent.get("Price"))
        start = parse_start(parent.get("Start Time") or "")
        ebay_url = parent.get("URL") or f"https://www.ebay.com/itm/{item_id}"
        last_sale = (parent.get("Last Sale Date") or "").strip()

        variants = []
        option_name = "Title"
        option_values = []
        var_sold_sum = 0
        var_inv_sum = 0

        has_real_vars = False
        for r in group:
            vid = (r.get("Variation ID") or "").strip()
            if vid and vid not in {"null", "[object Object]"}:
                has_real_vars = True
                break

        if has_real_vars:
            for i, r in enumerate(group):
                key, val = parse_variation(r.get("Variation ID") or "")
                if i == 0:
                    option_name = key
                if val in option_values:
                    val = f"{val} ({i + 1})"
                option_values.append(val)
                price = num(r.get("Variation Price"), parent_price)
                inv = inum(r.get("Variation Warehouse Inventory"))
                sold = inum(r.get("Variation Quantity Sold"))
                var_sold_sum += sold
                var_inv_sum += inv
                ceiling = num(r.get("Variation Ceiling Price") or r.get("Ceiling Price"))
                sku = (r.get("Variation SKU") or "").strip()
                if not sku or sku == "null":
                    sku = f"{item_id}-{i + 1}"
                compare = None
                if ceiling > price + 0.5:
                    compare = f"{ceiling:.2f}"
                variants.append(
                    {
                        "id": f"var-{item_id}-{i + 1}",
                        "title": val,
                        "sku": sku,
                        "price": f"{price:.2f}",
                        "compareAtPrice": compare,
                        "inventoryQuantity": max(0, inv),
                        "option1": val,
                        "weight": weight,
                        "available": inv > 0,
                    }
                )
            sold_total = var_sold_sum if var_sold_sum else parent_sold
            inv_total = var_inv_sum
        else:
            option_name = "Title"
            option_values = ["Default"]
            ceiling = num(parent.get("Ceiling Price"))
            compare = f"{ceiling:.2f}" if ceiling > parent_price + 0.5 else None
            sku = (parent.get("SKU") or "").strip() or item_id
            variants.append(
                {
                    "id": f"var-{item_id}-1",
                    "title": "Default",
                    "sku": sku,
                    "price": f"{parent_price:.2f}",
                    "compareAtPrice": compare,
                    "inventoryQuantity": max(0, parent_inv),
                    "option1": "Default",
                    "weight": weight,
                    "available": parent_inv > 0,
                }
            )
            sold_total = parent_sold
            inv_total = parent_inv

        handle = slugify(f"{brand} {title}")
        if handle in used_handles:
            handle = f"{handle}-{item_id[-6:]}"
        used_handles.add(handle)

        tags = [ptype.lower().replace(" & ", "-").replace(" ", "-"), brand.lower()]
        tags.extend(cond_tags)
        if col == "fragrances":
            tags.append("fragrance")
        if "women" in (cat or "").lower() or "WOMEN" in title_raw.upper():
            tags.append("women")
        if "men" in (cat or "").lower() or re.search(r"\bMEN\b", title_raw.upper()):
            tags.append("men")
        if watchers >= 40 or sold_total >= 80:
            tags.append("bestseller")
        if inv_total <= 0:
            tags.append("sold-out")
        # Prescriptives is discontinued as a brand
        if brand == "Prescriptives":
            tags += ["rare", "discontinued", "hard-to-find"]

        min_price = min(float(v["price"]) for v in variants)
        collections = [col]
        if "rare" in tags or "discontinued" in tags:
            collections.append("rare-finds")
        if any(v.get("compareAtPrice") for v in variants):
            collections.append("sale")
        if min_price < 20:
            collections.append("under-20")

        size_hint = ""
        m = re.search(r"(\d+(?:\.\d+)?)\s*(oz|ml|g)\b", title_raw, re.I)
        if m:
            size_hint = f"{m.group(1)} {m.group(2).lower()}"

        body = (
            f"<p>Authentic {brand} {ptype.lower()} from Sol Beautiful — chosen for the formula, the ritual, "
            f"and how it actually wears.</p>"
            f"<p>{cond_label}. Packed in Fountain Valley, California and shipped from the United States.</p>"
        )
        if size_hint:
            body += f"<p>Listed size: {size_hint}.</p>"
        if sold_total:
            body += f"<p>{sold_total} sold on eBay to date.</p>"

        products.append(
            {
                "id": item_id,
                "handle": handle,
                "title": title,
                "vendor": brand,
                "productType": ptype,
                "category": cat,
                "tags": sorted(set(tags)),
                "publishedAt": start,
                "featured": False,
                "collectionHandles": collections,
                "img": img,
                "optionName": option_name,
                "variants": [
                    {
                        "id": v["id"],
                        "title": v["title"],
                        "sku": v["sku"],
                        "price": v["price"],
                        **({"compareAtPrice": v["compareAtPrice"]} if v.get("compareAtPrice") else {}),
                        "inventoryQuantity": v["inventoryQuantity"],
                        "option1": v["option1"],
                        "weight": v["weight"],
                    }
                    for v in variants
                ],
                "sold": sold_total,
                "watchers": watchers,
                "ebayUrl": ebay_url,
                "lastSaleDate": last_sale or None,
            }
        )

    # Featured: in-stock, strongest sales + watchers
    ranked = sorted(
        [p for p in products if any(v["inventoryQuantity"] > 0 for v in p["variants"])],
        key=lambda p: (p["sold"] * 2 + p["watchers"], p["sold"]),
        reverse=True,
    )
    for p in ranked[:36]:
        p["featured"] = True
        if "bestsellers" not in p["collectionHandles"]:
            p["collectionHandles"].append("bestsellers")

    # Extra rare: high watchers, low inventory, not already tagged
    for p in products:
        inv = sum(v["inventoryQuantity"] for v in p["variants"])
        if p["watchers"] >= 25 and inv <= 4:
            if "rare" not in p["tags"]:
                p["tags"].append("rare")
            if "rare-finds" not in p["collectionHandles"]:
                p["collectionHandles"].append("rare-finds")

    products.sort(key=lambda p: (-p["featured"], -p["sold"], p["title"]))

    compact = []
    for p in products:
        vars_out = []
        for v in p["variants"]:
            row = {
                "id": v["id"],
                "title": v["title"],
                "price": v["price"],
                "inventoryQuantity": v["inventoryQuantity"],
            }
            sku = v.get("sku") or ""
            if sku and not sku.startswith(p["id"]):
                row["sku"] = sku
            if v.get("compareAtPrice"):
                row["compareAtPrice"] = v["compareAtPrice"]
            w = v.get("weight")
            if w and abs(w - 0.25) > 0.001:
                row["weight"] = w
            vars_out.append(row)
        extra_tags = [
            t
            for t in p["tags"]
            if t
            not in {
                p["productType"].lower().replace(" & ", "-").replace(" ", "-"),
                p["vendor"].lower(),
                "fragrance",
                "women",
                "men",
                "sold-out",
                "bestseller",
                "makeup",
                "skincare",
                "hair",
                "bath-&-body",
            }
        ]
        item = {
            "id": p["id"],
            "handle": p["handle"],
            "title": p["title"],
            "vendor": p["vendor"],
            "productType": p["productType"],
            "category": p["category"],
            "publishedAt": p["publishedAt"],
            "img": p["img"],
            "optionName": p["optionName"] if p["optionName"] != "Title" else None,
            "variants": vars_out,
            "sold": p["sold"],
            "watchers": p["watchers"],
        }
        if extra_tags:
            item["tags"] = extra_tags
        if p["featured"]:
            item["featured"] = True
        compact.append(item)

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(compact, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
    print(
        f"wrote {OUT_JSON}  products={len(compact)}  bytes={OUT_JSON.stat().st_size}  "
        f"featured={sum(1 for p in compact if p.get('featured'))}  "
        f"in_stock={sum(1 for p in compact if any(v['inventoryQuantity'] > 0 for v in p['variants']))}"
    )
    types = defaultdict(int)
    for p in products:
        types[p["productType"]] += 1
    print("types", dict(types))
    vendors = defaultdict(int)
    for p in products:
        vendors[p["vendor"]] += 1
    print("top vendors", sorted(vendors.items(), key=lambda kv: -kv[1])[:15])

    # Download images for hero + collections + og sources
    if (PUBLIC / "hero.jpg").exists() and (PUBLIC / "collections" / "fragrances.jpg").exists():
        print("skipping image download — covers already exist")
        return

    picks = {
        "hero": ranked[:8],
        "fragrances": [p for p in ranked if p["productType"] == "Fragrance"][:1],
        "makeup": [p for p in ranked if p["productType"] == "Makeup"][:1],
        "skincare": [p for p in ranked if p["productType"] == "Skincare"][:1],
        "rare": [p for p in products if "rare" in p["tags"] and p.get("img")][:1],
        "hair": [p for p in ranked if p["productType"] == "Hair"][:1],
        "bath": [p for p in ranked if p["productType"] == "Bath & Body"][:1],
    }

    hero_ims: list[Image.Image] = []
    og_dir = PUBLIC / "og-sources"
    og_dir.mkdir(parents=True, exist_ok=True)
    (PUBLIC / "collections").mkdir(parents=True, exist_ok=True)

    for p in picks["hero"]:
        url = p["img"]
        im = fetch_image(url)
        if im:
            hero_ims.append(im)
            im.save(og_dir / f"{p['id']}.jpg", "JPEG", quality=85)

    if hero_ims:
        compose_hero(hero_ims, PUBLIC / "hero.jpg")

    def save_cover(key: str, filename: str) -> None:
        plist = picks.get(key) or []
        if not plist:
            return
        url = plist[0]["img"]
        im = fetch_image(url)
        if not im:
            return
        cover = fit_cover(im, 1200, 900)
        cover.save(PUBLIC / "collections" / filename, "JPEG", quality=86, optimize=True)
        print("cover", filename, plist[0]["title"][:60])

    save_cover("fragrances", "fragrances.jpg")
    save_cover("makeup", "makeup.jpg")
    save_cover("skincare", "skincare.jpg")
    save_cover("rare", "rare.jpg")
    save_cover("hair", "hair.jpg")
    save_cover("bath", "bath.jpg")

    # lifestyle packing: reuse existing if present; otherwise a warm still from hero tiles
    if hero_ims:
        still = fit_cover(hero_ims[0], 1400, 900)
        (PUBLIC / "lifestyle").mkdir(exist_ok=True)
        still.save(PUBLIC / "lifestyle" / "packing.jpg", "JPEG", quality=86, optimize=True)


if __name__ == "__main__":
    main()
