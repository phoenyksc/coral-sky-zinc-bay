import { _ as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prose-page-DngcZlGT.js
var import_jsx_runtime = require_jsx_runtime();
function ProsePage({ kicker, title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-2xl px-4 py-14 sm:px-6",
		children: [
			kicker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] tracking-[0.18em] text-muted-foreground uppercase",
				children: kicker
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-5xl",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-foreground [&_li]:mt-1 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5",
				children
			})
		]
	});
}
//#endregion
export { ProsePage as t };
