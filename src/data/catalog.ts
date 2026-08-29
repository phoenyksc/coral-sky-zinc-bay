import type { Collection, Product, ProductVariant, Review } from "@/lib/types";
import rawListings from "./listings.json";
import barcodes from "./barcodes.json";

interface RawVariant {
  id: string;
  title: string;
  sku?: string;
  price: string;
  compareAtPrice?: string;
  inventoryQuantity: number;
  weight?: number;
}

interface RawListing {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  category: string;
  tags?: string[];
  publishedAt: string;
  featured?: boolean;
  img: string;
  optionName?: string | null;
  variants: RawVariant[];
  sold: number;
  watchers: number;
}

const BARCODES = barcodes as Record<string, string>;

function typeHandle(productType: string) {
  switch (productType) {
    case "Fragrance":
      return "fragrances";
    case "Skincare":
      return "skincare";
    case "Hair":
      return "hair";
    case "Bath & Body":
      return "bath-body";
    default:
      return "makeup";
  }
}

function hydrateVariant(raw: RawVariant, itemId: string, index: number): ProductVariant {
  const qty = raw.inventoryQuantity ?? 0;
  const barcode = BARCODES[raw.id] || BARCODES[`${itemId}|${raw.title}`];
  return {
    id: raw.id,
    title: raw.title,
    sku: raw.sku || `${itemId}-${index + 1}`,
    barcode: barcode || undefined,
    price: raw.price,
    compareAtPrice: raw.compareAtPrice,
    inventoryQuantity: qty,
    inventoryPolicy: "deny",
    option1: raw.title === "Default" ? undefined : raw.title,
    weight: raw.weight ?? 0.25,
    weightUnit: "oz",
    available: qty > 0,
    taxable: true,
    requiresShipping: true,
  };
}

function conditionCopy(tags: string[]) {
  if (tags.includes("new-in-box")) return "New in box";
  if (tags.includes("new-in-package")) return "New in package";
  if (tags.includes("sealed")) return "Factory sealed";
  if (tags.includes("unboxed")) return "New, unboxed";
  return "Authentic designer stock";
}

function hydrate(raw: RawListing): Product {
  const tags = [...(raw.tags ?? [])];
  const variants = raw.variants.map((v, i) => hydrateVariant(v, raw.id, i));
  const optionName = raw.optionName || (variants.length > 1 ? "Option" : "Title");
  const optionValues = variants.map((v) => v.option1 || v.title);
  const collections = new Set<string>([typeHandle(raw.productType)]);
  if (tags.includes("rare") || tags.includes("discontinued") || tags.includes("hard-to-find")) {
    collections.add("rare-finds");
  }
  if (raw.featured) collections.add("bestsellers");
  if (variants.some((v) => v.compareAtPrice && Number(v.compareAtPrice) > Number(v.price))) {
    collections.add("sale");
  }
  const min = Math.min(...variants.map((v) => Number.parseFloat(v.price)));
  if (min < 20) collections.add("under-20");

  const cond = conditionCopy(tags);
  const soldLine = raw.sold > 0 ? `<p>${raw.sold.toLocaleString()} sold — a formula people come back for.</p>` : "";
  const rareLine =
    tags.includes("discontinued") || tags.includes("rare")
      ? "<p><strong>Hard to find.</strong> When this one sells out, it is gone.</p>"
      : "";
  const upcLine = variants.some((v) => v.barcode)
    ? "<p>Manufacturer UPC is listed on each shade we have verified — a check against the authentic counter formula.</p>"
    : "";

  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    vendor: raw.vendor,
    productType: raw.productType,
    category: raw.category,
    tags,
    status: "active",
    publishedAt: raw.publishedAt,
    featured: Boolean(raw.featured),
    collectionHandles: [...collections],
    seoTitle: `${raw.title} | Sol Beautiful`,
    seoDescription: `Authentic ${raw.vendor} ${raw.productType.toLowerCase()} from Sol Beautiful — ${raw.title}. Packed in Fountain Valley, CA and shipped from the USA.`,
    bodyHtml: `<p>Authentic ${raw.vendor} ${raw.productType.toLowerCase()} from Sol Beautiful — chosen for the formula, the ritual, and how it actually wears.</p><p>${cond}. Packed in Fountain Valley, California and shipped from the United States.</p>${upcLine}${rareLine}${soldLine}`,
    images: [
      {
        id: `img-${raw.id}`,
        src: raw.img,
        alt: raw.title,
        position: 1,
      },
    ],
    options: [{ name: optionName, values: optionValues }],
    variants,
    sold: raw.sold,
    watchers: raw.watchers,
  };
}

