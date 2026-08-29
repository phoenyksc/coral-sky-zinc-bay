import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useCartStore, resolveLines, cartSubtotal, cartDiscount, cartCount } from "@/lib/cart-store";
import { formatMoney } from "@/lib/money";
import { STORE } from "@/lib/store-config";
import { isLowVariant } from "@/data/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QtyInput } from "@/components/product/qty-input";
import { ListingImage } from "@/components/product/listing-image";
import { CartCompleteTheLook } from "@/components/product/complete-the-look";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const code = useCartStore((s) => s.discountCode);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeLine = useCartStore((s) => s.removeLine);
  const applyCode = useCartStore((s) => s.applyCode);
  const clearCode = useCartStore((s) => s.clearCode);
  const [draft, setDraft] = useState(code);
  const resolved = resolveLines(lines);
  const subtotal = cartSubtotal(lines);
  const discount = cartDiscount(lines, code);
  const after = Math.max(0, subtotal - discount);
  const count = cartCount(lines);

  if (!resolved.length) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-5xl">Your bag is empty</h1>
        <p className="mt-3 text-sm text-muted-foreground">Designer stock, discontinued pieces, packed from California.</p>
        <Button className="mt-8" asChild>
          <Link to="/collections/$handle" params={{ handle: "all" }}>Continue shopping</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_340px]">
      <div>
        <h1 className="font-display text-5xl">Bag ({count})</h1>
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {resolved.map(({ line, product, variant }) => (
            <li key={line.id} className="flex gap-4 py-6">
              <Link to="/products/$handle" params={{ handle: product.handle }} className="size-28 shrink-0 overflow-hidden rounded-md bg-card">
                <ListingImage src={product.images[0]?.src} alt="" className="size-full" />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{product.vendor}</p>
                <Link to="/products/$handle" params={{ handle: product.handle }} className="font-medium">
                  {product.title}
                </Link>
                <p className="text-sm text-muted-foreground">{variant.title} · {variant.sku}</p>
                {isLowVariant(variant) ? (
                  <p className="mt-1 text-[11px] font-medium tracking-[0.1em] text-low uppercase">
                    Low inventory · {variant.inventoryQuantity} left in warehouse
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <QtyInput value={line.quantity} max={variant.inventoryQuantity} onChange={(n) => updateQty(line.id, n)} />
                  <p className="tabular-nums">{formatMoney(Number(variant.price) * line.quantity)}</p>
                </div>
                <button type="button" className="mt-2 text-xs text-muted-foreground underline" onClick={() => removeLine(line.id)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <CartCompleteTheLook lines={resolved.map(({ product, variant }) => ({ product, variant }))} />
      </div>
      <aside className="h-fit rounded-xl bg-card p-6 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-2xl">Summary</h2>
        <div className="mt-4 flex justify-between text-sm">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatMoney(subtotal)}</span>
        </div>
        {discount > 0 ? (
          <div className="mt-2 flex justify-between text-sm text-sale">
            <span>Discount {code}</span>
            <span className="tabular-nums">−{formatMoney(discount)}</span>
          </div>
        ) : null}
        <p className="mt-2 text-xs text-muted-foreground">
          {after >= STORE.freeShippingThreshold
            ? "You have free standard shipping."
            : `${formatMoney(STORE.freeShippingThreshold - after)} to free standard shipping.`}
        </p>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const res = applyCode(draft);
            if (res.ok) toast(res.message);
            else toast.error(res.message);
          }}
        >
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Promo code" />
          <Button type="submit" variant="outline">Apply</Button>
        </form>
        {code ? (
          <button type="button" className="mt-2 text-xs underline" onClick={clearCode}>
            Remove code
          </button>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">Try SOL15, WELCOME10, or RARE20.</p>
        )}
        <div className="mt-6 flex justify-between text-base font-medium">
          <span>Estimated</span>
          <span className="tabular-nums">{formatMoney(after)}</span>
        </div>
        <Button className="mt-4 w-full" size="lg" asChild>
          <Link to="/checkout">Checkout</Link>
        </Button>
      </aside>
    </main>
  );
}
