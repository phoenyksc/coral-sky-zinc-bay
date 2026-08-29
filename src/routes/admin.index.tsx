import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { listManagedProducts, useInventoryStore } from "@/lib/inventory-store";
import { useOrdersStore } from "@/lib/orders-store";
import { usePublishStore } from "@/lib/publish-store";
import { buildReports } from "@/lib/admin-reports";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { ListingImage } from "@/components/product/listing-image";

export const Route = createFileRoute("/admin/")({ component: ReportsPage });

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-card px-4 py-4 shadow-[var(--shadow-border)]">
      <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function ReportsPage() {
  const custom = useInventoryStore((s) => s.custom);
  const deleted = useInventoryStore((s) => s.deleted);
  const views = useInventoryStore((s) => s.views);
  const orders = useOrdersStore((s) => s.orders);
  const publicLive = usePublishStore((s) => s.publicLive);
  const setPublicLive = usePublishStore((s) => s.setPublicLive);
  const products = useMemo(() => listManagedProducts({ custom, deleted }), [custom, deleted]);
  const r = useMemo(() => buildReports(products, views, orders), [products, views, orders]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">The vault</p>
          <h1 className="mt-1 font-display text-4xl">Reports</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Warehouse, sales, and attention across the catalog — the same figures 3DSellers, eBay, and Seller Central
            keep in three different places.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/listings/$id" params={{ id: "new" }}>Create listing</Link>
        </Button>
      </div>

      <section className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card px-4 py-4 shadow-[var(--shadow-border)]">
        <div>
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Public shop</p>
          <p className="mt-1 text-sm">
            {publicLive
              ? "Published — the vault is hidden from the shop and requires administrator sign-in and 2FA."
              : "Building — the vault is on the shop so you can list, report, and export. Publish when you want it gated."}
          </p>
        </div>
        <Button type="button" variant={publicLive ? "outline" : "default"} onClick={() => setPublicLive(!publicLive)}>
          {publicLive ? "Return to building" : "Publish and gate the vault"}
        </Button>
      </section>

      <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Active listings" value={r.active.toLocaleString()} hint={`${r.drafts} drafts · ${r.ended} ended`} />
        <Stat label="Warehouse units" value={r.units.toLocaleString()} hint={`${r.skus.toLocaleString()} SKUs`} />
        <Stat label="Units sold" value={r.sold.toLocaleString()} hint={`${r.orderUnits} on this site`} />
        <Stat label="Inventory value" value={formatMoney(r.inventoryValue)} hint="On-hand × list price" />
        <Stat label="Views / watchers" value={r.views.toLocaleString()} hint={`${r.siteViews} on this site`} />
        <Stat label="Site orders" value={formatMoney(r.orderSales)} hint={`${orders.length} checkouts`} />
        <Stat label="Low inventory" value={String(r.low)} hint="Fewer than 6 in warehouse" />
        <Stat label="Out of stock" value={String(r.out)} hint="Active with 0 units" />
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-2xl">Sold by category</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={r.byType} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} />
                <Tooltip />
                <Bar dataKey="sold" fill="var(--color-foreground)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-2xl">Units on hand</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={r.byType} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} />
                <Tooltip />
                <Bar dataKey="units" fill="var(--color-muted-foreground)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-3">
        <Rank title="Most sold" rows={r.topSold} value={(row) => `${row.sold.toLocaleString()} sold`} />
        <Rank title="Most viewed" rows={r.topViewed} value={(row) => `${row.views.toLocaleString()} views`} />
        <Rank title="Low inventory" rows={r.lowRows} value={(row) => `${row.qty} left`} />
      </section>
    </main>
  );
}

function Rank({
  title,
  rows,
  value,
}: {
  title: string;
  rows: Array<{ product: { id: string; handle: string; title: string; images: { src: string }[] }; sold: number; views: number; qty: number }>;
  value: (row: { sold: number; views: number; qty: number }) => string;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl">{title}</h2>
      <ul className="mt-3 divide-y divide-border">
        {rows.map((row) => (
          <li key={row.product.id} className="flex items-center gap-3 py-2">
            <ListingImage src={row.product.images[0]?.src} alt="" className="size-10 rounded-md" />
            <Link to="/admin/listings/$id" params={{ id: row.product.id }} className="min-w-0 flex-1 truncate text-sm hover:underline">
              {row.product.title}
            </Link>
            <span className="text-xs text-muted-foreground tabular-nums">{value(row)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