export const PRODUCTS: Product[] = (rawListings as RawListing[]).map(hydrate);

const byHandle = new Map(PRODUCTS.map((p) => [p.handle, p]));
const byId = new Map(PRODUCTS.map((p) => [p.id, p]));

export const COLLECTIONS: Collection[] = [
  {
    id: "col-fragrances",
    handle: "fragrances",
    title: "Fragrances",
    description: "Designer eau de parfum, cologne, and minis — current, discontinued, and the bottles people still hunt for.",
    image: "/collections/fragrances.jpg",
    rule: "type",
    ruleValue: "Fragrance",
  },
  {
    id: "col-makeup",
    handle: "makeup",
    title: "Makeup",
    description: "Lip, eye, and complexion from MAC, Too Faced, Estée Lauder, Lancôme, Clinique, and more.",
    image: "/collections/makeup.jpg",
    rule: "type",
    ruleValue: "Makeup",
  },
  {
    id: "col-skincare",
    handle: "skincare",
    title: "Skincare",
    description: "Serums, creams, and cleansers — formulas we love for the ritual of taking care of skin.",
    image: "/collections/skincare.jpg",
    rule: "type",
    ruleValue: "Skincare",
  },
  {
    id: "col-hair",
    handle: "hair",
    title: "Hair",
    description: "Salon formulas — Bumble and Bumble, Aveda, and the rest of the wash-and-style cabinet.",
    image: "/collections/hair.jpg",
    rule: "type",
    ruleValue: "Hair",
  },
  {
    id: "col-bath",
    handle: "bath-body",
    title: "Bath & body",
    description: "Hand creams, washes, and body lotions for after the bath.",
    image: "/collections/bath.jpg",
    rule: "type",
    ruleValue: "Bath & Body",
  },
  {
    id: "col-rare",
    handle: "rare-finds",
    title: "Hard to find",
    description: "Discontinued, allocated, and low-run pieces. When they sell out, they are gone.",
    image: "/collections/rare.jpg",
    rule: "rare",
  },
  {
    id: "col-low",
    handle: "low-inventory",
    title: "Low inventory",
    description: "Fewer than six in the warehouse. When the last one leaves, it may not come back.",
    image: "/collections/skincare.jpg",
    rule: "low",
  },
  {
    id: "col-best",
    handle: "bestsellers",
    title: "Bestsellers",
    description: "What people actually reorder — the bottles and palettes we restock when we can.",
    image: "/collections/fragrances.jpg",
    rule: "featured",
  },
  {
    id: "col-popular",
    handle: "popular",
    title: "Popular",
    description: "The pieces people buy and watch most — sales and attention, ranked together.",
    image: "/collections/makeup.jpg",
    rule: "popular",
  },
  {
    id: "col-sets",
    handle: "beauty-sets",
    title: "Beauty Sets",
    description: "Kits, vaults, coffrets, and gift sets — more than one piece, chosen to live together.",
    image: "/collections/makeup.jpg",
    rule: "sets",
  },
  {
    id: "col-sale",
    handle: "sale",
    title: "On sale",
    description: "Compare-at pricing on authentic designer stock.",
    image: "/collections/makeup.jpg",
    rule: "sale",
  },
  {
    id: "col-value",
    handle: "under-20",
    title: "Under $20",
    description: "Travel sizes, minis, and small luxuries under twenty dollars.",
    image: "/collections/skincare.jpg",
    rule: "price-max",
    ruleValue: "20",
  },
  {
    id: "col-all",
    handle: "all",
    title: "Shop all",
    description: "The full vault of fragrance, makeup, and skincare — for the love of beauty, packed in California.",
    image: "/hero.jpg",
    rule: "all",
  },
];

const FEATURED_HANDLES = PRODUCTS.filter((p) => p.featured).map((p) => p.handle);

