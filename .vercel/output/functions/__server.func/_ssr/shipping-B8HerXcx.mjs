import { _ as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { b as STORE } from "./router-oaCZX-Pv.mjs";
import { t as ProsePage } from "./prose-page-DngcZlGT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shipping-B8HerXcx.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ProsePage, {
		kicker: "Policy",
		title: "Shipping",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Every order is packed in the United States, from ",
				STORE.origin,
				". Once payment clears, we create the shipping label and packing invoice in ",
				STORE.shippingTool,
				" and hand the parcel to USPS or UPS."
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Processing time" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Most in-stock orders go out within one business day (Monday–Friday, excluding US holidays). Weekend orders print Monday. During heat waves we may hold fragrance an extra day rather than cook a bottle on a porch." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Rates (contiguous United States)" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					"Standard — $",
					STORE.standardShipping.toFixed(2),
					", 3–5 business days after it leaves California."
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					"Express — $",
					STORE.expressShipping.toFixed(2),
					", 1–2 business days after it leaves."
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					"Free standard shipping on orders $",
					STORE.freeShippingThreshold,
					"+ after discounts."
				] })
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Alaska, Hawaii, US territories, and PO boxes ship USPS only; express may not be available. We do not currently offer international checkout on this site." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Tracking & invoices" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"You receive a ",
				STORE.shippingTool,
				" invoice with carrier, tracking number, and the line items we packed. Tracking usually appears within a few hours of the label being created. Signature may be required on high-value fragrance."
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Damage in transit" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Photograph the box, the packing, and the item before you discard anything, then write us with the order number. We will file with the carrier or replace from stock when we still have it. See also",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/pages/returns",
					children: "returns"
				}),
				"."
			] })
		]
	});
}
//#endregion
export { Page as component };
