import { Drawer } from "vaul";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useCartStore, resolveLines, cartSubtotal, cartDiscount, cartCount } from "@/lib/cart-store";
import { useUiStore } from "@/lib/ui-store";
import { formatMoney } from "@/lib/money";
import { STORE } from "@/lib/store-config";
import { isLowVariant } from "@/data/catalog";
import { Button } from "@/components/ui/button";
import { QtyInput } from "@/components/product/qty-input";
import { ListingImage } from "@/components/product/listing-image";

export function CartDrawer() {
  const open = useUiStore((s) => s.cartOpen);
  const setOpen = useUiStore((s) => s.setCartOpen);
  const lines = useCartStore((s) => s.lines);
  const code = useCartStore((s) => s.discountCode);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeLine = useCartStore((s) => s.removeLine);
  const resolved = resolveLines(lines);
  const subtotal = cartSubtotal(lines);
  const discount = cartDiscount(lines, code);
  const after = Math.max(0, subtotal - discount);
  const toFree = Math.max(0, STORE.freeShippingThreshold - after);
  const count = cartCount(lines);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-foreground/35" />
        <Drawer.Content className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-md flex-col bg-background outline-none">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Drawer.Title className="font-display text-2xl tracking-tight">Bag {count ? `(${count})` : ""}</Drawer.Title>
            <button type="button" className="grid size-11 place-items-center" aria-label="Close bag" onClick={() => setOpen(false)}>
              <X className="size-5" />
            </button>
          </div>
          {resolved.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <p className="font-display text-3xl">Your bag is empty</p>
              <p className="mt-2 text-sm text-muted-foreground">Fragrance, makeup, and skincare we actually love.</p>
              <Button className="mt-6" onClick={() => setOpen(false)} asChild>
                <Link to="/collections/$handle" params={{ handle: "all" }}>Shop the vault</Link>
              </Button>
            </div>
          ) : (
            <>
              {toFree > 0 ? (
                <p className="border-b border-border px-5 py-3 text-xs tracking-wide text-muted-foreground">
                  {formatMoney(toFree)} away from free standard shipping.
                </p>
              ) : (
                <p className="border-b border-border px-5 py-3 text-xs tracking-wide">You have free standard shipping.</p>
              )}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <ul className="space-y-5">
                  {resolved.map(({ line, product, variant }) => (
                    <li key={line.id} className="flex gap-3">
                      <Link
                        to="/products/$handle"
                        params={{ handle: product.handle }}
                        onClick={() => setOpen(false)}
                        className="size-24 shrink-0 overflow-hidden rounded-md bg-card"
                      >
                        <ListingImage src={product.images[0]?.src} alt="" className="size-full" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{product.vendor}</p>
                        <Link
                          to="/products/$handle"
                          params={{ handle: product.handle }}
                          onClick={() => setOpen(false)}
                          className="block truncate text-sm font-medium"
                        >
                          {product.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">{variant.title}</p>
                        {isLowVariant(variant) ? (
                          <p className="mt-0.5 text-[11px] font-medium tracking-[0.08em] text-low uppercase">
                            Low inventory · {variant.inventoryQuantity} left
                          </p>
                        ) : null}
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <QtyInput
                            value={line.quantity}
                            max={variant.inventoryQuantity}
                            onChange={(n) => updateQty(line.id, n)}
                            className="h-9"
                          />
                          <p className="text-sm tabular-nums">{formatMoney(Number(variant.price) * line.quantity)}</p>
                        </div>
                        <button
                          type="button"
                          className="mt-1 text-xs text-muted-foreground underline-offset-2 hover:underline"
                          onClick={() => removeLine(line.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-border px-5 py-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatMoney(subtotal)}</span>
                </div>
                {discount > 0 ? (
                  <div className="mt-1 flex justify-between text-sm text-sale">
                    <span>Discount {code}</span>
                    <span className="tabular-nums">−{formatMoney(discount)}</span>
                  </div>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">Shipping and tax calculated at checkout.</p>
                <Button className="mt-4 w-full" size="lg" asChild>
                  <Link to="/checkout" onClick={() => setOpen(false)}>Checkout</Link>
                </Button>
                <Button className="mt-2 w-full" variant="outline" asChild>
                  <Link to="/cart" onClick={() => setOpen(false)}>View bag</Link>
                </Button>
              </div>
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
