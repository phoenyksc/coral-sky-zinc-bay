import { _ as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { b as STORE } from "./router-oaCZX-Pv.mjs";
import { t as ProsePage } from "./prose-page-DngcZlGT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/returns-ZLaCQPbq.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ProsePage, {
		kicker: "Policy",
		title: "Returns",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Unopened, unused items in original packaging may be returned within 14 days of delivery. Buyer pays return shipping unless we shipped the wrong thing, a damaged parcel, or an item that does not match the product photo." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "What we cannot take back" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Opened fragrance, including testers once the cellophane or cap seal is broken." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Used makeup, skincare, or hair products — hygiene items are final sale once opened." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Items marked hard-to-find, discontinued, or limited once the factory seal is broken." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Sale or under-$20 minis once opened." })
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "How to start" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Email ",
				STORE.email,
				" with the order number, the reason, and photos of the item plus the packing slip. We will send a return address. Refunds go back to the original tender after we inspect the return — usually 3–5 business days after it lands in Fountain Valley. Original outbound shipping is only refunded when the error was ours."
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Exchanges" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"We do not hold inventory for shade exchanges. Return the unopened piece, then reorder the shade you want if it is still in stock. Inventory moves in ",
				STORE.inventoryTool,
				" as soon as it sells."
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Payment methods and charge timing are on the ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/pages/payment",
					children: "payment policy"
				}),
				". Shipping times are on the ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/pages/shipping",
					children: "shipping policy"
				}),
				"."
			] })
		]
	});
}
//#endregion
export { Page as component };
