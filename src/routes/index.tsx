import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import {
  COLLECTIONS,
  POPULAR,
  RARE_IN_STOCK,
  LOW_STOCK,
  BEAUTY_SETS,
} from "@/data/catalog";
import { Button } from "@/components/ui/button";
import { ProductCarousel } from "@/components/product/product-carousel";
import { StoryCollage } from "@/components/layout/story-collage";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { ShopifyZipCard } from "@/components/layout/shopify-zip-card";
import { useBuildingMode } from "@/components/layout/building-admin";

export const Route = createFileRoute("/")({ component: Home });

const FEATURED_HANDLES = ["fragrances", "makeup", "skincare", "hair", "bath-body", "rare-finds"] as const;

function Home() {
  const popular = POPULAR;
  const rare = RARE_IN_STOCK;
  const low = LOW_STOCK;
  const sets = BEAUTY_SETS;
  const tiles = FEATURED_HANDLES.map((h) => COLLECTIONS.find((c) => c.handle === h)!);
  const brands = ["MAC", "Estée Lauder", "Clinique", "Lancôme", "Too Faced", "Tom Ford", "Yves Saint Laurent", "Bobbi Brown"];
  const building = useBuildingMode();

  return (
    <main>
      {building ? <ShopifyZipCard /> : null}
      <section className="relative isolate min-h-[72vh] overflow-hidden">
        <img
          src="/hero.jpg"
          alt="A quiet spa still life of fragrance, cream, and color"
          className="absolute inset-0 size-full object-cover object-[center_42%] outline-none"
        />
        <div className="absolute inset-0 bg-linear-to-r from-background/90 via-background/55 to-background/10" />
        <div className="relative mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 md:py-24">
          <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
            Fragrance · Makeup · Skincare
          </p>
          <h1 className="mt-3 max-w-xl font-display text-5xl text-foreground sm:text-6xl md:text-7xl">
            For the love of beauty and skin.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-foreground/75 sm:text-base">
            Scent that stays. Color that feels like you. Care that skin remembers. Sol Beautiful is a
            California vault of designer beauty — collected with affection for the ritual itself.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/collections/$handle" params={{ handle: "all" }}>Shop the vault</Link>
            </Button>
            <SignedOut>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Create an account · 10% off</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button size="lg" variant="outline" asChild>
                <Link to="/collections/$handle" params={{ handle: "skincare" }}>Skincare</Link>
              </Button>
            </SignedIn>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">The vault</p>
            <h2 className="font-display text-4xl">What we love</h2>
          </div>
          <Link to="/collections" className="hidden items-center gap-1 text-xs tracking-[0.16em] uppercase sm:flex">
            All collections <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {tiles.map((c) => (
            <Link
              key={c.id}
              to="/collections/$handle"
              params={{ handle: c.handle }}
              className="group relative block overflow-hidden rounded-xl"
            >
              <div className="aspect-4/5 overflow-hidden bg-card">
                <img
                  src={c.image}
                  alt={c.title}
                  className="size-full object-cover object-[center_18%] transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-foreground/55 via-foreground/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-background">
                <p className="font-display text-2xl md:text-3xl">{c.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ProductCarousel
        title="Popular"
        subtitle="Most sold and most watched"
        products={popular}
        viewAllHandle="popular"
        cycle
      />
      <ProductCarousel
        title="Rare · hard to find"
        subtitle="Discontinued and allocated — while they last"
        products={rare}
        viewAllHandle="rare-finds"
      />
      <ProductCarousel
        title="Low inventory"
        subtitle="Fewer than six in the warehouse"
        products={low}
        viewAllHandle="low-inventory"
      />
      <ProductCarousel
        title="Beauty Sets"
        subtitle="Kits, vaults, and gift sets"
        products={sets}
        viewAllHandle="beauty-sets"
      />

      <section className="mx-auto mt-8 grid max-w-7xl overflow-hidden rounded-2xl bg-card md:grid-cols-2">
        <StoryCollage className="h-full min-h-80 rounded-none md:min-h-[28rem]" />
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">The vault</p>
          <h2 className="mt-2 font-display text-4xl">Forty years of family care.</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            A family-run beauty vault for more than forty years — customer first, carefully spoken to, and
            curated for quality and rare fragrance. We ship from the USA.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/pages/about">Our story</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/collections/$handle" params={{ handle: "skincare" }}>Shop skincare</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-8 text-[11px] tracking-[0.2em] text-muted-foreground uppercase sm:px-6">
          {brands.map((b) => (
            <span key={b}>{b}</span>
          ))}
        </div>
      </section>
    </main>
  );
}
