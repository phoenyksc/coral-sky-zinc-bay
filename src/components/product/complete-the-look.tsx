import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductVariant } from "@/lib/types";
import { completeTheLook, lookFromCart, lookFromQuery, type CompleteLook, type LookSuggestion } from "@/lib/complete-the-look";
import { listManagedProducts, useInventoryStore } from "@/lib/inventory-store";
import { useCartStore } from "@/lib/cart-store";
import { useUiStore } from "@/lib/ui-store";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { ListingImage } from "@/components/product/listing-image";
import { cn } from "@/lib/utils";

function useCatalog() {
  const custom = useInventoryStore((s) => s.custom);
  const deleted = useInventoryStore((s) => s.deleted);
  return useMemo(() => listManagedProducts({ custom, deleted }).filter((p) => p.status === "active"), [custom, deleted]);
}

function SuggestionCard({
  item,
  checked,
  onToggle,
}: {
  item: LookSuggestion;
  checked: boolean;
  onToggle: () => void;
}) {
  const shade = item.variant.option1 && item.variant.option1 !== "Default" ? item.variant.option1 : item.variant.title !== "Default" ? item.variant.title : null;
  return (
    <article className={cn("flex h-full flex-col rounded-xl bg-card p-3 shadow-[var(--shadow-border)]", checked ? "ring-1 ring-foreground/20" : "opacity-70")}>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-1 size-4 accent-foreground"
          aria-label={`Add ${item.product.title}`}
        />
        <Link to="/products/$handle" params={{ handle: item.product.handle }} className="min-w-0 flex-1">
          <div className="aspect-square overflow-hidden rounded-md bg-background">
            <ListingImage src={item.product.images[0]?.src} alt="" className="size-full" />
          </div>
          <p className="mt-3 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{item.product.vendor}</p>
          <p className="mt-1 font-display text-lg leading-snug line-clamp-2">{item.product.title}</p>
          {shade ? <p className="mt-1 text-xs text-muted-foreground">{shade}</p> : null}
          <p className="mt-2 text-sm tabular-nums">{formatMoney(item.variant.price)}</p>
        </Link>
      </label>
      <p className="mt-auto pt-2 text-xs leading-relaxed text-muted-foreground">{item.reason}</p>
    </article>
  );
}

function LookBoard({ look, current }: { look: CompleteLook; current?: { product: Product; variant: ProductVariant } }) {
  const [on, setOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(look.items.map((i) => [i.product.id, true])),
  );
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const selected = look.items.filter((i) => on[i.product.id]);
  const total =
    selected.reduce((s, i) => s + Number.parseFloat(i.variant.price) * 1, 0) +
    (current ? Number.parseFloat(current.variant.price) : 0);

  function addLook() {
    let added = 0;
    if (current) {
      const res = addItem(current.product.id, current.variant.id, 1);
      if (res.ok) added += 1;
    }
    for (const item of selected) {
      const res = addItem(item.product.id, item.variant.id, 1);
      if (res.ok) added += 1;
      else toast.error(res.message);
    }
    if (added) {
      toast(added === 1 ? "Added to bag." : `${added} pieces added to bag.`);
      setCartOpen(true);
    }
  }

  return (
    <section className="mt-16 border-t border-border pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Bought together</p>
          <h2 className="mt-1 font-display text-3xl md:text-4xl">{look.headline}</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{look.subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-sm tabular-nums">Look · {formatMoney(total)}</p>
          <Button className="mt-2" onClick={addLook} disabled={!current && selected.length === 0}>
            Add look to bag
          </Button>
        </div>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {current ? (
          <article className="flex h-full flex-col rounded-xl bg-card p-3 shadow-[var(--shadow-border)] ring-1 ring-foreground/20">
            <div className="aspect-square overflow-hidden rounded-md bg-background">
              <ListingImage src={current.product.images[0]?.src} alt="" className="size-full" />
            </div>
            <p className="mt-3 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{current.product.vendor}</p>
            <p className="mt-1 font-display text-lg leading-snug line-clamp-2">{current.product.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This shade
              {current.variant.option1 && current.variant.option1 !== "Default" ? ` · ${current.variant.option1}` : ""}
            </p>
            <p className="mt-2 text-sm tabular-nums">{formatMoney(current.variant.price)}</p>
          </article>
        ) : null}
        {look.items.map((item, i) => (
          <div key={item.product.id} className="relative">
            {i === 0 && current ? (
              <Plus className="pointer-events-none absolute -left-2 top-1/3 z-10 hidden size-5 text-muted-foreground lg:block" aria-hidden />
            ) : null}
            <SuggestionCard
              item={item}
              checked={Boolean(on[item.product.id])}
              onToggle={() => setOn((s) => ({ ...s, [item.product.id]: !s[item.product.id] }))}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProductCompleteTheLook({ product, variant }: { product: Product; variant: ProductVariant }) {
  const catalog = useCatalog();
  const look = useMemo(() => completeTheLook(product, variant, catalog, 2), [product, variant, catalog]);
  if (!look) return null;
  return <LookBoard look={look} current={{ product, variant }} />;
}

export function SearchCompleteTheLook({ query }: { query: string }) {
  const catalog = useCatalog();
  const look = useMemo(() => lookFromQuery(query, catalog, 3), [query, catalog]);
  if (!look) return null;
  return <LookBoard look={look} />;
}

export function CartCompleteTheLook({ lines }: { lines: Array<{ product: Product; variant: ProductVariant }> }) {
  const catalog = useCatalog();
  const look = useMemo(() => lookFromCart(lines, catalog, 2), [lines, catalog]);
  if (!look) return null;
  return <LookBoard look={look} />;
}
