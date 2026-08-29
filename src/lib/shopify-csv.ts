import { PRODUCTS } from "@/data/catalog";
import type { Product } from "@/lib/types";

const HEADERS = [
  "Handle",
  "Title",
  "Body (HTML)",
  "Vendor",
  "Product Category",
  "Type",
  "Tags",
  "Published",
  "Option1 Name",
  "Option1 Value",
  "Option2 Name",
  "Option2 Value",
  "Option3 Name",
  "Option3 Value",
  "Variant SKU",
  "Variant Grams",
  "Variant Inventory Tracker",
  "Variant Inventory Qty",
  "Variant Inventory Policy",
  "Variant Fulfillment Service",
  "Variant Price",
  "Variant Compare At Price",
  "Variant Requires Shipping",
  "Variant Taxable",
  "Variant Barcode",
  "Image Src",
  "Image Position",
  "Image Alt Text",
  "Gift Card",
  "SEO Title",
  "SEO Description",
  "Variant Weight Unit",
  "Cost per item",
  "Status",
] as const;

function csvEscape(value: string | number | undefined | null): string {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function grams(weightOz: number) {
  return Math.round(weightOz * 28.3495);
}

/** Shopify allows 100 variants per product. Extra shades become a continuation listing. */
const MAX_VARIANTS = 100;

export function splitForShopify(product: Product): Product[] {
  if (product.variants.length <= MAX_VARIANTS) return [product];
  const out: Product[] = [];
  for (let i = 0; i < product.variants.length; i += MAX_VARIANTS) {
    const part = Math.floor(i / MAX_VARIANTS) + 1;
    const variants = product.variants.slice(i, i + MAX_VARIANTS);
    out.push({
      ...product,
      id: part === 1 ? product.id : `${product.id}-p${part}`,
      handle: part === 1 ? product.handle : `${product.handle}-${part}`,
      title: part === 1 ? product.title : `${product.title} · more shades`,
      variants,
      options: [{ name: product.options[0]?.name ?? "Option", values: variants.map((v) => v.option1 || v.title) }],
    });
  }
  return out;
}

export function productToShopifyRows(product: Product): string[][] {
  const rows: string[][] = [];
  product.variants.forEach((variant, index) => {
    const isFirst = index === 0;
    const image = product.images[0];
    rows.push([
      product.handle,
      isFirst ? product.title : "",
      isFirst ? product.bodyHtml : "",
      isFirst ? product.vendor : "",
      isFirst ? (product.productType === "Fragrance" ? "Health & Beauty > Personal Care > Fragrances" : "Health & Beauty > Personal Care") : "",
      isFirst ? product.productType : "",
      isFirst ? product.tags.join(", ") : "",
      isFirst ? "TRUE" : "",
      isFirst ? (product.options[0]?.name ?? "Title") : "",
      variant.option1 ?? variant.title,
      "",
      "",
      "",
      "",
      variant.sku,
      String(grams(variant.weight)),
      "shopify",
      String(variant.inventoryQuantity),
      variant.inventoryPolicy,
      "manual",
      variant.price,
      variant.compareAtPrice ?? "",
      variant.requiresShipping ? "TRUE" : "FALSE",
      variant.taxable ? "TRUE" : "FALSE",
      variant.barcode ?? "",
      isFirst && image ? image.src : "",
      isFirst && image ? String(image.position) : "",
      isFirst && image ? image.alt : "",
      isFirst ? "FALSE" : "",
      isFirst ? product.seoTitle : "",
      isFirst ? product.seoDescription : "",
      variant.weightUnit,
      "",
      isFirst ? product.status : "",
    ]);
  });
  product.images.slice(1).forEach((image) => {
    rows.push([
      product.handle,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      image.src,
      String(image.position),
      image.alt,
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
  });
  return rows;
}

export function toShopifyCsv(products: Product[] = PRODUCTS): string {
  const lines = [HEADERS.join(",")];
  for (const product of products.flatMap(splitForShopify)) {
    for (const row of productToShopifyRows(product)) {
      lines.push(row.map(csvEscape).join(","));
    }
  }
  return lines.join("\n");
}

export function toShopifyJson(products: Product[] = PRODUCTS) {
  return products.map((p) => ({
    id: p.id,
    handle: p.handle,
    title: p.title,
    body_html: p.bodyHtml,
    vendor: p.vendor,
    product_type: p.productType,
    tags: p.tags.join(", "),
    status: p.status,
    published_at: p.publishedAt,
    options: p.options.map((o, i) => ({ name: o.name, position: i + 1, values: o.values })),
    variants: p.variants.map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      barcode: v.barcode,
      price: v.price,
      compare_at_price: v.compareAtPrice ?? null,
      inventory_quantity: v.inventoryQuantity,
      inventory_policy: v.inventoryPolicy,
      option1: v.option1 ?? null,
      option2: v.option2 ?? null,
      option3: v.option3 ?? null,
      weight: v.weight,
      weight_unit: v.weightUnit,
      taxable: v.taxable,
      requires_shipping: v.requiresShipping,
    })),
    images: p.images.map((img) => ({
      id: img.id,
      src: img.src,
      alt: img.alt,
      position: img.position,
    })),
  }));
}

export function downloadText(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