export const REVIEWS: Review[] = [
  {
    id: "r1",
    productHandle: FEATURED_HANDLES[0] ?? "",
    author: "Marisol K.",
    rating: 5,
    title: "Sealed and honest",
    body: "Batch looked right, packed like a gift. The scent opened exactly as it should.",
    date: "2026-06-12",
    verified: true,
  },
  {
    id: "r2",
    productHandle: FEATURED_HANDLES[1] ?? "",
    author: "Diane P.",
    rating: 5,
    title: "Landed in two days",
    body: "Packed from SoCal, no leaks, authentic cap and juice color. Will order again.",
    date: "2026-05-28",
    verified: true,
  },
  {
    id: "r3",
    productHandle: FEATURED_HANDLES[2] ?? "",
    author: "Priya S.",
    rating: 5,
    title: "Better than the mall",
    body: "Same box as the counter, less money, and they actually had the shade in stock.",
    date: "2026-07-02",
    verified: true,
  },
  {
    id: "r4",
    productHandle: FEATURED_HANDLES[3] ?? "",
    author: "Jen A.",
    rating: 5,
    title: "The original",
    body: "Hard-to-find done right. Unused, unopened, the original formula.",
    date: "2026-04-19",
    verified: true,
  },
  {
    id: "r5",
    productHandle: FEATURED_HANDLES[4] ?? "",
    author: "Elena R.",
    rating: 4,
    title: "As pictured",
    body: "Photo matched what arrived. Wrapped well. Shade was exact.",
    date: "2026-06-30",
    verified: true,
  },
  {
    id: "r6",
    productHandle: FEATURED_HANDLES[5] ?? "",
    author: "Cathy W.",
    rating: 5,
    title: "My repurchase",
    body: "Fast, honest, no drama. Ships from the USA and the UPC on the shade matched.",
    date: "2026-07-18",
    verified: true,
  },
].filter((r) => r.productHandle);

export function getProduct(handle: string) {
  return byHandle.get(handle);
}

export function getProductById(id: string) {
  return byId.get(id);
}

export function getVariant(product: Product, variantId: string) {
  return product.variants.find((v) => v.id === variantId);
}

export function getCollection(handle: string) {
  return COLLECTIONS.find((c) => c.handle === handle);
}

export function productMinPrice(product: Product) {
  return Math.min(...product.variants.map((v) => Number.parseFloat(v.price)));
}

export function warehouseQty(product: Product) {
  return product.variants.reduce((sum, v) => sum + (v.inventoryQuantity || 0), 0);
}

/** Less than 6 units remaining in the warehouse. */
export const LOW_INVENTORY_MAX = 5;

export function isLowInventory(product: Product) {
  const qty = warehouseQty(product);
  return qty > 0 && qty <= LOW_INVENTORY_MAX;
}

export function isLowVariant(variant: ProductVariant) {
  return variant.inventoryQuantity > 0 && variant.inventoryQuantity <= LOW_INVENTORY_MAX;
}

export function productOnSale(product: Product) {
  return product.variants.some(
    (v) => v.compareAtPrice && Number.parseFloat(v.compareAtPrice) > Number.parseFloat(v.price),
  );
}

export function isRare(product: Product) {
  return product.tags.includes("rare") || product.tags.includes("discontinued") || product.tags.includes("hard-to-find");
}

function inStock(product: Product) {
  return product.variants.some((v) => v.available);
}

/** Sales weigh heavier than watchers; both feed the Popular rail. */
export function popularityScore(product: Product) {
  return product.sold * 3 + product.watchers;
}

/** Interleave most-sold and most-watched so both signals cycle into the rail. */
export function popularProducts() {
  const stocked = PRODUCTS.filter(inStock);
  const bySold = [...stocked].sort((a, b) => b.sold - a.sold || b.watchers - a.watchers);
  const byViewed = [...stocked].sort((a, b) => b.watchers - a.watchers || b.sold - a.sold);
  const seen = new Set<string>();
  const mixed: Product[] = [];
  const n = Math.max(bySold.length, byViewed.length);
  for (let i = 0; i < n; i++) {
    const a = bySold[i];
    const b = byViewed[i];
    if (a && !seen.has(a.id)) {
      seen.add(a.id);
      mixed.push(a);
    }
    if (b && !seen.has(b.id)) {
      seen.add(b.id);
      mixed.push(b);
    }
  }
  return mixed;
}

export function rareProducts() {
  return PRODUCTS.filter((p) => isRare(p) && inStock(p)).sort((a, b) => popularityScore(b) - popularityScore(a));
}

