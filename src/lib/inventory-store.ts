import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, ProductImage, ProductOption, ProductVariant } from "@/lib/types";
import { PRODUCTS, getCollection, getProductById, isBeautySet, isRare, productOnSale, productMinPrice, popularityScore } from "@/data/catalog";
import { generateSku } from "@/lib/sku";
import { slugify, uniqueId } from "@/lib/utils";
import { emptyProductDetails, inferDetails, withDetails, type ProductDetails } from "@/lib/product-details";
import { emptyProductOffer, inferOffer, withOffer, type ProductOffer } from "@/lib/product-offer";

export type ListingStatus = "active" | "draft" | "ended";

export type ListingDraft = {
  id: string;
  handle: string;
  title: string;
  subtitle: string;
  vendor: string;
  productType: string;
  category: string;
  tags: string[];
  status: ListingStatus;
  bodyHtml: string;
  condition: string;
  featured: boolean;
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  cost: string;
  shippingFee: string;
  floorPrice: string;
  ceilingPrice: string;
  bestOffer: boolean;
  volumePricing: boolean;
  sellAsLot: boolean;
  upToQty: boolean;
  connectCatalog: boolean;
  details: ProductDetails;
  offer: ProductOffer;
  copiedFrom?: string;
  updatedAt: string;
  publishedAt: string;
  sold: number;
  watchers: number;
  seoTitle: string;
  seoDescription: string;
  notes: string[];
  collectionHandles: string[];
};

export function productToDraft(p: Product): ListingDraft {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    subtitle: "",
    vendor: p.vendor,
    productType: p.productType,
    category: p.category ?? "",
    tags: [...p.tags],
    status: p.status === "ended" ? "ended" : p.status === "draft" ? "draft" : "active",
    bodyHtml: p.bodyHtml,
    condition: p.notes?.[0] ?? "New",
    featured: Boolean(p.featured),
    images: p.images.map((img) => ({ ...img })),
    options: p.options.map((o) => ({ ...o, values: [...o.values] })),
    variants: p.variants.map((v) => ({ ...v })),
    cost: "",
    shippingFee: "",
    floorPrice: "",
    ceilingPrice: "",
    bestOffer: false,
    volumePricing: false,
    sellAsLot: false,
    upToQty: false,
    connectCatalog: true,
    details: inferDetails(p),
    offer: inferOffer(p),
    updatedAt: p.publishedAt,
    publishedAt: p.publishedAt,
    sold: p.sold,
    watchers: p.watchers,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    notes: [...(p.notes ?? [])],
    collectionHandles: [...p.collectionHandles],
  };
}

export function draftToProduct(d: ListingDraft): Product {
  return {
    id: d.id,
    handle: d.handle,
    title: d.title,
    bodyHtml: d.bodyHtml,
    vendor: d.vendor,
    productType: d.productType,
    category: d.category,
    tags: d.tags,
    status: d.status,
    publishedAt: d.publishedAt,
    options: d.options,
    variants: d.variants.map((v, i) => {
      const o = d.offer;
      const base = {
        ...v,
        available: v.inventoryQuantity > 0 && d.status === "active",
      };
      if (i !== 0 || !o?.salePrice) return base;
      const now = Date.now();
      const start = o.saleStartDate ? Date.parse(o.saleStartDate) : 0;
      const end = o.saleEndDate ? Date.parse(`${o.saleEndDate}T23:59:59`) : Number.POSITIVE_INFINITY;
      if (Number.isNaN(start) || now < start || now > end) return base;
      return {
        ...base,
        price: o.salePrice,
        compareAtPrice: o.listPrice || o.yourPrice || v.compareAtPrice,
      };
    }),
    images: d.images,
    collectionHandles: d.collectionHandles,
    seoTitle: d.seoTitle || `${d.title} | Sol Beautiful`,
    seoDescription: d.seoDescription,
    featured: d.featured,
    notes: d.notes,
    sold: d.sold,
    watchers: d.watchers,
  };
}

export function emptyDraft(): ListingDraft {
  const id = uniqueId("lst");
  const sku = generateSku();
  const variantId = uniqueId("var");
  return {
    id,
    handle: id,
    title: "",
    subtitle: "",
    vendor: "",
    productType: "Makeup",
    category: "",
    tags: [],
    status: "draft",
    bodyHtml: "",
    condition: "New",
    featured: false,
    images: [],
    options: [{ name: "Title", values: ["Default"] }],
    variants: [
      {
        id: variantId,
        title: "Default",
        sku,
        price: "0.00",
        inventoryQuantity: 0,
        inventoryPolicy: "deny",
        weight: 0.25,
        weightUnit: "oz",
        available: false,
        taxable: true,
        requiresShipping: true,
      },
    ],
    cost: "",
    shippingFee: "",
    floorPrice: "",
    ceilingPrice: "",
    bestOffer: false,
    volumePricing: false,
    sellAsLot: false,
    upToQty: false,
    connectCatalog: true,
    details: emptyProductDetails(),
    offer: { ...emptyProductOffer(), sku },
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    sold: 0,
    watchers: 0,
    seoTitle: "",
    seoDescription: "",
    notes: [],
    collectionHandles: ["makeup"],
  };
}

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

