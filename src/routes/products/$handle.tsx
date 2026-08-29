import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import {
  averageRating,
  isLowInventory,
  isLowVariant,
  isRare,
  relatedProducts,
  reviewsFor,
  warehouseQty,
} from "@/data/catalog";
import { liveGetProduct, useInventoryStore } from "@/lib/inventory-store";
import { useCartStore } from "@/lib/cart-store";
import { useUiStore } from "@/lib/ui-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useRecentStore } from "@/lib/recent-store";
import { STORE } from "@/lib/store-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Price } from "@/components/product/price";
import { QtyInput } from "@/components/product/qty-input";
import { ProductGrid } from "@/components/product/product-card";
import { ListingImage } from "@/components/product/listing-image";
import { ProductCompleteTheLook } from "@/components/product/complete-the-look";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products/$handle")({ component: ProductPage });

function ProductPage() {
  const { handle } = Route.useParams();
  const custom = useInventoryStore((s) => s.custom);
  const deleted = useInventoryStore((s) => s.deleted);
  const product = liveGetProduct(handle);
  const recordView = useInventoryStore((s) => s.recordView);
  const [variantId, setVariantId] = useState(product?.variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const wished = useWishlistStore((s) => s.handles.includes(handle));
  const toggleWish = useWishlistStore((s) => s.toggle);
  const pushRecent = useRecentStore((s) => s.push);

  useEffect(() => {
    recordView(handle);
    pushRecent(handle);
  }, [handle, recordView, pushRecent]);

  useEffect(() => {
    if (product) {
      setVariantId(product.variants[0]?.id ?? "");
      setQty(1);
    }
  }, [handle, custom, deleted]);

  if (!product) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl">Product not found</h1>
        <Link to="/collections/$handle" params={{ handle: "all" }} className="mt-4 inline-block text-sm underline">
          Shop the vault
        </Link>
      </main>
    );
  }

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const rare = isRare(product);
  const related = relatedProducts(product);
  const reviews = reviewsFor(product.handle);
  const rating = averageRating(product.handle);
  const showOptions = product.variants.length > 1;
  const warehouse = warehouseQty(product);
  const listingLow = isLowInventory(product);
  const shadeLow = isLowVariant(variant);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/collections/$handle" params={{ handle: product.collectionHandles[0] ?? "all" }} className="hover:underline">
          {product.productType}
        </Link>
        <span className="mx-2">/</span>
        {product.title}
      </p>
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl bg-card">
          <ListingImage
            src={product.images[0]?.src}
            alt={product.images[0]?.alt ?? product.title}
            className="aspect-square w-full"
            priority
          />
        </div>
        <div>
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">{product.vendor}</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">{product.title}</h1>
          {rating ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {rating.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </p>
          ) : product.sold > 0 ? (
            <p className="mt-2 text-sm text-muted-foreground tabular-nums">
              {product.sold.toLocaleString()} sold
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {rare ? <Badge>Hard to find</Badge> : null}
            {listingLow ? <Badge variant="low">Low inventory · {warehouse} in warehouse</Badge> : null}
            {product.tags.includes("discontinued") ? <Badge variant="outline">Discontinued</Badge> : null}
            {product.category ? <Badge variant="outline">{product.category}</Badge> : null}
            <Badge variant="outline">Ships from the USA</Badge>
          </div>
          <div className="mt-5">
            <Price price={variant.price} compareAt={variant.compareAtPrice} size="lg" />
          </div>
          {showOptions ? (
            <div className="mt-8">
              <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {product.options[0].name}: <span className="text-foreground">{variant.option1 ?? variant.title}</span>
              </p>
              <div className="mt-3 flex max-h-52 flex-wrap gap-2 overflow-y-auto">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setVariantId(v.id);
                      setQty(1);
                    }}
                    className={cn(
                      "h-11 min-w-11 rounded-md border px-4 text-sm transition-colors",
                      variantId === v.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card hover:border-foreground/40",
                      !v.available && "cursor-not-allowed opacity-40 line-through",
                      isLowVariant(v) && v.available && variantId !== v.id && "border-low/60",
                    )}
                  >
                    {v.option1 ?? v.title}
                    {isLowVariant(v) ? (
                      <span className="ml-1.5 text-[10px] tracking-wide uppercase opacity-80">{v.inventoryQuantity} left</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {listingLow || shadeLow ? (
            <p className="mt-4 rounded-md bg-low px-4 py-3 text-sm text-primary-foreground">
              {showOptions && shadeLow
                ? `Low inventory — ${variant.inventoryQuantity} of this ${product.options[0]?.name.toLowerCase() ?? "option"} in the warehouse.`
                : `Low inventory — ${warehouse} in the warehouse.`}
            </p>
          ) : null}
          <p className="mt-4 text-xs text-muted-foreground">
            SKU {variant.sku}
            {variant.barcode ? ` · UPC ${variant.barcode}` : ""}
            {shadeLow
              ? ` · Only ${variant.inventoryQuantity} left`
              : variant.available
                ? ` · ${variant.inventoryQuantity} in stock`
                : " · Sold out"}
          </p>
          {variant.barcode ? (
            <p className="mt-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              Manufacturer barcode for this {showOptions ? "shade" : "piece"}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <QtyInput value={qty} max={Math.max(1, variant.inventoryQuantity)} onChange={setQty} />
            <Button
              size="lg"
              className="min-w-48 flex-1"
              disabled={!variant.available}
              onClick={() => {
                const res = addItem(product.id, variant.id, qty);
                if (res.ok) {
                  toast(res.message);
                  setCartOpen(true);
                } else toast.error(res.message);
              }}
            >
              Add to bag
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="Wishlist"
              onClick={() => toast(toggleWish(product.handle) ? "Saved to wishlist" : "Removed from wishlist")}
            >
              <Heart className={cn("size-4", wished && "fill-foreground")} />
            </Button>
          </div>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Truck className="size-4" /> Free standard shipping over ${STORE.freeShippingThreshold} · ships from the USA
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4" /> Authenticity guaranteed · packed from {STORE.origin}
            </li>
          </ul>
          <Accordion type="single" collapsible defaultValue="details" className="mt-8">
            <AccordionItem value="details">
              <AccordionTrigger>Details</AccordionTrigger>
              <AccordionContent>
                <div className="prose-p:mb-3" dangerouslySetInnerHTML={{ __html: product.bodyHtml }} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping</AccordionTrigger>
              <AccordionContent>
                Packed in {STORE.origin} and shipped from the United States. Labels printed in {STORE.shippingTool}.
                Standard 3–5 business days. Express 1–2. Free standard over ${STORE.freeShippingThreshold}. See our{" "}
                <Link to="/pages/shipping" className="underline">shipping policy</Link>.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns">
              <AccordionTrigger>Returns</AccordionTrigger>
              <AccordionContent>
                Unopened items in original packaging may be returned within 14 days. Opened fragrance and used makeup
                are final sale. <Link to="/pages/returns" className="underline">Full policy</Link>.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="auth">
              <AccordionTrigger>Authenticity</AccordionTrigger>
              <AccordionContent>
                Factory-sealed designer stock where the manufacturer sealed it. We do not sell clones or decants as authentic.
                {variant.barcode ? ` UPC ${variant.barcode} is the manufacturer barcode for this shade.` : ""} See our{" "}
                <Link to="/pages/authenticity" className="underline">authenticity policy</Link>.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <ProductCompleteTheLook key={`${product.id}-${variant.id}`} product={product} variant={variant} />

      {reviews.length ? (
        <section className="mt-16 border-t border-border pt-12">
          <h2 className="font-display text-3xl">Reviews</h2>
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
                <p className="text-sm font-medium">{r.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.author} · {r.rating}/5 {r.verified ? "· Verified" : ""} · {r.date}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length ? (
        <section className="mt-16">
          <h2 className="mb-8 font-display text-3xl">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </main>
  );
}
