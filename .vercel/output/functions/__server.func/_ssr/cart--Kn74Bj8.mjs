import { i as __toESM } from "../_runtime.mjs";
import { _ as require_jsx_runtime, v as require_react } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { I as Button, b as STORE, d as cartDiscount, f as cartSubtotal, g as useCartStore, o as Input, p as resolveLines, s as QtyInput, u as cartCount, v as formatMoney } from "./router-oaCZX-Pv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cart--Kn74Bj8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CartPage() {
	const lines = useCartStore((s) => s.lines);
	const code = useCartStore((s) => s.discountCode);
	const updateQty = useCartStore((s) => s.updateQty);
	const removeLine = useCartStore((s) => s.removeLine);
	const applyCode = useCartStore((s) => s.applyCode);
	const clearCode = useCartStore((s) => s.clearCode);
	const [draft, setDraft] = (0, import_react.useState)(code);
	const resolved = resolveLines(lines);
	const subtotal = cartSubtotal(lines);
	const discount = cartDiscount(lines, code);
	const after = Math.max(0, subtotal - discount);
	const count = cartCount(lines);
	if (!resolved.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-xl px-4 py-24 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-5xl",
				children: "Your bag is empty"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted-foreground",
				children: "Designer stock, discontinued pieces, packed from California."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-8",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/collections/$handle",
					params: { handle: "all" },
					children: "Continue shopping"
				})
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_340px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
			className: "font-display text-5xl",
			children: [
				"Bag (",
				count,
				")"
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-8 divide-y divide-border border-y border-border",
			children: resolved.map(({ line, product, variant }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex gap-4 py-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/products/$handle",
					params: { handle: product.handle },
					className: "size-28 shrink-0 overflow-hidden rounded-md bg-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: product.images[0]?.src,
						alt: "",
						className: "size-full object-contain",
						referrerPolicy: "no-referrer"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] tracking-[0.14em] text-muted-foreground uppercase",
							children: product.vendor
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/products/$handle",
							params: { handle: product.handle },
							className: "font-medium",
							children: product.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								variant.title,
								" · ",
								variant.sku
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QtyInput, {
								value: line.quantity,
								max: variant.inventoryQuantity,
								onChange: (n) => updateQty(line.id, n)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "tabular-nums",
								children: formatMoney(Number(variant.price) * line.quantity)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-2 text-xs text-muted-foreground underline",
							onClick: () => removeLine(line.id),
							children: "Remove"
						})
					]
				})]
			}, line.id))
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "h-fit rounded-xl bg-card p-6 shadow-[var(--shadow-border)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Summary"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Subtotal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: formatMoney(subtotal)
					})]
				}),
				discount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex justify-between text-sm text-sale",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Discount ", code] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tabular-nums",
						children: ["−", formatMoney(discount)]
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: after >= STORE.freeShippingThreshold ? "You have free standard shipping." : `${formatMoney(STORE.freeShippingThreshold - after)} to free standard shipping.`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 flex gap-2",
					onSubmit: (e) => {
						e.preventDefault();
						const res = applyCode(draft);
						if (res.ok) toast(res.message);
						else toast.error(res.message);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: draft,
						onChange: (e) => setDraft(e.target.value),
						placeholder: "Promo code"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "outline",
						children: "Apply"
					})]
				}),
				code ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-2 text-xs underline",
					onClick: clearCode,
					children: "Remove code"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: "Try SOL15, WELCOME10, or RARE20."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex justify-between text-base font-medium",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Estimated" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: formatMoney(after)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-4 w-full",
					size: "lg",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/checkout",
						children: "Checkout"
					})
				})
			]
		})]
	});
}
//#endregion
export { CartPage as component };
