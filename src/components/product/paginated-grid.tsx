import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { ProductGrid } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";

const PAGE = 24;

export function PaginatedGrid({ products, priorityCount = 4 }: { products: Product[]; priorityCount?: number }) {
  const [visible, setVisible] = useState(PAGE);

  useEffect(() => {
    setVisible(PAGE);
  }, [products]);

  const slice = products.slice(0, visible);
  const remaining = products.length - slice.length;

  return (
    <div>
      <ProductGrid products={slice} priorityCount={priorityCount} />
      {remaining > 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground tabular-nums">
            Showing {slice.length} of {products.length}
          </p>
          <Button variant="outline" onClick={() => setVisible((n) => n + PAGE)}>
            Load {Math.min(PAGE, remaining)} more
          </Button>
        </div>
      ) : null}
    </div>
  );
}
