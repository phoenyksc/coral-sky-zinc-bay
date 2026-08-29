import { i as __toESM } from "../_runtime.mjs";
import { _ as require_jsx_runtime, v as require_react } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as Heart } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as productMinPrice, L as cn, c as useWishlistStore, g as useCartStore, j as productOnSale, k as isRare, l as useUiStore, v as formatMoney } from "./router-oaCZX-Pv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/product-card-DyUHjowZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]", {
	variants: { variant: {
		default: "bg-foreground text-background",
		sale: "bg-sale text-primary-foreground",
		outline: "border border-foreground/20 text-foreground",
		muted: "bg-secondary text-muted-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
function isRemoteListing(src) {
	try {
		const u = new URL(src);
		return u.hostname === "i.ebayimg.com" || u.hostname.endsWith(".ebayimg.com");
	} catch {
		return false;
	}
}
function cleanedSrc(src) {
	return isRemoteListing(src) ? `/api/photo?u=${encodeURIComponent(src)}` : src;
}
function nextSrc(src, original) {
	if (src.startsWith("/api/photo") && original) return original;
	if (src.includes("/s-l800.jpg")) return src.replace("/s-l800.jpg", "/s-l500.jpg");
	if (src.includes("/s-l500.jpg")) return src.replace("/s-l500.jpg", "/s-l300.jpg");
	return null;
}
function ListingImage({ src, alt, className, imgClassName, priority = false }) {
	const [current, setCurrent] = (0, import_react.useState)(src ? cleanedSrc(src) : src);
	const [failed, setFailed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setCurrent(src ? cleanedSrc(src) : src);
		setFailed(false);
	}, [src]);
	if (!current || failed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("grid place-items-center bg-card text-[11px] tracking-[0.16em] text-muted-foreground uppercase", className),
		children: "Sol Beautiful"
	});
	const uncleaned = Boolean(src && current === src && isRemoteListing(src));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative overflow-hidden bg-card", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: current,
			alt,
			className: cn("size-full object-contain", imgClassName),
			loading: priority ? "eager" : "lazy",
			decoding: "async",
			referrerPolicy: "no-referrer",
			onError: () => {
				const fallback = nextSrc(current, src);
				if (fallback) setCurrent(fallback);
				else setFailed(true);
			}
		}), uncleaned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: "pointer-events-none absolute bottom-[2%] left-[2%] h-[11%] w-[38%] bg-card"
		}) : null]
	});
}
function ProductCard({ product, priority = false }) {
	const image = product.images[0];
	const variant = product.variants.find((v) => v.available) ?? product.variants[0];
	const sale = productOnSale(product);
	const rare = isRare(product);
	const wished = useWishlistStore((s) => s.handles.includes(product.handle));
	const toggleWish = useWishlistStore((s) => s.toggle);
	const addItem = useCartStore((s) => s.addItem);
	const setCartOpen = useUiStore((s) => s.setCartOpen);
	const min = productMinPrice(product);
	const hasOptions = product.variants.length > 1 && product.options[0]?.name !== "Title";
	const soldOut = !product.variants.some((v) => v.available);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "group relative flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/products/$handle",
				params: { handle: product.handle },
				className: "relative block overflow-hidden rounded-lg bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingImage, {
					src: image?.src,
					alt: image?.alt ?? product.title,
					className: "aspect-square",
					imgClassName: "transition-transform duration-500 ease-out group-hover:scale-[1.03]",
					priority
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute top-3 left-3 flex flex-col gap-1.5",
					children: [
						rare ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "default",
							children: "Hard to find"
						}) : null,
						sale && !rare ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "sale",
							children: "Sale"
						}) : null,
						soldOut ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "muted",
							children: "Sold out"
						}) : null,
						!soldOut && variant.inventoryQuantity > 0 && variant.inventoryQuantity <= 5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "muted",
							children: "Low stock"
						}) : null
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": wished ? "Remove from wishlist" : "Save to wishlist",
				onClick: () => {
					const on = toggleWish(product.handle);
					toast(on ? "Saved to wishlist" : "Removed from wishlist");
				},
				className: "absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-card/90 text-foreground shadow-[var(--shadow-border)] backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-4", wished && "fill-foreground") })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col gap-1 pt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] tracking-[0.16em] text-muted-foreground uppercase",
						children: product.vendor
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/products/$handle",
						params: { handle: product.handle },
						className: "font-display text-lg leading-snug tracking-tight text-balance hover:opacity-70",
						children: product.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto flex items-end justify-between gap-3 pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm tabular-nums",
							children: [hasOptions ? `From ${formatMoney(min)}` : formatMoney(variant.price), variant.compareAtPrice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-muted-foreground line-through",
								children: formatMoney(variant.compareAtPrice)
							}) : null]
						}), !hasOptions && !soldOut ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-[11px] tracking-[0.14em] uppercase opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100",
							onClick: () => {
								const res = addItem(product.id, variant.id, 1);
								if (res.ok) {
									toast(res.message);
									setCartOpen(true);
								} else toast.error(res.message);
							},
							children: "Add"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/products/$handle",
							params: { handle: product.handle },
							className: "text-[11px] tracking-[0.14em] uppercase opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100",
							children: soldOut ? "View" : "Options"
						})]
					})
				]
			})
		]
	});
}
function ProductGrid({ products, priorityCount = 0 }) {
	if (!products.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-dashed border-border px-6 py-16 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-2xl",
			children: "Nothing matches"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted-foreground",
			children: "Try clearing filters or searching another brand."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4",
		children: products.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
			product: p,
			priority: i < priorityCount
		}, p.id))
	});
}
//#endregion
export { ListingImage as n, ProductGrid as r, Badge as t };
