import { createFileRoute, Link } from "@tanstack/react-router";
import { getProduct } from "@/data/catalog";
import { useWishlistStore } from "@/lib/wishlist-store";
import { ProductGrid } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/wishlist")({ component: WishlistPage });

function WishlistPage() {
  const handles = useWishlistStore((s) => s.handles);
  const products = handles.map(getProduct).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-5xl">Wishlist</h1>
      {products.length ? (
        <div className="mt-10">
          <ProductGrid products={products} />
        </div>
      ) : (
        <div className="mt-10 max-w-md">
          <p className="text-sm text-muted-foreground">
            Save discontinued bottles and shades while you think. Hearts stay on this device.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/collections/$handle" params={{ handle: "rare-finds" }}>Browse hard to find</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
