import { i as __toESM } from "./_runtime.mjs";
import { _ as require_jsx_runtime, v as require_react } from "./_libs/@radix-ui/react-accordion+[...].mjs";
import { _ as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { f as Check } from "./_libs/lucide-react.mjs";
import { A as productMinPrice, D as getCollection, L as cn, M as productsForCollection, T as VENDORS, j as productOnSale, r as Route$8, w as TOP_VENDORS } from "./_ssr/router-oaCZX-Pv.mjs";
import { t as PaginatedGrid } from "./_ssr/paginated-grid-US980gaA.mjs";
import { n as CheckboxIndicator, t as Checkbox$1 } from "./_libs/@radix-ui/react-checkbox+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_handle-B6AFNP7K.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Checkbox({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
		className: cn("peer size-4 shrink-0 rounded-[3px] border border-foreground/30 bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 data-[state=checked]:bg-foreground data-[state=checked]:text-background", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
			className: "flex items-center justify-center text-current",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
				className: "size-3",
				strokeWidth: 3
			})
		})
	});
}
function sortProducts(products, sort) {
	const copy = [...products];
	switch (sort) {
		case "price-asc": return copy.sort((a, b) => productMinPrice(a) - productMinPrice(b));
		case "price-desc": return copy.sort((a, b) => productMinPrice(b) - productMinPrice(a));
		case "title-asc": return copy.sort((a, b) => a.title.localeCompare(b.title));
		case "newest": return copy.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
		case "best-selling": return copy.sort((a, b) => b.sold - a.sold);
		default: return copy.sort((a, b) => Number(b.featured) - Number(a.featured) || b.sold - a.sold);
	}
}
function CollectionPage() {
	const { handle } = Route$8.useParams();
	const collection = getCollection(handle);
	const [vendors, setVendors] = (0, import_react.useState)([]);
	const [inStock, setInStock] = (0, import_react.useState)(false);
	const [saleOnly, setSaleOnly] = (0, import_react.useState)(false);
	const [sort, setSort] = (0, import_react.useState)("featured");
	const [moreBrands, setMoreBrands] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setVendors([]);
		setInStock(false);
		setSaleOnly(false);
		setSort("featured");
		setMoreBrands(false);
	}, [handle]);
	const products = (0, import_react.useMemo)(() => {
		let list = productsForCollection(handle);
		if (vendors.length) list = list.filter((p) => vendors.includes(p.vendor));
		if (inStock) list = list.filter((p) => p.variants.some((v) => v.available));
		if (saleOnly) list = list.filter(productOnSale);
		return sortProducts(list, sort);
	}, [
		handle,
		vendors,
		inStock,
		saleOnly,
		sort
	]);
	if (!collection) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-xl px-4 py-24 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-4xl",
			children: "Collection not found"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/collections",
			className: "mt-4 inline-block text-sm underline",
			children: "Back to collections"
		})]
	});
	const toggleVendor = (name) => {
		setVendors((prev) => prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name]);
	};
	const brandList = moreBrands ? VENDORS : TOP_VENDORS;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative isolate overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: collection.image,
				alt: "",
				className: "h-56 w-full object-cover object-[center_22%] md:h-72"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-t from-foreground/70 via-foreground/25 to-foreground/10" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex flex-col justify-end px-4 py-8 sm:px-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto w-full max-w-7xl text-background",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] tracking-[0.18em] uppercase",
							children: "Collection"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-5xl",
							children: collection.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-xl text-sm text-background/80",
							children: collection.description
						})
					]
				})
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[220px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "space-y-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.16em] text-muted-foreground uppercase",
					children: "Brand"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 max-h-80 space-y-2 overflow-y-auto pr-1",
					children: brandList.map((vendor) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							id: `v-${vendor}`,
							checked: vendors.includes(vendor),
							onCheckedChange: () => toggleVendor(vendor)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: `v-${vendor}`,
							className: "text-sm",
							children: vendor
						})]
					}, vendor))
				}),
				VENDORS.length > TOP_VENDORS.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-3 text-xs tracking-[0.12em] uppercase hover:opacity-70",
					onClick: () => setMoreBrands((v) => !v),
					children: moreBrands ? "Show top brands" : `All ${VENDORS.length} brands`
				}) : null
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex min-h-11 items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
						checked: inStock,
						onCheckedChange: (v) => setInStock(Boolean(v))
					}), "In stock"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex min-h-11 items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
						checked: saleOnly,
						onCheckedChange: (v) => setSaleOnly(Boolean(v))
					}), "On sale"]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground tabular-nums",
				children: [products.length, " products"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center gap-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "Sort"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: sort,
					onChange: (e) => setSort(e.target.value),
					className: cn("h-10 rounded-md border border-input bg-card px-3 text-sm"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "featured",
							children: "Featured"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "best-selling",
							children: "Best selling"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "newest",
							children: "Newest"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "price-asc",
							children: "Price, low to high"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "price-desc",
							children: "Price, high to low"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "title-asc",
							children: "A–Z"
						})
					]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginatedGrid, {
			products,
			priorityCount: 4
		})] })]
	})] });
}
//#endregion
export { CollectionPage as component };
