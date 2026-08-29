import { _ as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { M as productsForCollection, S as COLLECTIONS } from "./router-oaCZX-Pv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/collections-C-hYclgc.js
var import_jsx_runtime = require_jsx_runtime();
function CollectionsIndex() {
	const list = COLLECTIONS.filter((c) => c.handle !== "all");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-7xl px-4 py-12 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] tracking-[0.18em] text-muted-foreground uppercase",
				children: "The house"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-5xl",
				children: "Collections"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-sm text-muted-foreground",
				children: "Fragrance, makeup, skincare, hair, and bath — plus the discontinued cabinet. Pieces we love, packed in California."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: list.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/collections/$handle",
					params: { handle: c.handle },
					className: "group overflow-hidden rounded-xl bg-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "aspect-16/10 overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: c.image,
							alt: c.title,
							className: "size-full object-cover object-[center_22%] transition-transform duration-500 group-hover:scale-[1.04]"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: c.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: c.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs tracking-[0.12em] text-muted-foreground uppercase tabular-nums",
								children: [productsForCollection(c.handle).length, " pieces"]
							})
						]
					})]
				}, c.id))
			})
		]
	});
}
//#endregion
export { CollectionsIndex as component };
