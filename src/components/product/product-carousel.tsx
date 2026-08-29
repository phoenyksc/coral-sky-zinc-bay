import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { CarouselProductCard } from "@/components/product/carousel-product-card";
import { cn } from "@/lib/utils";

export const CAROUSEL_LIMIT = 15;

export function ProductCarousel({
  title,
  subtitle,
  products,
  viewAllHandle,
  cycle = false,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHandle: string;
  cycle?: boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const items = products.slice(0, CAROUSEL_LIMIT);

  const updateEdges = () => {
    const el = scroller.current;
    if (!el) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    setAtStart(el.scrollLeft <= 12);
    setAtEnd(el.scrollLeft >= max - 12);
  };

  const scrollByCards = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-card]");
    const step = card ? card.offsetWidth + 12 : 220;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      ro.disconnect();
    };
  }, [items.length]);

  useEffect(() => {
    if (!cycle) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    const id = window.setInterval(() => {
      const el = scroller.current;
      if (!el) return;
      if (el.matches(":hover") || el.contains(document.activeElement)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= max - 12) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const card = el.querySelector<HTMLElement>("[data-carousel-card]");
        const step = card ? card.offsetWidth + 12 : 220;
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 5200);
    return () => window.clearInterval(id);
  }, [cycle, items.length]);

  if (!items.length) return null;

  return (
    <section className="border-t border-border/70 py-8" aria-label={title}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-sans text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          <Link
            to="/collections/$handle"
            params={{ handle: viewAllHandle }}
            className="shrink-0 text-sm underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
          >
            See all
          </Link>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => scrollByCards(-1)}
          className={cn(
            "absolute top-28 left-2 z-10 hidden size-10 place-items-center rounded-full bg-card text-foreground shadow-[var(--shadow-border)] transition-opacity duration-150 ease-out md:grid",
            atStart ? "pointer-events-none opacity-0" : "opacity-100",
          )}
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => scrollByCards(1)}
          className={cn(
            "absolute top-28 right-2 z-10 hidden size-10 place-items-center rounded-full bg-card text-foreground shadow-[var(--shadow-border)] transition-opacity duration-150 ease-out md:grid",
            atEnd ? "pointer-events-none opacity-0" : "opacity-100",
          )}
        >
          <ChevronRight className="size-5" />
        </button>

        <div
          ref={scroller}
          className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:px-6"
        >
          {items.map((product, i) => (
            <div
              key={product.id}
              data-carousel-card
              className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-[23%] lg:w-[18.2%]"
            >
              <CarouselProductCard product={product} priority={i < 6} />
            </div>
          ))}
          <Link
            to="/collections/$handle"
            params={{ handle: viewAllHandle }}
            data-carousel-card
            className="flex w-[46%] shrink-0 snap-start flex-col sm:w-[31%] md:w-[23%] lg:w-[18.2%]"
          >
            <div className="flex aspect-square w-full flex-col items-center justify-center bg-card px-4 text-center shadow-[var(--shadow-border)] transition-opacity duration-150 hover:opacity-80">
              <p className="text-sm font-semibold">See all</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{title}</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
