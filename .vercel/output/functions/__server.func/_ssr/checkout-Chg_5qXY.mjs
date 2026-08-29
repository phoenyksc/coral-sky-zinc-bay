import { i as __toESM } from "../_runtime.mjs";
import { _ as require_jsx_runtime, v as require_react } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { _ as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { I as Button, R as uniqueId, b as STORE, d as cartDiscount, f as cartSubtotal, g as useCartStore, h as taxAmount, m as shippingCost, o as Input, p as resolveLines, v as formatMoney, y as moneyString } from "./router-oaCZX-Pv.mjs";
import { t as useOrdersStore } from "./orders-store-BS1HWLPH.mjs";
import { t as Label } from "./label-CNi3UKDr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checkout-Chg_5qXY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var emptyAddress = {
	email: "",
	firstName: "",
	lastName: "",
	address1: "",
	address2: "",
	city: "",
	state: "CA",
	zip: "",
	country: "United States",
	phone: ""
};
function CheckoutPage() {
	const navigate = useNavigate();
	const lines = useCartStore((s) => s.lines);
	const code = useCartStore((s) => s.discountCode);
	const applyCode = useCartStore((s) => s.applyCode);
	const clear = useCartStore((s) => s.clear);
	const addOrder = useOrdersStore((s) => s.add);
	const [address, setAddress] = (0, import_react.useState)(emptyAddress);
	const [method, setMethod] = (0, import_react.useState)("standard");
	const [promo, setPromo] = (0, import_react.useState)(code);
	const [card, setCard] = (0, import_react.useState)({
		name: "",
		number: "",
		exp: "",
		cvc: ""
	});
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const resolved = resolveLines(lines);
	const subtotal = cartSubtotal(lines);
	const discount = cartDiscount(lines, code);
	const after = Math.max(0, subtotal - discount);
	const shipping = shippingCost(after, method);
	const tax = taxAmount(after + shipping, address.state);
	const total = after + shipping + tax;
	if (!resolved.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-xl px-4 py-24 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-4xl",
			children: "Nothing to check out"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-6",
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/collections/$handle",
				params: { handle: "all" },
				children: "Shop"
			})
		})]
	});
	const set = (key) => (e) => setAddress((a) => ({
		...a,
		[key]: e.target.value
	}));
	function placeOrder(e) {
		e.preventDefault();
		if (!address.email || !address.firstName || !address.lastName || !address.address1 || !address.city || !address.zip) {
			toast.error("Please complete shipping details.");
			return;
		}
		if (card.number.replace(/\s/g, "").length < 13 || card.exp.length < 4 || card.cvc.length < 3) {
			toast.error("Enter demo card details to place the order.");
			return;
		}
		setSubmitting(true);
		const orderId = uniqueId("ord");
		const number = `ESC-${String(Date.now()).slice(-6)}`;
		addOrder({
			id: orderId,
			number,
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			email: address.email,
			lines: resolved.map(({ line, product, variant }) => ({
				title: product.title,
				variantTitle: variant.title,
				sku: variant.sku,
				quantity: line.quantity,
				price: moneyString(Number(variant.price) * line.quantity),
				image: product.images[0]?.src ?? ""
			})),
			subtotal,
			discount,
			discountCode: code || void 0,
			shipping,
			shippingMethod: method,
			tax,
			total,
			address,
			status: "confirmed"
		});
		clear();
		toast("Order confirmed");
		navigate({
			to: "/checkout/success",
			search: { order: orderId }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: placeOrder,
			className: "space-y-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-5xl",
					children: "Checkout"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Guest checkout. Demo payments — no card is charged. Connect Shopify Payments when you go live."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Contact"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "email",
							children: "Email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "email",
							type: "email",
							required: true,
							value: address.email,
							onChange: set("email"),
							autoComplete: "email"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Shipping"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "first",
									children: "First name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "first",
									required: true,
									value: address.firstName,
									onChange: set("firstName"),
									autoComplete: "given-name"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "last",
									children: "Last name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "last",
									required: true,
									value: address.lastName,
									onChange: set("lastName"),
									autoComplete: "family-name"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "addr1",
								children: "Address"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "addr1",
								required: true,
								value: address.address1,
								onChange: set("address1"),
								autoComplete: "address-line1"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "addr2",
								children: "Apartment, suite"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "addr2",
								value: address.address2,
								onChange: set("address2"),
								autoComplete: "address-line2"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "city",
										children: "City"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "city",
										required: true,
										value: address.city,
										onChange: set("city"),
										autoComplete: "address-level2"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "state",
										children: "State"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										id: "state",
										value: address.state,
										onChange: set("state"),
										className: "flex h-11 w-full rounded-md border border-input bg-card px-3 text-sm",
										children: [
											"CA",
											"NY",
											"TX",
											"FL",
											"WA",
											"AZ",
											"NV",
											"OR",
											"IL",
											"PA"
										].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "zip",
										children: "ZIP"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "zip",
										required: true,
										value: address.zip,
										onChange: set("zip"),
										autoComplete: "postal-code"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "phone",
								children: "Phone"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "phone",
								value: address.phone,
								onChange: set("phone"),
								autoComplete: "tel"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Delivery"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "radio",
									name: "ship",
									checked: method === "standard",
									onChange: () => setMethod("standard")
								}), "Standard · 3–5 business days"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm tabular-nums",
								children: shippingCost(after, "standard") === 0 ? "Free" : formatMoney(STORE.standardShipping)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "radio",
									name: "ship",
									checked: method === "express",
									onChange: () => setMethod("express")
								}), "Express · 1–2 business days"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm tabular-nums",
								children: formatMoney(STORE.expressShipping)
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Payment"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Demo card — use any 16-digit number. Nothing is charged."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "cardname",
								children: "Name on card"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "cardname",
								required: true,
								value: card.name,
								onChange: (e) => setCard({
									...card,
									name: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "cardnum",
								children: "Card number"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "cardnum",
								required: true,
								inputMode: "numeric",
								placeholder: "4242 4242 4242 4242",
								value: card.number,
								onChange: (e) => setCard({
									...card,
									number: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "exp",
									children: "Expiry"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "exp",
									required: true,
									placeholder: "MM/YY",
									value: card.exp,
									onChange: (e) => setCard({
										...card,
										exp: e.target.value
									})
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "cvc",
									children: "CVC"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "cvc",
									required: true,
									placeholder: "123",
									value: card.cvc,
									onChange: (e) => setCard({
										...card,
										cvc: e.target.value
									})
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					size: "lg",
					className: "w-full",
					disabled: submitting,
					children: ["Place order · ", formatMoney(total)]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "h-fit rounded-xl bg-card p-6 shadow-[var(--shadow-border)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Order"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 space-y-3",
					children: resolved.map(({ line, product, variant }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: product.images[0]?.src,
								alt: "",
								className: "size-16 rounded-md object-contain bg-card",
								referrerPolicy: "no-referrer"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm",
									children: product.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										variant.title,
										" × ",
										line.quantity
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm tabular-nums",
								children: formatMoney(Number(variant.price) * line.quantity)
							})
						]
					}, line.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 flex gap-2",
					onSubmit: (e) => {
						e.preventDefault();
						const res = applyCode(promo);
						toast[res.ok ? "success" : "error"](res.message);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: promo,
						onChange: (e) => setPromo(e.target.value),
						placeholder: "Promo"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "outline",
						children: "Apply"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-5 space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Subtotal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "tabular-nums",
								children: formatMoney(subtotal)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Discount" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "tabular-nums",
								children: ["−", formatMoney(discount)]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Shipping" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "tabular-nums",
								children: shipping === 0 ? "Free" : formatMoney(shipping)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dt", { children: ["Tax ", address.state === "CA" ? "(CA)" : ""] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "tabular-nums",
								children: formatMoney(tax)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between border-t border-border pt-3 text-base font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "tabular-nums",
								children: formatMoney(total)
							})]
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { CheckoutPage as component };
