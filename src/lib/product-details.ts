import type { Product } from "@/lib/types";
import { slugify } from "@/lib/utils";

export type YesNo = "yes" | "no";

export type ProductDetails = {
  customizations: YesNo;
  itemName: string;
  itemHighlight: string;
  brandName: string;
  externalIdType: "ASIN" | "UPC" | "EAN" | "GTIN";
  externalId: string;
  itemTypeKeyword: string;
  targetAudienceKeyword: string;
  manufacturer: string;
  fulfilledFromOrigin: YesNo;
  description: string;
  bullets: string[];
  genericKeyword: string;
  specialFeatures: string;
  lifestyle: string;
  materialType: string;
  materialFeature: string;
  handleMaterial: string;
  bristleMaterial: string;
  ferruleMaterial: string;
  numberOfItems: string;
  itemPackageQuantity: string;
  numberOfPieces: string;
  size: string;
  numberOfPacks: string;
  setName: string;
  color: string;
  colorMap: string;
  itemForm: string;
  unitCount: string;
  unitCountType: string;
  siteLaunchDate: string;
  heatSensitive: YesNo;
  recommendedUses: string;
  governmentContractName: string;
  governmentContractNumber: string;
  itemWeight: string;
  itemWeightUnit: "ounces" | "pounds" | "grams";
};

export function emptyProductDetails(): ProductDetails {
  return {
    customizations: "no",
    itemName: "",
    itemHighlight: "",
    brandName: "",
    externalIdType: "ASIN",
    externalId: "",
    itemTypeKeyword: "",
    targetAudienceKeyword: "unisex-adult",
    manufacturer: "",
    fulfilledFromOrigin: "yes",
    description: "",
    bullets: ["", "", "", "", ""],
    genericKeyword: "",
    specialFeatures: "",
    lifestyle: "Premium Beauty",
    materialType: "",
    materialFeature: "",
    handleMaterial: "",
    bristleMaterial: "",
    ferruleMaterial: "",
    numberOfItems: "1",
    itemPackageQuantity: "1",
    numberOfPieces: "1",
    size: "",
    numberOfPacks: "1",
    setName: "",
    color: "",
    colorMap: "",
    itemForm: "",
    unitCount: "1.0",
    unitCountType: "Count",
    siteLaunchDate: "",
    heatSensitive: "no",
    recommendedUses: "",
    governmentContractName: "",
    governmentContractNumber: "",
    itemWeight: "",
    itemWeightUnit: "ounces",
  };
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function formForType(type: string) {
  switch (type) {
    case "Fragrance":
      return "Spray";
    case "Skincare":
      return "Cream";
    case "Hair":
      return "Liquid";
    case "Bath & Body":
      return "Lotion";
    default:
      return "Wand";
  }
}

function usesForType(type: string) {
  switch (type) {
    case "Fragrance":
      return "Personal fragrance";
    case "Skincare":
      return "Daily skincare";
    case "Hair":
      return "Hair care";
    case "Bath & Body":
      return "Body care";
    default:
      return "Makeup";
  }
}

export function inferDetails(p: Product): ProductDetails {
  const v0 = p.variants[0];
  const shade = v0 && v0.title !== "Default" ? v0.title : "";
  const weight = v0?.weight ? String(v0.weight) : "";
  const unit = v0?.weightUnit === "lb" ? "pounds" : "ounces";
  const desc = stripHtml(p.bodyHtml);
  const bullets = [
    p.vendor ? `Authentic ${p.vendor}` : "",
    p.productType ? `${p.productType} from Sol Beautiful` : "",
    "Ships from the USA",
    shade ? `Shade / size: ${shade}` : "",
    v0?.barcode ? `Manufacturer UPC ${v0.barcode}` : "",
  ];
  return {
    ...emptyProductDetails(),
    itemName: p.title,
    itemHighlight: p.seoDescription?.slice(0, 200) ?? "",
    brandName: p.vendor,
    manufacturer: p.vendor,
    externalIdType: v0?.barcode ? "UPC" : "ASIN",
    externalId: v0?.barcode ?? "",
    itemTypeKeyword: slugify(p.category || p.productType) || "makeup",
    targetAudienceKeyword: "unisex-adult",
    fulfilledFromOrigin: "yes",
    description: desc,
    bullets,
    genericKeyword: p.tags.join(" "),
    lifestyle: p.productType === "Fragrance" || p.featured ? "Premium Beauty" : "Mass Beauty",
    size: shade,
    color: shade,
    colorMap: shade,
    itemForm: formForType(p.productType),
    unitCount: "1.0",
    unitCountType: p.productType === "Fragrance" ? "Fl Oz" : "Count",
    siteLaunchDate: p.publishedAt.slice(0, 10),
    heatSensitive: p.productType === "Fragrance" ? "yes" : "no",
    recommendedUses: usesForType(p.productType),
    itemWeight: weight,
    itemWeightUnit: unit,
  };
}

export function withDetails<T extends { details?: ProductDetails }>(draft: T): T & { details: ProductDetails } {
  const base = emptyProductDetails();
  const incoming = draft.details ?? ({} as Partial<ProductDetails>);
  const bullets = [...(incoming.bullets ?? []), "", "", "", "", ""].slice(0, 5);
  return { ...draft, details: { ...base, ...incoming, bullets } };
}
