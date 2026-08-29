import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { isRare, isLowInventory, productMinPrice, productOnSale, warehouseQty } from "@/data/catalog";
import { formatMoney } from "@/lib/money";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useCartStore } from "@/lib/cart-store";
import { useUiStore } from "@/lib/ui-store";
import { Badge } from "@/components/ui/badge";
import { ListingImage } from "@/components/product/listing-image";
import { cn } from "@/lib/utils";

export function ProductCard({ product, priority = false, className }: { product: Product; priority?: boolean; className?: string }) {
  const image = product.images[0];
  const variant = product.variants.find((v) => v.available) ?? product.variants[0];
  const sale = productOnSale(product);
  const rare = isRare(product);
  const wished = useWishlistStore((s) => s.handles.includes(product.handle));
  const toggleWish = useWishlistStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const min = productMinPrice(product);
  const hasOptions = product.variants.length > 1 && product.options[0]?.name !== "Title";
  const soldOut = !product.variants.some((v) => v.available);
  const warehouse = warehouseQty(product);
  const low = isLowInventory(product);

  return (
    <article className={cn("group relative flex h-full flex-col", low && "rounded-lg", className)}>
      <Link
        to="/products/$handle"
        params={{ handle: product.handle }}
        className={cn(
          "relative block overflow-hidden rounded-lg bg-card",
          low && "ring-2 ring-low/85 ring-offset-2 ring-offset-background",
        )}
      >
        <ListingImage
          src={image?.src}
          alt={image?.alt ?? product.title}
          className="aspect-square"
          imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          priority={priority}
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {rare ? <Badge variant="default">Hard to find</Badge> : null}
          {sale && !rare ? <Badge variant="sale">Sale</Badge> : null}
          {soldOut ? <Badge variant="muted">Sold out</Badge> : null}
          {low ? <Badge variant="low" className="whitespace-nowrap">Low · {warehouse} left</Badge> : null}
        </div>
      </Link>
      <button
        type="button"
        aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
        onClick={() => {
          const on = toggleWish(product.handle);
          toast(on ? "Saved to wishlist" : "Removed from wishlist");
        }}
        className="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-card/90 text-foreground shadow-[var(--shadow-border)] backdrop-blur-sm"
      >
        <Heart className={cn("size-4", wished && "fill-foreground")} />
      </button>
      <div className="flex flex-1 flex-col gap-1 pt-3">
        <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{product.vendor}</p>
        <Link
          to="/products/$handle"
          params={{ handle: product.handle }}
          className="font-display text-lg leading-snug tracking-tight text-balance line-clamp-3 hover:opacity-70"
        >
          {product.title}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <p className="text-sm tabular-nums">
            {hasOptions ? `From ${formatMoney(min)}` : formatMoney(variant.price)}
            {variant.compareAtPrice ? (
              <span className="ml-2 text-muted-foreground line-through">{formatMoney(variant.compareAtPrice)}</span>
            ) : null}
          </p>
          {!hasOptions && !soldOut ? (
            <button
              type="button"
              className="text-[11px] tracking-[0.14em] uppercase opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
              onClick={() => {
                const res = addItem(product.id, variant.id, 1);
                if (res.ok) {
                  toast(res.message);
                  setCartOpen(true);
                } else toast.error(res.message);
              }}
            >
              Add
            </button>
          ) : (
            <Link
              to="/products/$handle"
              params={{ handle: product.handle }}
              className="text-[11px] tracking-[0.14em] uppercase opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
            >
              {soldOut ? "View" : "Options"}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: Product[]; priorityCount?: number }) {
  if (!products.length) {
    return (
      <div className="border border-dashed border-border px-6 py-16 text-center">
        <p className="font-display text-2xl">Nothing matches</p>
        <p className="mt-2 text-sm text-muted-foreground">Try clearing filters or searching another brand.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}
