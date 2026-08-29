import "../_runtime.mjs";
import { _ as require_jsx_runtime, v as require_react } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { I as Button, L as cn, b as STORE, o as Input } from "./router-oaCZX-Pv.mjs";
import { t as ProsePage } from "./prose-page-DngcZlGT.mjs";
import { t as Label } from "./label-CNi3UKDr.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-28 w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground shadow-[var(--shadow-border)] placeholder:text-muted-foreground focus-visible:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ProsePage, {
		kicker: "Inbox",
		title: "Contact",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [STORE.email, STORE.origin ? ` · ${STORE.origin}` : ""] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Include an order number if you have one — that is the fastest way to pull the ",
				STORE.shippingTool,
				" invoice. We read this inbox during California business hours."
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6 space-y-4 text-foreground",
				onSubmit: (e) => {
					e.preventDefault();
					toast("Message saved — in production this emails the shop.");
					e.currentTarget.reset();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "name",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "name",
							name: "name",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "email",
							children: "Email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "email",
							name: "email",
							type: "email",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "order",
							children: "Order number"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "order",
							name: "order"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "msg",
							children: "Message"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "msg",
							name: "msg",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Send"
					})
				]
			})
		]
	});
}
//#endregion
export { Page as component };
