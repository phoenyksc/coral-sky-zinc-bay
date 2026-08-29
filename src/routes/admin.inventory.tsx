import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Copy, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  listManagedProducts,
  minPriceOf,
  useInventoryStore,
  warehouseOf,
} from "@/lib/inventory-store";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListingImage } from "@/components/product/listing-image";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/inventory")({ component: InventoryPage });

type Segment = "all" | "active" | "draft" | "low" | "ended";

function statusLabel(p: Product) {
  if (p.status === "draft") return "Draft";
  if (p.status === "ended") return "Ended";
  if (warehouseOf(p) === 0) return "Inactive";
  return "Active";
}

function InventoryPage() {
  const navigate = useNavigate();
  const custom = useInventoryStore((s) => s.custom);
  const deleted = useInventoryStore((s) => s.deleted);
  const views = useInventoryStore((s) => s.views);
  const patchQty = useInventoryStore((s) => s.patchQty);
  const patchPrice = useInventoryStore((s) => s.patchPrice);
  const copyAsTemplate = useInventoryStore((s) => s.copyAsTemplate);
  const removeListing = useInventoryStore((s) => s.removeListing);
  const setStatus = useInventoryStore((s) => s.setStatus);
  const products = useMemo(() => listManagedProducts({ custom, deleted }), [custom, deleted]);
  const [segment, setSegment] = useState<Segment>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter((p) => {
      if (segment === "active" && p.status !== "active") return false;
      if (segment === "draft" && p.status !== "draft") return false;
      if (segment === "ended" && p.status !== "ended") return false;
      if (segment === "low") {
        const qty = warehouseOf(p);
        if (!(qty > 0 && qty <= 5)) return false;
      }
      if (!query) return true;
      const hay = [
        p.title,
        p.vendor,
        p.id,
        ...p.variants.map((v) => `${v.sku} ${v.barcode ?? ""}`),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [products, segment, q]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const slice = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const counts = {
    all: products.length,
    active: products.filter((p) => p.status === "active").length,
    draft: products.filter((p) => p.status === "draft").length,
    low: products.filter((p) => {
      const qty = warehouseOf(p);
      return qty > 0 && qty <= 5;
    }).length,
    ended: products.filter((p) => p.status === "ended").length,
  };

  return (
    <main className="px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Listings & products</p>
          <h1 className="mt-1 font-display text-4xl">Manage inventory</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Search, edit quantity and price, copy a listing as a template, or open the full editor — the same
            flow as Seller Central and 3DSellers, on this catalog.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/listings/$id" params={{ id: "new" }}>
            <Plus className="size-4" /> Add a product
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", "active", "draft", "low", "ended"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setSegment(key);
              setPage(0);
            }}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs tracking-[0.12em] uppercase",
              segment === key ? "bg-foreground text-background" : "bg-card text-muted-foreground",
            )}
          >
            {key} · {counts[key].toLocaleString()}
          </button>
        ))}
      </div>

      <form
        className="mt-4 flex max-w-xl gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Search SKU, title, UPC"
            className="pl-10"
          />
        </div>
      </form>

      <p className="mt-3 text-xs text-muted-foreground">
        {filtered.length.toLocaleString()} listings · page {safePage + 1} of {pages}
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-border text-xs tracking-[0.12em] text-muted-foreground uppercase">
            <tr>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Product</th>
              <th className="px-3 py-3 font-medium">Sold / viewed</th>
              <th className="px-3 py-3 font-medium">Warehouse</th>
              <th className="px-3 py-3 font-medium">Price</th>
              <th className="px-3 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {slice.map((p) => {
              const qty = warehouseOf(p);
              const v0 = p.variants[0];
              const viewCount = p.watchers + (views[p.handle] ?? 0);
              return (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-3 align-top">
                    <p className={cn("text-xs", p.status === "active" && qty > 0 ? "text-foreground" : "text-destructive")}>
                      {statusLabel(p)}
                    </p>
                    {qty > 0 && qty <= 5 ? <p className="text-xs text-low">Low</p> : null}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-3">
                      <ListingImage src={p.images[0]?.src} alt="" className="size-14 rounded-md" />
                      <div className="min-w-0">
                        <Link to="/admin/listings/$id" params={{ id: p.id }} className="line-clamp-2 font-medium hover:underline">
                          {p.title}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {p.vendor} · {v0?.sku}
                          {v0?.barcode ? ` · UPC ${v0.barcode}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top text-xs text-muted-foreground tabular-nums">
                    {p.sold.toLocaleString()} sold
                    <br />
                    {viewCount.toLocaleString()} views
                  </td>
                  <td className="px-3 py-3 align-top">
                    {v0 ? (
                      <Input
                        className="h-9 w-20"
                        type="number"
                        min={0}
                        defaultValue={v0.inventoryQuantity}
                        key={`${p.id}-${v0.id}-${v0.inventoryQuantity}`}
                        onBlur={(e) => {
                          const n = Number(e.target.value);
                          if (Number.isFinite(n) && n !== v0.inventoryQuantity) {
                            patchQty(p.id, v0.id, n);
                            toast("Warehouse updated");
                          }
                        }}
                      />
                    ) : null}
                    {p.variants.length > 1 ? (
                      <p className="mt-1 text-xs text-muted-foreground">{qty} across {p.variants.length}</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 align-top">
                    {v0 ? (
                      <Input
                        className="h-9 w-24"
                        defaultValue={v0.price}
                        key={`${p.id}-price-${v0.price}`}
                        onBlur={(e) => {
                          const val = e.target.value.trim();
                          if (val && val !== v0.price) {
                            patchPrice(p.id, v0.id, val);
                            toast("Price updated");
                          }
                        }}
                      />
                    ) : (
                      formatMoney(minPriceOf(p))
                    )}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/admin/listings/$id" params={{ id: p.id }} search={{ tab: "offer" }}>
                          <Pencil className="size-3.5" /> Edit
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const copy = copyAsTemplate(p.id);
                          toast("Copied as a draft template");
                          void navigate({ to: "/admin/listings/$id", params: { id: copy.id } });
                        }}
                      >
                        <Copy className="size-3.5" /> Copy
                      </Button>
                      {p.status !== "ended" ? (
                        <Button variant="ghost" size="sm" onClick={() => setStatus(p.id, "ended")}>
                          End
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Delete ${p.title}?`)) {
                            removeListing(p.id);
                            toast("Listing deleted");
                          }
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Show
          <select
            className="h-9 rounded-md border border-input bg-card px-2"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)}>
            Next
          </Button>
        </div>
      </div>
    </main>
  );
}
