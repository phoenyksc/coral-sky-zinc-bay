import { i as __toESM } from "./_runtime.mjs";
import { _ as require_jsx_runtime, a as Trigger2, i as Root2, n as Header, r as Item, t as Content2, v as require_react } from "./_libs/@radix-ui/react-accordion+[...].mjs";
import { _ as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { a as ShieldCheck, d as ChevronDown, n as Truck, u as Heart } from "./_libs/lucide-react.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as create, t as persist } from "./_libs/zustand.mjs";
import { E as averageRating, I as Button, L as cn, N as relatedProducts, O as getProduct, P as reviewsFor, _ as discountPercent, b as STORE, c as useWishlistStore, g as useCartStore, k as isRare, l as useUiStore, n as Route, s as QtyInput, v as formatMoney } from "./_ssr/router-oaCZX-Pv.mjs";
import { n as ListingImage, r as ProductGrid, t as Badge } from "./_ssr/product-card-DyUHjowZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_handle-PREzAWDi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var useRecentStore = create()(persist((set, get) => ({
	handles: [],
	push: (handle) => {
		set({ handles: [handle, ...get().handles.filter((h) => h !== handle)].slice(0, 8) });
	}
}), { name: "sol-beautiful-recent-v1" }));
var Accordion = Root2;
function AccordionItem({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
		className: cn("border-b border-border", className),
		...props
	});
}
function AccordionTrigger({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
		className: "flex",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Trigger2, {
			className: cn("flex flex-1 items-center justify-between py-4 text-left text-sm font-medium transition-colors hover:text-foreground/70 [&[data-state=open]>svg]:rotate-180", className),
			...props,
			children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 shrink-0 text-muted-foreground transition-transform duration-200" })]
		})
	});
}
function AccordionContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		className: "overflow-hidden text-sm text-muted-foreground data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("pb-4 leading-relaxed", className),
			children
		})
	});
}
function Price({ price, compareAt, size = "md" }) {
	const pct = discountPercent(price, compareAt);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-wrap items-baseline gap-2 tabular-nums", size === "sm" && "text-sm", size === "md" && "text-base", size === "lg" && "text-xl"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium",
			children: formatMoney(price)
		}), pct ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground line-through decoration-foreground/30",
			children: formatMoney(compareAt)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-xs font-medium tracking-wide text-sale",
			children: [pct, "% off"]
		})] }) : null]
	});
}
function ProductPage() {
	const { handle } = Route.useParams();
	const product = getProduct(handle);
	const [variantId, setVariantId] = (0, import_react.useState)(product?.variants[0]?.id ?? "");
	const [qty, setQty] = (0, import_react.useState)(1);
	const addItem = useCartStore((s) => s.addItem);
	const setCartOpen = useUiStore((s) => s.setCartOpen);
	const wished = useWishlistStore((s) => s.handles.includes(handle));
	const toggleWish = useWishlistStore((s) => s.toggle);
	const pushRecent = useRecentStore((s) => s.push);
	(0, import_react.useEffect)(() => {
		if (product) {
			setVariantId(product.variants[0]?.id ?? "");
			setQty(1);
			pushRecent(product.handle);
		}
	}, [product, pushRecent]);
	if (!product) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-xl px-4 py-24 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-4xl",
			children: "Product not found"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/collections/$handle",
			params: { handle: "all" },
			className: "mt-4 inline-block text-sm underline",
			children: "Shop the house"
		})]
	});
	const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
	const rare = isRare(product);
	const related = relatedProducts(product);
	const reviews = reviewsFor(product.handle);
	const rating = averageRating(product.handle);
	const showOptions = product.variants.length > 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-7xl px-4 py-10 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "hover:underline",
						children: "Home"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-2",
						children: "/"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/collections/$handle",
						params: { handle: product.collectionHandles[0] ?? "all" },
						className: "hover:underline",
						children: product.productType
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-2",
						children: "/"
					}),
					product.title
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-10 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-hidden rounded-xl bg-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingImage, {
						src: product.images[0]?.src,
						alt: product.images[0]?.alt ?? product.title,
						className: "aspect-square w-full",
						priority: true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] tracking-[0.18em] text-muted-foreground uppercase",
						children: product.vendor
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-4xl md:text-5xl",
						children: product.title
					}),
					rating ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: [
							rating.toFixed(1),
							" · ",
							reviews.length,
							" review",
							reviews.length === 1 ? "" : "s"
						]
					}) : product.sold > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted-foreground tabular-nums",
						children: [product.sold.toLocaleString(), " sold"]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							rare ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Hard to find" }) : null,
							product.tags.includes("discontinued") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								children: "Discontinued"
							}) : null,
							product.category ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								children: product.category
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								children: "Ships from the USA"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Price, {
							price: variant.price,
							compareAt: variant.compareAtPrice,
							size: "lg"
						})
					}),
					showOptions ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] tracking-[0.16em] text-muted-foreground uppercase",
							children: [
								product.options[0].name,
								": ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-foreground",
									children: variant.option1 ?? variant.title
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex max-h-52 flex-wrap gap-2 overflow-y-auto",
							children: product.variants.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setVariantId(v.id);
									setQty(1);
								},
								className: cn("h-11 min-w-11 rounded-md border px-4 text-sm transition-colors", variantId === v.id ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground/40", !v.available && "cursor-not-allowed opacity-40 line-through"),
								children: v.option1 ?? v.title
							}, v.id))
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-xs text-muted-foreground",
						children: [
							"SKU ",
							variant.sku,
							variant.barcode ? ` · UPC ${variant.barcode}` : "",
							variant.inventoryQuantity <= 5 && variant.inventoryQuantity > 0 ? ` · Only ${variant.inventoryQuantity} left` : variant.available ? ` · ${variant.inventoryQuantity} in stock` : " · Sold out"
						]
					}),
					variant.barcode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase",
						children: ["Manufacturer barcode for this ", showOptions ? "shade" : "piece"]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QtyInput, {
								value: qty,
								max: Math.max(1, variant.inventoryQuantity),
								onChange: setQty
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "lg",
								className: "min-w-48 flex-1",
								disabled: !variant.available,
								onClick: () => {
									const res = addItem(product.id, variant.id, qty);
									if (res.ok) {
										toast(res.message);
										setCartOpen(true);
									} else toast.error(res.message);
								},
								children: "Add to bag"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "outline",
								"aria-label": "Wishlist",
								onClick: () => toast(toggleWish(product.handle) ? "Saved to wishlist" : "Removed from wishlist"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-4", wished && "fill-foreground") })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-6 space-y-2 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "size-4" }),
								" Free standard shipping over $",
								STORE.freeShippingThreshold,
								" · ships from the USA"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }),
								" Authenticity guaranteed · packed from ",
								STORE.origin
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Accordion, {
						type: "single",
						collapsible: true,
						defaultValue: "details",
						className: "mt-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionItem, {
								value: "details",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionTrigger, { children: "Details" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "prose-p:mb-3",
									dangerouslySetInnerHTML: { __html: product.bodyHtml }
								}) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionItem, {
								value: "shipping",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionTrigger, { children: "Shipping" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionContent, { children: [
									"Packed in ",
									STORE.origin,
									" and shipped from the United States. Labels printed in ",
									STORE.shippingTool,
									". Standard 3–5 business days. Express 1–2. Free standard over $",
									STORE.freeShippingThreshold,
									". See our",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/pages/shipping",
										className: "underline",
										children: "shipping policy"
									}),
									"."
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionItem, {
								value: "returns",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionTrigger, { children: "Returns" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionContent, { children: [
									"Unopened items in original packaging may be returned within 14 days. Opened fragrance and used makeup are final sale. ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/pages/returns",
										className: "underline",
										children: "Full policy"
									}),
									"."
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionItem, {
								value: "auth",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionTrigger, { children: "Authenticity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionContent, { children: [
									"Factory-sealed designer stock where the manufacturer sealed it. We do not sell clones or decants as authentic.",
									variant.barcode ? ` UPC ${variant.barcode} is the manufacturer barcode for this shade.` : "",
									" See our",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/pages/authenticity",
										className: "underline",
										children: "authenticity policy"
									}),
									"."
								] })]
							})
						]
					})
				] })]
			}),
			reviews.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-16 border-t border-border pt-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl",
					children: "Reviews"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-6 grid gap-6 md:grid-cols-2",
					children: reviews.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl bg-card p-5 shadow-[var(--shadow-border)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: r.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: [
									r.author,
									" · ",
									r.rating,
									"/5 ",
									r.verified ? "· Verified" : "",
									" · ",
									r.date
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm leading-relaxed text-muted-foreground",
								children: r.body
							})
						]
					}, r.id))
				})]
			}) : null,
			related.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-8 font-display text-3xl",
					children: "You may also like"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductGrid, { products: related })]
			}) : null
		]
	});
}
//#endregion
export { ProductPage as component };