export function lowInventoryProducts() {
  return PRODUCTS.filter(isLowInventory).sort(
    (a, b) => warehouseQty(a) - warehouseQty(b) || popularityScore(b) - popularityScore(a),
  );
}

const SET_FALSE = /\b(jet set|set and refresh|set \+ blur|set it clear|brow set)\b/i;
const SET_STRONG = /\b(gift set|coffret|vault|look in a box)\b/i;
const SET_COUNT = /\b(\d+)\s*-?\s*(pc|pcs|piece|pieces)\b/i;
const SET_WORD = /\b(set|kit)\b/i;
const SET_SINGLE = /\b1\s*-?\s*(pc|pcs|piece)\b/i;

export function isBeautySet(product: Product) {
  const title = product.title;
  if (SET_FALSE.test(title)) return false;
  if (SET_SINGLE.test(title) && !SET_WORD.test(title) && !SET_STRONG.test(title)) return false;
  if (SET_STRONG.test(title)) return true;
  const count = title.match(SET_COUNT);
  if (count && Number(count[1]) >= 2) return true;
  return SET_WORD.test(title);
}

export function beautySetProducts() {
  return PRODUCTS.filter((p) => isBeautySet(p) && inStock(p)).sort((a, b) => popularityScore(b) - popularityScore(a));
}

export const POPULAR = popularProducts();
export const RARE_IN_STOCK = rareProducts();
export const LOW_STOCK = lowInventoryProducts();
export const BEAUTY_SETS = beautySetProducts();

export function productsForCollection(handle: string) {
  const col = getCollection(handle);
  if (!col) return [];
  switch (col.rule) {
    case "all":
      return PRODUCTS;
    case "featured":
      return PRODUCTS.filter((p) => p.featured);
    case "popular":
      return POPULAR;
    case "low":
      return LOW_STOCK;
    case "rare":
      return RARE_IN_STOCK;
    case "sets":
      return BEAUTY_SETS;
    case "sale":
      return PRODUCTS.filter(productOnSale);
    case "type":
      return PRODUCTS.filter((p) => p.productType === col.ruleValue);
    case "tag":
      return PRODUCTS.filter((p) => p.tags.includes(col.ruleValue ?? ""));
    case "price-max":
      return PRODUCTS.filter((p) => productMinPrice(p) < Number(col.ruleValue));
    default:
      return PRODUCTS.filter((p) => p.collectionHandles.includes(handle));
  }
}

export function relatedProducts(product: Product, limit = 4) {
  const sameVendor = PRODUCTS.filter((p) => p.id !== product.id && p.vendor === product.vendor && p.vendor !== "Sol Beautiful");
  return (sameVendor.length >= limit
    ? sameVendor
    : PRODUCTS.filter((p) => p.id !== product.id && p.productType === product.productType)
  ).slice(0, limit);
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const parts = q.split(/\s+/).filter(Boolean);
  return PRODUCTS.filter((p) => {
    const hay = [
      p.title,
      p.vendor,
      p.productType,
      p.category ?? "",
      p.tags.join(" "),
      ...p.variants.map((v) => `${v.sku} ${v.barcode ?? ""} ${v.title}`),
    ]
      .join(" ")
      .toLowerCase();
    return parts.every((part) => hay.includes(part));
  });
}

export function reviewsFor(handle: string) {
  return REVIEWS.filter((r) => r.productHandle === handle);
}

export function averageRating(handle: string) {
  const list = reviewsFor(handle);
  if (!list.length) return null;
  return list.reduce((s, r) => s + r.rating, 0) / list.length;
}

const vendorCounts = new Map<string, number>();
for (const p of PRODUCTS) vendorCounts.set(p.vendor, (vendorCounts.get(p.vendor) ?? 0) + 1);
export const VENDORS = [...vendorCounts.keys()].sort((a, b) => a.localeCompare(b));
export const TOP_VENDORS = [...vendorCounts.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .slice(0, 22)
  .map(([name]) => name);

export const CATALOG_STATS = {
  products: PRODUCTS.length,
  variants: PRODUCTS.reduce((s, p) => s + p.variants.length, 0),
  inStock: PRODUCTS.filter((p) => p.variants.some((v) => v.available)).length,
  sold: PRODUCTS.reduce((s, p) => s + p.sold, 0),
};
