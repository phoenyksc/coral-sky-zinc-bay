import { _ as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { F as searchProducts, a as Route$13, o as Input } from "./router-oaCZX-Pv.mjs";
import { t as PaginatedGrid } from "./paginated-grid-US980gaA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-C0GoUBRD.js
var import_jsx_runtime = require_jsx_runtime();
function SearchPage() {
	const { q } = Route$13.useSearch();
	const navigate = Route$13.useNavigate();
	const results = q.trim() ? searchProducts(q) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-7xl px-4 py-12 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-5xl",
				children: "Search"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
				className: "mt-6 max-w-xl",
				onSubmit: (e) => {
					e.preventDefault();
					const fd = new FormData(e.currentTarget);
					navigate({ search: { q: String(fd.get("q") ?? "") } });
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name: "q",
					defaultValue: q,
					placeholder: "Brand, product, SKU…"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm text-muted-foreground",
				children: q.trim() ? `${results.length} result${results.length === 1 ? "" : "s"} for “${q}”` : "Try MAC, Double Wear, or Clinique."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginatedGrid, { products: results })
			})
		]
	});
}
//#endregion
export { SearchPage as component };
