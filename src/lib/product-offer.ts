import type { Product } from "@/lib/types";
import type { YesNo } from "@/lib/product-details";

export type OfferShippingMethod = {
  id: string;
  name: string;
  days: string;
  fee: string;
  enabled: boolean;
};

export type ProductOffer = {
  sku: string;
  amazonProductType: string;
  quantity: string;
  handlingTime: string;
  restockDate: string;
  yourPrice: string;
  mapPrice: string;
  minSellerPrice: string;
  maxSellerPrice: string;
  listPrice: string;
  salePrice: string;
  saleStartDate: string;
  saleEndDate: string;
  currencyConversion: YesNo;
  offeringReleaseDate: string;
  merchantReleaseDate: string;
  itemCondition: string;
  maxOrderQuantity: string;
  giftMessage: YesNo;
  giftWrap: YesNo;
  importDesignation: string;
  accessoriesCondition: string;
  functionalCondition: string;
  packagingCondition: string;
  renewedGrade: string;
  itemLength: string;
  itemWidth: string;
  itemHeight: string;
  itemDimUnit: "inches" | "centimeters";
  packageLength: string;
  packageWidth: string;
  packageHeight: string;
  packageDimUnit: "inches" | "centimeters";
  packageWeight: string;
  packageWeightUnit: "ounces" | "pounds" | "grams";
  masterPackLayers: string;
  masterPacksPerLayer: string;
  shippingMethods: OfferShippingMethod[];
};

export const AMAZON_PRODUCT_TYPES = [
  "COSMETIC",
  "COSMETIC_BRUSH",
  "LIPSTICK",
  "FOUNDATION",
  "MAKEUP",
  "PERFUME",
  "SKIN_CARE_PRODUCT",
  "HAIR_CARE",
  "BODY_LOTION",
  "BEAUTY",
] as const;

export const DEFAULT_SHIPPING: OfferShippingMethod[] = [
  { id: "standard", name: "Standard domestic", days: "3–5 business days", fee: "0.00", enabled: true },
  { id: "expedited", name: "Expedited domestic", days: "1–2 business days", fee: "12.95", enabled: true },
];

export function emptyProductOffer(): ProductOffer {
  return {
    sku: "",
    amazonProductType: "COSMETIC",
    quantity: "0",
    handlingTime: "5",
    restockDate: "",
    yourPrice: "",
    mapPrice: "",
    minSellerPrice: "",
    maxSellerPrice: "",
    listPrice: "",
    salePrice: "",
    saleStartDate: "",
    saleEndDate: "",
    currencyConversion: "no",
    offeringReleaseDate: "",
    merchantReleaseDate: "",
    itemCondition: "New",
    maxOrderQuantity: "",
    giftMessage: "yes",
    giftWrap: "no",
    importDesignation: "United States",
    accessoriesCondition: "",
    functionalCondition: "",
    packagingCondition: "",
    renewedGrade: "",
    itemLength: "",
    itemWidth: "",
    itemHeight: "",
    itemDimUnit: "inches",
    packageLength: "",
    packageWidth: "",
    packageHeight: "",
    packageDimUnit: "inches",
    packageWeight: "",
    packageWeightUnit: "pounds",
    masterPackLayers: "",
    masterPacksPerLayer: "",
    shippingMethods: DEFAULT_SHIPPING.map((m) => ({ ...m })),
  };
}

function amazonType(p: Product) {
  const t = p.title.toLowerCase();
  if (t.includes("brush")) return "COSMETIC_BRUSH";
  if (t.includes("lipstick") || t.includes("lip colour") || t.includes("lip color")) return "LIPSTICK";
  if (t.includes("foundation") || t.includes("stay-in-place") || t.includes("stayinplace")) return "FOUNDATION";
  switch (p.productType) {
    case "Fragrance":
      return "PERFUME";
    case "Skincare":
      return "SKIN_CARE_PRODUCT";
    case "Hair":
      return "HAIR_CARE";
    case "Bath & Body":
      return "BODY_LOTION";
    default:
      return "COSMETIC";
  }
}

function money(n: number) {
  return n.toFixed(2);
}

export function inferOffer(p: Product): ProductOffer {
  const v0 = p.variants[0];
  const price = Number.parseFloat(v0?.price ?? "0") || 0;
  const list = v0?.compareAtPrice ? Number.parseFloat(v0.compareAtPrice) || 0 : 0;
  const weight = v0?.weight ?? 0;
  const weightUnit = v0?.weightUnit === "lb" ? "pounds" : "ounces";
  const date = p.publishedAt.slice(0, 10);
  return {
    ...emptyProductOffer(),
    sku: v0?.sku ?? "",
    amazonProductType: amazonType(p),
    quantity: String(v0?.inventoryQuantity ?? 0),
    handlingTime: "5",
    yourPrice: v0?.price ?? "",
    mapPrice: price ? money(price * 0.95) : "",
    minSellerPrice: price ? money(price * 0.88) : "",
    maxSellerPrice: price ? money(price * 1.12) : "",
    listPrice: list ? money(list) : price ? money(price) : "",
    salePrice: list && list > price ? money(price) : "",
    offeringReleaseDate: date,
    merchantReleaseDate: date,
    itemCondition: p.notes?.[0] || "New",
    maxOrderQuantity: "12",
    importDesignation: "United States",
    itemLength: "3",
    itemWidth: "2",
    itemHeight: "5",
    packageLength: "4",
    packageWidth: "3",
    packageHeight: "6",
    packageWeight: weight ? String(weight) : "0.5",
    packageWeightUnit: weightUnit,
    shippingMethods: DEFAULT_SHIPPING.map((m) => ({ ...m })),
  };
}

export function withOffer<T extends { offer?: ProductOffer }>(draft: T): T & { offer: ProductOffer } {
  const base = emptyProductOffer();
  const incoming = draft.offer ?? ({} as Partial<ProductOffer>);
  const byId = new Map((incoming.shippingMethods ?? []).map((m) => [m.id, m]));
  const shippingMethods = DEFAULT_SHIPPING.map((m) => ({ ...m, ...byId.get(m.id) }));
  return { ...draft, offer: { ...base, ...incoming, shippingMethods } };
}
