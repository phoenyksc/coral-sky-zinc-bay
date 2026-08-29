import { _ as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { b as STORE } from "./router-oaCZX-Pv.mjs";
import { t as ProsePage } from "./prose-page-DngcZlGT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payment-K0KsUIH7.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ProsePage, {
		kicker: "Policy",
		title: "Payment",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Prices on Sol Beautiful are in US dollars. What you see on the product page is what we charge, plus shipping and tax." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Methods we accept" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Visa, Mastercard, American Express, and Discover" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "PayPal" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Apple Pay and Google Pay where your browser supports them" })
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Guest checkout is available — no account required. We never ask you to send payment off-site, by wire, or as a gift card. This preview charges a demo card so you can walk the bag through; a live processor is wired when the shop is connected to payments." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "When you are charged" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"The card or PayPal account is authorized at checkout and captured when the ",
				STORE.shippingTool,
				" label is created. If a shade sells out between bag and capture, we cancel that line and refund it rather than substitute."
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Sales tax" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"California orders are charged ",
				(STORE.caTaxRate * 100).toFixed(2),
				"% sales tax on merchandise and taxable shipping. Other US states: we collect where the law requires. Tax is calculated at checkout from the ship-to address."
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Promotions" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Codes SOL15 (15% off), WELCOME10 ($10 off $50+), and RARE20 (20% off hard-to-find) can be applied in the bag. Codes do not stack. Free standard shipping still starts at $",
				STORE.freeShippingThreshold,
				" after discounts."
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Invoices" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"A ",
				STORE.shippingTool,
				" invoice rides with the shipment and is emailed at label creation: items, price, tax, shipping method, and tracking. Keep it for returns. Questions:",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/pages/contact",
					children: "contact the shop"
				}),
				"."
			] })
		]
	});
}
//#endregion
export { Page as component };
