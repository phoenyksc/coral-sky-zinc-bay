import { i as __toESM } from "../_runtime.mjs";
import { _ as require_jsx_runtime, v as require_react } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { I as Button } from "./router-oaCZX-Pv.mjs";
import { r as ProductGrid } from "./product-card-DyUHjowZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/paginated-grid-US980gaA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PAGE = 24;
function PaginatedGrid({ products, priorityCount = 4 }) {
	const [visible, setVisible] = (0, import_react.useState)(PAGE);
	(0, import_react.useEffect)(() => {
		setVisible(PAGE);
	}, [products]);
	const slice = products.slice(0, visible);
	const remaining = products.length - slice.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductGrid, {
		products: slice,
		priorityCount
	}), remaining > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-12 flex flex-col items-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-muted-foreground tabular-nums",
			children: [
				"Showing ",
				slice.length,
				" of ",
				products.length
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			onClick: () => setVisible((n) => n + PAGE),
			children: [
				"Load ",
				Math.min(PAGE, remaining),
				" more"
			]
		})]
	}) : null] });
}
//#endregion
export { PaginatedGrid as t };
