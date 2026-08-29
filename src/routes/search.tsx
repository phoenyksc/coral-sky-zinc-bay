import { createFileRoute } from "@tanstack/react-router";
import { liveSearch, useInventoryStore } from "@/lib/inventory-store";
import { PaginatedGrid } from "@/components/product/paginated-grid";
import { SearchCompleteTheLook } from "@/components/product/complete-the-look";
import { Input } from "@/components/ui/input";

type Search = { q: string };

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  useInventoryStore((s) => s.custom);
  const results = q.trim() ? liveSearch(q) : [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-5xl">Search</h1>
      <form
        className="mt-6 max-w-xl"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          void navigate({ search: { q: String(fd.get("q") ?? "") } });
        }}
      >
        <Input name="q" defaultValue={q} placeholder="Brand, product, SKU…" />
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        {q.trim() ? `${results.length} result${results.length === 1 ? "" : "s"} for “${q}”` : "Try MAC, Double Wear, or Clinique."}
      </p>
      {q.trim() ? <SearchCompleteTheLook query={q} /> : null}
      <div className="mt-8">
        <PaginatedGrid products={results} />
      </div>
    </main>
  );
}
