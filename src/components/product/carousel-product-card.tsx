import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { isRare, isLowInventory, productOnSale, warehouseQty } from "@/data/catalog";
import { formatMoney } from "@/lib/money";
import { useWishlistStore } from "@/lib/wishlist-store";
import { ListingImage } from "@/components/product/listing-image";
import { cn } from "@/lib/utils";

function compactCount(n: number) {
  if (n >= 10000) return `${Math.round(n / 1000)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function CarouselProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const image = product.images[0];
  const variant = product.variants.find((v) => v.available) ?? product.variants[0];
  const sale = productOnSale(product);
  const rare = isRare(product);
  const wished = useWishlistStore((s) => s.handles.includes(product.handle));
  const toggleWish = useWishlistStore((s) => s.toggle);
  const shades = product.variants.length;
  const hasOptions = shades > 1 && product.options[0]?.name !== "Title";
  const soldOut = !product.variants.some((v) => v.available);
  const warehouse = warehouseQty(product);
  const low = isLowInventory(product);
  const prices = product.variants.map((v) => Number.parseFloat(v.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceLabel =
    hasOptions && maxPrice > minPrice ? `${formatMoney(minPrice)} – ${formatMoney(maxPrice)}` : formatMoney(minPrice);

  const flag = soldOut
    ? { label: "Sold out", className: "text-muted-foreground" }
    : low
      ? { label: `Only ${warehouse} left`, className: "text-sale" }
      : rare
        ? { label: "Limited edition", className: "text-foreground" }
        : sale
          ? { label: "Sale", className: "text-sale" }
          : null;

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative">
        <Link
          to="/products/$handle"
          params={{ handle: product.handle }}
          className="relative block overflow-hidden bg-card"
        >
          <ListingImage
            src={image?.src}
            alt={image?.alt ?? product.title}
            className="aspect-square"
            priority={priority}
          />
          <span className="absolute inset-x-0 bottom-0 hidden bg-foreground py-2.5 text-center text-[11px] font-medium tracking-[0.16em] text-background uppercase opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 md:block">
            Quicklook
          </span>
        </Link>
        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          onClick={() => {
            const on = toggleWish(product.handle);
            toast(on ? "Saved to wishlist" : "Removed from wishlist");
          }}
          className="absolute top-1 right-1 grid size-11 place-items-center text-foreground"
        >
          <Heart className={cn("size-5", wished && "fill-foreground")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-2.5">
        {flag ? (
          <p className={cn("mb-1 text-[11px] font-medium tracking-wide", flag.className)}>{flag.label}</p>
        ) : null}
        <p className="text-[13px] font-semibold leading-tight">{product.vendor}</p>
        <Link
          to="/products/$handle"
          params={{ handle: product.handle }}
          className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-foreground/80 hover:underline"
        >
          {product.title}
        </Link>
        <p className="mt-1.5 text-[13px] font-semibold tabular-nums">
          {priceLabel}
          {variant.compareAtPrice ? (
            <span className="ml-1.5 font-normal text-muted-foreground line-through">
              {formatMoney(variant.compareAtPrice)}
            </span>
          ) : null}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
          {product.sold > 0 ? <span className="tabular-nums">{compactCount(product.sold)} sold</span> : null}
          {hasOptions ? <span>{shades} shades</span> : null}
        </div>
      </div>
    </article>
  );
}
