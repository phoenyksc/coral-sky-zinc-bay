import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  getCollection,
  productMinPrice,
  productOnSale,
  TOP_VENDORS,
  VENDORS,
} from "@/data/catalog";
import { liveProductsForCollection, useInventoryStore } from "@/lib/inventory-store";
import type { Product, SortKey } from "@/lib/types";
import { PaginatedGrid } from "@/components/product/paginated-grid";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/collections/$handle")({ component: CollectionPage });

function sortProducts(products: Product[], sort: SortKey, handle: string) {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => productMinPrice(a) - productMinPrice(b));
    case "price-desc":
      return copy.sort((a, b) => productMinPrice(b) - productMinPrice(a));
    case "title-asc":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "newest":
      return copy.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
    case "best-selling":
      return copy.sort((a, b) => b.sold - a.sold || b.watchers - a.watchers);
    default:
      if (handle === "popular" || handle === "low-inventory" || handle === "rare-finds" || handle === "beauty-sets") return copy;
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured) || b.sold - a.sold);
  }
}

function CollectionPage() {
  const { handle } = Route.useParams();
  const collection = getCollection(handle);
  const [vendors, setVendors] = useState<string[]>([]);
  const [inStock, setInStock] = useState(false);
  const [saleOnly, setSaleOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");
  const [moreBrands, setMoreBrands] = useState(false);

  useEffect(() => {
    setVendors([]);
    setInStock(false);
    setSaleOnly(false);
    setSort("featured");
    setMoreBrands(false);
  }, [handle]);

  const custom = useInventoryStore((s) => s.custom);
  const deleted = useInventoryStore((s) => s.deleted);
  const products = useMemo(() => {
    let list = liveProductsForCollection(handle);
    if (vendors.length) list = list.filter((p) => vendors.includes(p.vendor));
    if (inStock) list = list.filter((p) => p.variants.some((v) => v.available));
    if (saleOnly) list = list.filter(productOnSale);
    return sortProducts(list, sort, handle);
  }, [handle, vendors, inStock, saleOnly, sort, custom, deleted]);

  if (!collection) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl">Collection not found</h1>
        <Link to="/collections" className="mt-4 inline-block text-sm underline">Back to collections</Link>
      </main>
    );
  }

  const toggleVendor = (name: string) => {
    setVendors((prev) => (prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name]));
  };

  const brandList = moreBrands ? VENDORS : TOP_VENDORS;

  return (
    <main>
      <div className="relative isolate overflow-hidden">
        <img src={collection.image} alt="" className="h-56 w-full object-cover object-[center_22%] md:h-72" />
        <div className="absolute inset-0 bg-linear-to-t from-foreground/70 via-foreground/25 to-foreground/10" />
        <div className="absolute inset-0 flex flex-col justify-end px-4 py-8 sm:px-6">
          <div className="mx-auto w-full max-w-7xl text-background">
            <p className="text-[11px] tracking-[0.18em] uppercase">Collection</p>
            <h1 className="font-display text-5xl">{collection.title}</h1>
            <p className="mt-2 max-w-xl text-sm text-background/80">{collection.description}</p>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-8">
          <div>
            <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Brand</p>
            <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
              {brandList.map((vendor) => (
                <li key={vendor} className="flex items-center gap-2">
                  <Checkbox
                    id={`v-${vendor}`}
                    checked={vendors.includes(vendor)}
                    onCheckedChange={() => toggleVendor(vendor)}
                  />
                  <label htmlFor={`v-${vendor}`} className="text-sm">
                    {vendor}
                  </label>
                </li>
              ))}
            </ul>
            {VENDORS.length > TOP_VENDORS.length ? (
              <button
                type="button"
                className="mt-3 text-xs tracking-[0.12em] uppercase hover:opacity-70"
                onClick={() => setMoreBrands((v) => !v)}
              >
                {moreBrands ? "Show top brands" : `All ${VENDORS.length} brands`}
              </button>
            ) : null}
          </div>
          <div className="space-y-3">
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <Checkbox checked={inStock} onCheckedChange={(v) => setInStock(Boolean(v))} />
              In stock
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <Checkbox checked={saleOnly} onCheckedChange={(v) => setSaleOnly(Boolean(v))} />
              On sale
            </label>
          </div>
        </aside>
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground tabular-nums">{products.length} products</p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className={cn("h-10 rounded-md border border-input bg-card px-3 text-sm")}
              >
                <option value="featured">Featured</option>
                <option value="best-selling">Best selling</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price, low to high</option>
                <option value="price-desc">Price, high to low</option>
                <option value="title-asc">A–Z</option>
              </select>
            </label>
          </div>
          <PaginatedGrid products={products} priorityCount={4} />
        </div>
      </div>
    </main>
  );
}
