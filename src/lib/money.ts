export function parseMoney(value: string | number | undefined | null): number {
  if (value == null || value === "") return 0;
  const n = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatMoney(value: string | number | undefined | null): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(parseMoney(value));
}

export function moneyString(value: number): string {
  return value.toFixed(2);
}

export function discountPercent(price: string, compareAt?: string): number | null {
  const p = parseMoney(price);
  const c = parseMoney(compareAt);
  if (!c || c <= p) return null;
  return Math.round(((c - p) / c) * 100);
}
