import { _ as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as ArrowRight } from "../_libs/lucide-react.mjs";
import { C as PRODUCTS, I as Button, S as COLLECTIONS, b as STORE, k as isRare } from "./router-oaCZX-Pv.mjs";
import { r as ProductGrid } from "./product-card-DyUHjowZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BMZN1x7G.js
var import_jsx_runtime = require_jsx_runtime();
var FEATURED_HANDLES = [
	"fragrances",
	"makeup",
	"skincare",
	"hair",
	"bath-body",
	"rare-finds"
];
function Home() {
	const featured = PRODUCTS.filter((p) => p.featured).slice(0, 8);
	const rare = PRODUCTS.filter(isRare).filter((p) => p.variants.some((v) => v.available)).slice(0, 8);
	const tiles = FEATURED_HANDLES.map((h) => COLLECTIONS.find((c) => c.handle === h));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative isolate min-h-[72vh] overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/hero.jpg",
					alt: "A quiet spa still life of fragrance, cream, and color",
					className: "absolute inset-0 size-full object-cover object-[center_42%] outline-none"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-r from-background/90 via-background/55 to-background/10" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 md:py-24",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] tracking-[0.22em] text-muted-foreground uppercase",
							children: "Fragrance · Makeup · Skincare"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-3 max-w-xl font-display text-5xl text-foreground sm:text-6xl md:text-7xl",
							children: "For the love of beauty and skin."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 max-w-lg text-sm leading-relaxed text-foreground/75 sm:text-base",
							children: "Scent that stays. Color that feels like you. Care that skin remembers. Sol Beautiful is a California house of designer beauty — collected with affection for the ritual itself."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex flex-wrap gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "lg",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/collections/$handle",
									params: { handle: "all" },
									children: "Shop the house"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "lg",
								variant: "outline",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/collections/$handle",
									params: { handle: "skincare" },
									children: "Skincare"
								})
							})]
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 py-16 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.18em] text-muted-foreground uppercase",
					children: "The house"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-4xl",
					children: "What we love"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/collections",
					className: "hidden items-center gap-1 text-xs tracking-[0.16em] uppercase sm:flex",
					children: ["All collections ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4",
				children: tiles.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/collections/$handle",
					params: { handle: c.handle },
					className: "group relative block overflow-hidden rounded-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "aspect-4/5 overflow-hidden bg-card",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: c.image,
								alt: c.title,
								className: "size-full object-cover object-[center_18%] transition-transform duration-500 group-hover:scale-[1.04]"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-t from-foreground/55 via-foreground/5 to-transparent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-x-0 bottom-0 p-4 text-background",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl md:text-3xl",
								children: c.title
							})
						})
					]
				}, c.id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 py-6 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 flex items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.18em] text-muted-foreground uppercase",
					children: "Favorites"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-4xl",
					children: "Pieces we reach for"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/collections/$handle",
					params: { handle: "bestsellers" },
					className: "text-xs tracking-[0.16em] uppercase",
					children: "View all"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductGrid, {
				products: featured,
				priorityCount: 4
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto mt-16 grid max-w-7xl overflow-hidden rounded-2xl bg-card md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/lifestyle/packing.jpg",
				alt: "Sol Beautiful beauty still life",
				className: "h-full min-h-72 w-full object-cover"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col justify-center px-6 py-12 sm:px-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] tracking-[0.18em] text-muted-foreground uppercase",
						children: "The ritual"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-4xl",
						children: "Beauty we actually use."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 max-w-md text-sm leading-relaxed text-muted-foreground",
						children: [
							"A scent that stays. Color that feels like you. Cream that takes care of skin. We collect designer fragrance, makeup, and skincare because we love how they live on a person — then pack every order in ",
							STORE.origin,
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/pages/about",
								children: "Our story"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/collections/$handle",
								params: { handle: "skincare" },
								children: "Shop skincare"
							})
						})]
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 py-20 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.18em] text-muted-foreground uppercase",
					children: "Allocated · discontinued"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-4xl",
					children: "When they sell out, they are gone"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductGrid, { products: rare })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-y border-border bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-8 text-[11px] tracking-[0.2em] text-muted-foreground uppercase sm:px-6",
				children: [
					"MAC",
					"Estée Lauder",
					"Clinique",
					"Lancôme",
					"Too Faced",
					"Tom Ford",
					"Yves Saint Laurent",
					"Bobbi Brown"
				].map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: b }, b))
			})
		})
	] });
}
//#endregion
export { Home as component };
