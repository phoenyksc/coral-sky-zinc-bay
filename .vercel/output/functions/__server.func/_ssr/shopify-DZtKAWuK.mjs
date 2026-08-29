import { _ as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as PRODUCTS, I as Button, S as COLLECTIONS, x as CATALOG_STATS } from "./router-oaCZX-Pv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shopify-DZtKAWuK.js
var import_jsx_runtime = require_jsx_runtime();
var HEADERS = [
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
	"Status"
];
function csvEscape(value) {
	const s = value == null ? "" : String(value);
	if (/[",\n]/.test(s)) return `"${s.replace(/"/g, "\"\"")}"`;
	return s;
}
function grams(weightOz) {
	return Math.round(weightOz * 28.3495);
}
function productToShopifyRows(product) {
	const rows = [];
	product.variants.forEach((variant, index) => {
		const isFirst = index === 0;
		const image = product.images[0];
		rows.push([
			product.handle,
			isFirst ? product.title : "",
			isFirst ? product.bodyHtml : "",
			isFirst ? product.vendor : "",
			isFirst ? product.productType === "Fragrance" ? "Health & Beauty > Personal Care > Fragrances" : "Health & Beauty > Personal Care" : "",
			isFirst ? product.productType : "",
			isFirst ? product.tags.join(", ") : "",
			isFirst ? "TRUE" : "",
			isFirst ? product.options[0]?.name ?? "Title" : "",
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
			isFirst ? product.status : ""
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
			""
		]);
	});
	return rows;
}
function toShopifyCsv(products = PRODUCTS) {
	const lines = [HEADERS.join(",")];
	for (const product of products) for (const row of productToShopifyRows(product)) lines.push(row.map(csvEscape).join(","));
	return lines.join("\n");
}
function toShopifyJson(products = PRODUCTS) {
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
		options: p.options.map((o, i) => ({
			name: o.name,
			position: i + 1,
			values: o.values
		})),
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
			requires_shipping: v.requiresShipping
		})),
		images: p.images.map((img) => ({
			id: img.id,
			src: img.src,
			alt: img.alt,
			position: img.position
		}))
	}));
}
function downloadText(filename, contents, mime) {
	const blob = new Blob([contents], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function ShopifyPage() {
	const sample = PRODUCTS.filter((p) => p.featured).slice(0, 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-3xl px-4 py-14 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] tracking-[0.18em] text-muted-foreground uppercase",
				children: "Catalog · import"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-5xl",
				children: "Shopify-ready from day one"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm leading-relaxed text-muted-foreground",
				children: "Sol Beautiful uses Shopify’s product shape — handles, variants, SKUs, vendors, collection rules — so this catalog can sell here now and import into Shopify Admin later. Images are photographs of the actual pieces."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mt-10 grid grid-cols-3 gap-3 text-center",
				children: [
					[CATALOG_STATS.products.toLocaleString(), "Products"],
					[CATALOG_STATS.variants.toLocaleString(), "Variants"],
					[String(COLLECTIONS.length), "Collections"]
				].map(([n, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-card px-3 py-5 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl tabular-nums",
						children: n
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[11px] tracking-[0.14em] text-muted-foreground uppercase",
						children: l
					})]
				}, l))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => {
						downloadText("sol-beautiful-shopify-products.csv", toShopifyCsv(), "text/csv;charset=utf-8");
						toast("Shopify product CSV downloaded");
					},
					children: "Download Shopify CSV"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => {
						downloadText("sol-beautiful-shopify-products.json", JSON.stringify(toShopifyJson(), null, 2), "application/json");
						toast("Shopify JSON downloaded");
					},
					children: "Download JSON"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-12 space-y-8",
				children: [
					{
						t: "1. Sell on this site",
						d: "Share the catalog, run ads to it, take guest checkout. Promo codes SOL15, WELCOME10, and RARE20 already work. Demo payments are on until you connect a processor."
					},
					{
						t: "2. Import the CSV into Shopify",
						d: "Shopify Admin → Products → Import. Official columns, product photographs, live quantities, and manufacturer UPCs on variants we have verified. Swap Image Src for Shopify Files if you prefer hosted assets."
					},
					{
						t: "3. Keep inventory in one place",
						d: "3DSeller remains the inventory source of truth. Teapplix still prints the labels from California. Shopify would sit in front — not replace the back room."
					}
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: s.t
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted-foreground",
					children: s.d
				})] }, s.t))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-12 overflow-x-auto rounded-xl border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[640px] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-card text-[11px] tracking-[0.14em] text-muted-foreground uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-3 font-medium",
								children: "Handle"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-3 font-medium",
								children: "Vendor"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-3 font-medium",
								children: "SKU"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-3 font-medium",
								children: "Price"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: sample.flatMap((p) => p.variants.slice(0, 1).map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 font-mono text-xs",
								children: p.handle
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2",
								children: p.vendor
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 font-mono text-xs",
								children: v.sku
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-3 py-2 tabular-nums",
								children: ["$", v.price]
							})
						]
					}, v.id))) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: "Sample of featured products — download the CSV for the full catalog."
			})
		]
	});
}
//#endregion
export { ShopifyPage as component };
