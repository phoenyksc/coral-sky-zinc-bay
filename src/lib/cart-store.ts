import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, Product } from "@/lib/types";
import { uniqueId } from "@/lib/utils";
import { liveGetProductById } from "@/lib/inventory-store";
import { parseMoney } from "@/lib/money";
import { PROMO_CODES, STORE } from "@/lib/store-config";
import { lookupPromo } from "@/lib/referral-store";
import { accountFlags } from "@/lib/account-flags";

interface CartState {
  lines: CartLine[];
  discountCode: string;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  addItem: (productId: string, variantId: string, quantity?: number) => { ok: boolean; message: string };
  updateQty: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  applyCode: (code: string) => { ok: boolean; message: string };
  clearCode: () => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      discountCode: "",
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      addItem: (productId, variantId, quantity = 1) => {
        const product = liveGetProductById(productId);
        const variant = product?.variants.find((v) => v.id === variantId);
        if (!product || !variant) return { ok: false, message: "That item is no longer available." };
        if (!variant.available || variant.inventoryQuantity <= 0) {
          return { ok: false, message: "This size is sold out." };
        }
        const existing = get().lines.find((l) => l.variantId === variantId);
        const nextQty = (existing?.quantity ?? 0) + quantity;
        if (nextQty > variant.inventoryQuantity) {
          return { ok: false, message: `Only ${variant.inventoryQuantity} left.` };
        }
        if (existing) {
          set({
            lines: get().lines.map((l) => (l.id === existing.id ? { ...l, quantity: nextQty } : l)),
          });
        } else {
          set({
            lines: [...get().lines, { id: uniqueId("line"), productId, variantId, quantity }],
          });
        }
        return { ok: true, message: "Added to bag." };
      },
      updateQty: (lineId, quantity) => {
        if (quantity <= 0) {
          set({ lines: get().lines.filter((l) => l.id !== lineId) });
          return;
        }
        const line = get().lines.find((l) => l.id === lineId);
        if (!line) return;
        const product = liveGetProductById(line.productId);
        const variant = product?.variants.find((v) => v.id === line.variantId);
        const max = variant?.inventoryQuantity ?? quantity;
        set({
          lines: get().lines.map((l) =>
            l.id === lineId ? { ...l, quantity: Math.min(quantity, max) } : l,
          ),
        });
      },
      removeLine: (lineId) => set({ lines: get().lines.filter((l) => l.id !== lineId) }),
      applyCode: (code) => {
        const key = code.trim().toUpperCase();
        if (key === "FIRST10") {
          if (!accountFlags.signedIn) {
            return { ok: false, message: "Create an account to unlock 10% off your first purchase." };
          }
          if (accountFlags.firstPurchaseUsed) {
            return { ok: false, message: "Your first-purchase code has already been used." };
          }
        }
        const promo = PROMO_CODES[key] ?? lookupPromo(key);
        if (!promo) return { ok: false, message: "That code isn’t valid." };
        const subtotal = cartSubtotal(get().lines);
        if (promo.minSubtotal && subtotal < promo.minSubtotal) {
          return { ok: false, message: `Code requires a $${promo.minSubtotal} subtotal.` };
        }
        set({ discountCode: key });
        return { ok: true, message: `${promo.label} applied.` };
      },
      clearCode: () => set({ discountCode: "" }),
      clear: () => set({ lines: [], discountCode: "" }),
    }),
    {
      name: "sol-beautiful-cart-v1",
      partialize: (s) => ({ lines: s.lines, discountCode: s.discountCode }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);

export interface ResolvedLine {
  line: CartLine;
  product: Product;
  variant: Product["variants"][number];
}

export function resolveLines(lines: CartLine[]): ResolvedLine[] {
  const out: ResolvedLine[] = [];
  for (const line of lines) {
    const product = liveGetProductById(line.productId);
    const variant = product?.variants.find((v) => v.id === line.variantId);
    if (product && variant) out.push({ line, product, variant });
  }
  return out;
}

export function cartSubtotal(lines: CartLine[]): number {
  return resolveLines(lines).reduce(
    (sum, { line, variant }) => sum + parseMoney(variant.price) * line.quantity,
    0,
  );
}

export function cartDiscount(lines: CartLine[], code: string): number {
  const key = code.trim().toUpperCase();
  if (key === "FIRST10" && (!accountFlags.signedIn || accountFlags.firstPurchaseUsed)) return 0;
  const promo = PROMO_CODES[key] ?? lookupPromo(key);
  if (!promo) return 0;
  const resolved = resolveLines(lines);
  const subtotal = cartSubtotal(lines);
  if (promo.minSubtotal && subtotal < promo.minSubtotal) return 0;
  if (key === "RARE20") {
    const rareSub = resolved
      .filter(({ product }) => product.tags.includes("rare") || product.tags.includes("discontinued"))
      .reduce((s, { line, variant }) => s + parseMoney(variant.price) * line.quantity, 0);
    return Math.round(rareSub * 0.2 * 100) / 100;
  }
  if (promo.type === "percent") return Math.round(subtotal * (promo.value / 100) * 100) / 100;
  return Math.min(promo.value, subtotal);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.quantity, 0);
}

export function shippingCost(subtotalAfterDiscount: number, method: "standard" | "express"): number {
  if (method === "express") return STORE.expressShipping;
  if (subtotalAfterDiscount >= STORE.freeShippingThreshold) return 0;
  return STORE.standardShipping;
}

export function taxAmount(taxable: number, state: string): number {
  if (state.toUpperCase() === "CA") return Math.round(taxable * STORE.caTaxRate * 100) / 100;
  return 0;
}
