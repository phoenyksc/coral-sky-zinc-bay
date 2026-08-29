import { _ as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as Button, O as getProduct, c as useWishlistStore } from "./router-oaCZX-Pv.mjs";
import { r as ProductGrid } from "./product-card-DyUHjowZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wishlist-DxvErMZI.js
var import_jsx_runtime = require_jsx_runtime();
function WishlistPage() {
	const products = useWishlistStore((s) => s.handles).map(getProduct).filter((p) => Boolean(p));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-7xl px-4 py-12 sm:px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-5xl",
			children: "Wishlist"
		}), products.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductGrid, { products })
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-10 max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Save discontinued bottles and shades while you think. Hearts stay on this device."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-6",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/collections/$handle",
					params: { handle: "rare-finds" },
					children: "Browse hard to find"
				})
			})]
		})]
	});
}
//#endregion
export { WishlistPage as component };
