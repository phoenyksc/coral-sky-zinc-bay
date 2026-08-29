import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { STORE } from "@/lib/store-config";
import { useCartStore, cartCount } from "@/lib/cart-store";
import { useUiStore } from "@/lib/ui-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { cn } from "@/lib/utils";
import { AuthSlot } from "@/components/auth/auth-slot";
import { SignedOut } from "@/lib/auth/gates";
import { BuildingAdminBanner, VAULT_LINKS, useBuildingMode } from "@/components/layout/building-admin";

const NAV = [
  { to: "/collections/$handle", params: { handle: "fragrances" }, label: "Fragrances" },
  { to: "/collections/$handle", params: { handle: "makeup" }, label: "Makeup" },
  { to: "/collections/$handle", params: { handle: "skincare" }, label: "Skincare" },
  { to: "/collections/$handle", params: { handle: "rare-finds" }, label: "Hard to find" },
] as const;

export function SiteHeader() {
  const lines = useCartStore((s) => s.lines);
  const hydrated = useCartStore((s) => s.hydrated);
  const count = hydrated ? cartCount(lines) : 0;
  const wishCount = useWishlistStore((s) => s.handles.length);
  const wishHydrated = useWishlistStore((s) => s.hydrated);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const navOpen = useUiStore((s) => s.navOpen);
  const setNavOpen = useUiStore((s) => s.setNavOpen);
  const building = useBuildingMode();

  return (
    <header className="sticky top-0 z-40">
      <div className="relative isolate h-16 overflow-hidden md:h-20">
        <img
          src="/header-zen.jpg"
          alt=""
          className="pointer-events-none absolute inset-0 size-full object-cover object-[center_48%] outline-none"
        />
        <div className="absolute inset-0 bg-linear-to-b from-background/20 via-transparent to-background/50" />
      </div>
      <div className="border-b border-border/80 bg-background/88 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            className="grid size-11 place-items-center md:hidden"
            aria-label={navOpen ? "Close menu" : "Open menu"}
            onClick={() => setNavOpen(!navOpen)}
          >
            {navOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Link to="/" className="font-display text-[1.65rem] leading-none tracking-[0.06em]">
            {STORE.name}
          </Link>
          <nav className="mx-auto hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                params={item.params}
                className="text-[12px] tracking-[0.16em] text-foreground/80 uppercase transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            {building ? (
              <Link
                to="/admin"
                className="text-[12px] tracking-[0.16em] text-foreground/80 uppercase transition-colors hover:text-foreground"
              >
                Vault
              </Link>
            ) : null}
          </nav>
          <div className="ml-auto flex items-center">
            <AuthSlot />
            <button
              type="button"
              className="grid size-11 place-items-center"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-5" />
            </button>
            <Link to="/wishlist" className="relative grid size-11 place-items-center" aria-label="Wishlist">
              <Heart className="size-5" />
              {wishHydrated && wishCount > 0 ? (
                <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-foreground text-[9px] text-background tabular-nums">
                  {wishCount}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              className="relative grid size-11 place-items-center"
              aria-label="Open bag"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="size-5" />
              {count > 0 ? (
                <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-foreground text-[9px] text-background tabular-nums">
                  {count}
                </span>
              ) : null}
            </button>
          </div>
        </div>
        <div
          className={cn(
            "border-t border-border bg-background md:hidden",
            navOpen ? "block" : "hidden",
          )}
        >
          <nav className="flex flex-col px-4 py-3">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                params={item.params}
                className="flex h-12 items-center text-sm tracking-[0.12em] uppercase"
                onClick={() => setNavOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/collections/$handle" params={{ handle: "all" }} className="flex h-12 items-center text-sm tracking-[0.12em] uppercase" onClick={() => setNavOpen(false)}>
              Shop all
            </Link>
            <Link to="/account" className="flex h-12 items-center text-sm tracking-[0.12em] uppercase" onClick={() => setNavOpen(false)}>
              Account
            </Link>
            <Link to="/pages/shipping" className="flex h-12 items-center text-sm tracking-[0.12em] uppercase" onClick={() => setNavOpen(false)}>
              Shipping
            </Link>
            <Link to="/pages/returns" className="flex h-12 items-center text-sm tracking-[0.12em] uppercase" onClick={() => setNavOpen(false)}>
              Returns
            </Link>
            <Link to="/pages/payment" className="flex h-12 items-center text-sm tracking-[0.12em] uppercase" onClick={() => setNavOpen(false)}>
              Payment
            </Link>
            {building
              ? VAULT_LINKS.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    params={"params" in item ? item.params : undefined}
                    className="flex h-12 items-center text-sm tracking-[0.12em] uppercase"
                    onClick={() => setNavOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))
              : null}
          </nav>
        </div>
        <BuildingAdminBanner />
        <SignedOut>
          <div className="border-t border-border/70 bg-card px-4 py-2.5 text-center text-sm sm:px-6">
            <Link to="/login" className="font-medium underline-offset-4 hover:underline">
              Create an account
            </Link>
            {" "}
            and take 10% off your first purchase — the vault is open to browse either way.
          </div>
        </SignedOut>
        <p className="border-t border-border/70 px-4 py-2 text-center text-[11px] leading-relaxed tracking-[0.14em] text-muted-foreground uppercase sm:px-6">
          {STORE.announcement}
        </p>
      </div>
    </header>
  );
}
