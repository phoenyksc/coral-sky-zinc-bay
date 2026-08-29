import type { Product } from "@/lib/types";
import type { Order } from "@/lib/types";
import { warehouseOf, minPriceOf } from "@/lib/inventory-store";

export function buildReports(
  products: Product[],
  views: Record<string, number>,
  orders: Order[],
) {
  const active = products.filter((p) => p.status === "active");
  const drafts = products.filter((p) => p.status === "draft");
  const ended = products.filter((p) => p.status === "ended");
  const units = products.reduce((s, p) => s + warehouseOf(p), 0);
  const skus = products.reduce((s, p) => s + p.variants.length, 0);
  const catalogSold = products.reduce((s, p) => s + p.sold, 0);
  const catalogWatch = products.reduce((s, p) => s + p.watchers, 0);
  const siteViews = Object.values(views).reduce((s, n) => s + n, 0);
  const orderUnits = orders.reduce((s, o) => s + o.lines.reduce((a, l) => a + l.quantity, 0), 0);
  const orderSales = orders.reduce((s, o) => s + o.total, 0);
  const inventoryValue = products.reduce(
    (s, p) => s + p.variants.reduce((a, v) => a + v.inventoryQuantity * (Number.parseFloat(v.price) || 0), 0),
    0,
  );
  const low = active.filter((p) => {
    const q = warehouseOf(p);
    return q > 0 && q <= 5;
  });
  const out = active.filter((p) => warehouseOf(p) === 0);
  const byType = new Map<string, { type: string; sold: number; units: number; skus: number }>();
  for (const p of products) {
    const cur = byType.get(p.productType) ?? { type: p.productType, sold: 0, units: 0, skus: 0 };
    cur.sold += p.sold;
    cur.units += warehouseOf(p);
    cur.skus += p.variants.length;
    byType.set(p.productType, cur);
  }
  const scored = active.map((p) => ({
    product: p,
    views: p.watchers + (views[p.handle] ?? 0),
    sold: p.sold,
    qty: warehouseOf(p),
    value: warehouseOf(p) * minPriceOf(p),
  }));
  const topSold = [...scored].sort((a, b) => b.sold - a.sold).slice(0, 8);
  const topViewed = [...scored].sort((a, b) => b.views - a.views).slice(0, 8);
  const lowRows = [...scored].filter((r) => r.qty > 0).sort((a, b) => a.qty - b.qty).slice(0, 8);

  return {
    listings: products.length,
    active: active.length,
    drafts: drafts.length,
    ended: ended.length,
    skus,
    units,
    catalogSold,
    orderUnits,
    sold: catalogSold + orderUnits,
    catalogWatch,
    siteViews,
    views: catalogWatch + siteViews,
    orderSales,
    inventoryValue,
    low: low.length,
    out: out.length,
    byType: [...byType.values()].sort((a, b) => b.sold - a.sold),
    topSold,
    topViewed,
    lowRows,
  };
}
