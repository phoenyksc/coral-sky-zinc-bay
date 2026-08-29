import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useUiStore } from "@/lib/ui-store";
import { searchProducts } from "@/data/catalog";
import { formatMoney } from "@/lib/money";
import { Input } from "@/components/ui/input";
import { ListingImage } from "@/components/product/listing-image";

export function SearchDialog() {
  const open = useUiStore((s) => s.searchOpen);
  const setOpen = useUiStore((s) => s.setSearchOpen);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const results = useMemo(() => searchProducts(q).slice(0, 8), [q]);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/35 px-3 pt-16 sm:pt-24">
      <div className="w-full max-w-xl overflow-hidden rounded-xl bg-background shadow-[var(--shadow-border)]">
        <form
          className="flex items-center gap-2 border-b border-border px-3"
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
            void navigate({ to: "/search", search: { q } });
          }}
        >
          <Search className="size-4 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search MAC, Double Wear, Clinique…"
            className="h-14 border-0 shadow-none focus-visible:ring-0"
          />
          <button type="button" className="grid size-11 place-items-center" aria-label="Close search" onClick={() => setOpen(false)}>
            <X className="size-4" />
          </button>
        </form>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {q.trim() && results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">No matches for “{q}”.</p>
          ) : (
            results.map((p) => (
              <Link
                key={p.id}
                to="/products/$handle"
                params={{ handle: p.handle }}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent"
              >
                <ListingImage src={p.images[0]?.src} alt="" className="size-14 rounded-md bg-card" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.vendor} · from {formatMoney(p.variants[0].price)}</p>
                </div>
              </Link>
            ))
          )}
          {q.trim() && results.length > 0 ? (
            <button
              type="button"
              className="mt-1 w-full py-3 text-center text-xs tracking-[0.14em] uppercase"
              onClick={() => {
                setOpen(false);
                void navigate({ to: "/search", search: { q } });
              }}
            >
              View all results
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
