import { createFileRoute, Link } from "@tanstack/react-router";
import { COLLECTIONS, productsForCollection } from "@/data/catalog";

export const Route = createFileRoute("/collections/")({ component: CollectionsIndex });

function CollectionsIndex() {
  const list = COLLECTIONS.filter((c) => c.handle !== "all");
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">The vault</p>
      <h1 className="mt-2 font-display text-5xl">Collections</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Fragrance, makeup, skincare, hair, and bath — plus the discontinued cabinet. Pieces we love, packed in California.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <Link
            key={c.id}
            to="/collections/$handle"
            params={{ handle: c.handle }}
            className="group overflow-hidden rounded-xl bg-card"
          >
            <div className="aspect-16/10 overflow-hidden">
              <img src={c.image} alt={c.title} className="size-full object-cover object-[center_22%] transition-transform duration-500 group-hover:scale-[1.04]" />
            </div>
            <div className="p-5">
              <h2 className="font-display text-2xl">{c.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
              <p className="mt-2 text-xs tracking-[0.12em] text-muted-foreground uppercase tabular-nums">
                {productsForCollection(c.handle).length} pieces
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
