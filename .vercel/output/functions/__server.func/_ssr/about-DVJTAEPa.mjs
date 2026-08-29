import { _ as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { b as STORE } from "./router-oaCZX-Pv.mjs";
import { t as ProsePage } from "./prose-page-DngcZlGT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/about-DVJTAEPa.js
var import_jsx_runtime = require_jsx_runtime();
function AboutPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ProsePage, {
		kicker: "The house",
		title: "Sol Beautiful — for the love of beauty and skin",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [STORE.name, " is a Southern California house of designer fragrance, makeup, and skincare — for the love of beauty, and of skin. We collect what we actually reach for: a scent that stays, color that feels like you, cream that takes care of skin. Lancôme, Estée Lauder, Clinique, MAC, Too Faced, Tom Ford, YSL — and a particular appetite for discontinued and hard-to-find pieces."] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Every piece is chosen with a collector’s eye and packed with the same care we give our own. Everything ships from the United States." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/lifestyle/packing.jpg",
				alt: "Sol Beautiful beauty still life",
				className: "my-6 w-full rounded-xl"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "How the shop is run" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Inventory lives in ",
				STORE.inventoryTool,
				" — the same counts you see here. When an order is paid, a shipping label and invoice are created in ",
				STORE.shippingTool,
				", then the parcel leaves ",
				STORE.origin,
				" via USPS or UPS, usually within one business day."
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Quality, authenticity, USA origin" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"We sell authentic designer stock — factory-sealed where the manufacturer sealed it. We do not sell clones, impression oils, or decants labeled as authentic bottles. Orders pack in California and ship domestically. Read the policies a proper house should publish:",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/pages/authenticity",
					children: "authenticity"
				}),
				", ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/pages/shipping",
					children: "shipping"
				}),
				",",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/pages/payment",
					children: "payment"
				}),
				", and ",
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
export { AboutPage as component };