interface InventoryState {
  custom: Record<string, ListingDraft>;
  deleted: string[];
  views: Record<string, number>;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  recordView: (handle: string) => void;
  getDraft: (id: string) => ListingDraft | undefined;
  saveDraft: (draft: ListingDraft) => void;
  patchQty: (productId: string, variantId: string, qty: number) => void;
  patchPrice: (productId: string, variantId: string, price: string) => void;
  setStatus: (productId: string, status: ListingStatus) => void;
  removeListing: (productId: string) => void;
  restoreListing: (productId: string) => void;
  copyAsTemplate: (productId: string) => ListingDraft;
}

function snapshot(id: string, custom: Record<string, ListingDraft>): ListingDraft | undefined {
  if (custom[id]) return hydrateDraft(structuredClone(custom[id]));
  const p = getProductById(id);
  return p ? hydrateDraft(productToDraft(p)) : undefined;
}

export function hydrateDraft(d: ListingDraft): ListingDraft {
  return withOffer(withDetails(d));
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      custom: {},
      deleted: [],
      views: {},
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      recordView: (handle) => {
        const views = { ...get().views, [handle]: (get().views[handle] ?? 0) + 1 };
        set({ views });
      },
      getDraft: (id) => {
        if (get().deleted.includes(id)) return undefined;
        return snapshot(id, get().custom);
      },
      saveDraft: (draft) => {
        const merged = hydrateDraft(draft);
        const title = merged.details.itemName.trim() || merged.title;
        const vendor = merged.details.brandName.trim() || merged.vendor;
        const handle = slugify(title) || merged.handle || merged.id;
        const description = merged.details.description.trim();
        const o = merged.offer;
        const next: ListingDraft = {
          ...merged,
          title,
          vendor,
          handle,
          bodyHtml: description ? `<p>${description}</p>` : merged.bodyHtml,
          condition: o.itemCondition || merged.condition,
          floorPrice: o.minSellerPrice || merged.floorPrice,
          ceilingPrice: o.maxSellerPrice || merged.ceilingPrice,
          shippingFee: o.shippingMethods.find((m) => m.id === "standard")?.fee ?? merged.shippingFee,
          collectionHandles: [typeHandle(merged.productType)],
          seoTitle: merged.seoTitle || `${title} | Sol Beautiful`,
          updatedAt: new Date().toISOString(),
          offer: {
            ...o,
            sku: o.sku || merged.variants[0]?.sku || "",
            yourPrice: o.yourPrice || merged.variants[0]?.price || "",
          },
          variants: merged.variants.map((v, i) => ({
            ...v,
            sku: i === 0 && o.sku ? o.sku : v.sku,
            price: i === 0 && o.yourPrice ? o.yourPrice : v.price,
            compareAtPrice: i === 0 ? o.listPrice || v.compareAtPrice : v.compareAtPrice,
            inventoryQuantity: i === 0 && o.quantity !== "" ? Math.max(0, Number(o.quantity) || 0) : v.inventoryQuantity,
            available: (i === 0 && o.quantity !== "" ? Math.max(0, Number(o.quantity) || 0) : v.inventoryQuantity) > 0 && merged.status === "active",
            barcode: merged.details.externalIdType !== "ASIN" && !v.barcode ? merged.details.externalId : v.barcode,
            weight: Number(merged.details.itemWeight) || v.weight,
            weightUnit: merged.details.itemWeightUnit === "pounds" ? "lb" : "oz",
          })),
        };
        set({ custom: { ...get().custom, [next.id]: next }, deleted: get().deleted.filter((x) => x !== next.id) });
      },
      patchQty: (productId, variantId, qty) => {
        const d = snapshot(productId, get().custom);
        if (!d) return;
        d.variants = d.variants.map((v) =>
          v.id === variantId ? { ...v, inventoryQuantity: Math.max(0, qty), available: qty > 0 && d.status === "active" } : v,
        );
        d.updatedAt = new Date().toISOString();
        set({ custom: { ...get().custom, [productId]: d } });
      },
      patchPrice: (productId, variantId, price) => {
        const d = snapshot(productId, get().custom);
        if (!d) return;
        d.variants = d.variants.map((v) => (v.id === variantId ? { ...v, price } : v));
        d.updatedAt = new Date().toISOString();
        set({ custom: { ...get().custom, [productId]: d } });
      },
      setStatus: (productId, status) => {
        const d = snapshot(productId, get().custom);
        if (!d) return;
        d.status = status;
        d.updatedAt = new Date().toISOString();
        d.variants = d.variants.map((v) => ({ ...v, available: v.inventoryQuantity > 0 && status === "active" }));
        set({ custom: { ...get().custom, [productId]: d } });
      },
      removeListing: (productId) => {
        const custom = { ...get().custom };
        delete custom[productId];
        set({ custom, deleted: [...new Set([...get().deleted, productId])] });
      },
      restoreListing: (productId) => {
        set({ deleted: get().deleted.filter((x) => x !== productId) });
      },
      copyAsTemplate: (productId) => {
        const src = snapshot(productId, get().custom);
        if (!src) return emptyDraft();
        const id = uniqueId("lst");
        const draft: ListingDraft = {
          ...structuredClone(src),
          id,
          handle: `${src.handle}-copy`,
          title: src.title ? `${src.title} (copy)` : "",
          status: "draft",
          sold: 0,
          watchers: 0,
          copiedFrom: src.id,
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          images: src.images.map((img, i) => ({ ...img, id: uniqueId("img"), position: i + 1 })),
          variants: src.variants.map((v) => ({
            ...v,
            id: uniqueId("var"),
            sku: generateSku(),
            inventoryQuantity: 0,
            available: false,
          })),
        };
        draft.offer = { ...hydrateDraft(draft).offer, sku: draft.variants[0]?.sku ?? generateSku(), quantity: "0" };
        set({ custom: { ...get().custom, [id]: draft } });
        return draft;
      },
    }),
    {
      name: "sol-beautiful-inventory-v1",
      partialize: (s) => ({ custom: s.custom, deleted: s.deleted, views: s.views }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);

export function warehouseOf(p: Product) {
  return p.variants.reduce((s, v) => s + (v.inventoryQuantity || 0), 0);
}

export function minPriceOf(p: Product) {
  return Math.min(...p.variants.map((v) => Number.parseFloat(v.price) || 0));
}

/** Merge catalog + house edits. Cheap: only clones rows that actually changed. */
export function listManagedProducts(state: Pick<InventoryState, "custom" | "deleted">): Product[] {
  const deleted = new Set(state.deleted);
  const out: Product[] = [];
  const seen = new Set<string>();
  for (const p of PRODUCTS) {
    if (deleted.has(p.id)) continue;
    const d = state.custom[p.id];
    out.push(d ? draftToProduct(d) : p);
    seen.add(p.id);
  }
  for (const d of Object.values(state.custom)) {
    if (seen.has(d.id) || deleted.has(d.id)) continue;
    out.push(draftToProduct(d));
  }
  return out;
}

export function liveGetProductById(id: string) {
  const { custom, deleted } = useInventoryStore.getState();
  if (deleted.includes(id)) return undefined;
  const d = custom[id];
  if (d) return draftToProduct(d);
  return getProductById(id);
}

export function liveGetProduct(handle: string) {
  const { custom, deleted } = useInventoryStore.getState();
  for (const d of Object.values(custom)) {
    if (d.handle === handle && !deleted.includes(d.id)) return draftToProduct(d);
  }
  const p = PRODUCTS.find((x) => x.handle === handle);
  if (!p || deleted.includes(p.id)) return undefined;
  const d = custom[p.id];
  return d ? draftToProduct(d) : p;
}

export function liveProductsForCollection(handle: string) {
  const { custom, deleted } = useInventoryStore.getState();
  const products = listManagedProducts({ custom, deleted }).filter((p) => p.status === "active");
  const col = getCollection(handle);
  if (!col) return [];
  switch (col.rule) {
    case "all":
      return products;
    case "featured":
      return products.filter((p) => p.featured);
    case "popular":
      return [...products].sort((a, b) => popularityScore(b) - popularityScore(a));
    case "low":
      return products.filter((p) => {
        const q = warehouseOf(p);
        return q > 0 && q <= 5;
      });
    case "rare":
      return products.filter(isRare);
    case "sets":
      return products.filter(isBeautySet);
    case "sale":
      return products.filter(productOnSale);
    case "type":
      return products.filter((p) => p.productType === col.ruleValue);
    case "tag":
      return products.filter((p) => p.tags.includes(col.ruleValue ?? ""));
    case "price-max":
      return products.filter((p) => productMinPrice(p) < Number(col.ruleValue));
    default:
      return products.filter((p) => p.collectionHandles.includes(handle));
  }
}

export function liveSearch(query: string) {
  const { custom, deleted } = useInventoryStore.getState();
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const parts = q.split(/\s+/).filter(Boolean);
  return listManagedProducts({ custom, deleted })
    .filter((p) => p.status === "active")
    .filter((p) => {
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
