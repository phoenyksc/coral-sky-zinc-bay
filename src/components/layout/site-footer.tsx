import { Link } from "@tanstack/react-router";
import { STORE } from "@/lib/store-config";
import { VAULT_LINKS, useBuildingMode } from "@/components/layout/building-admin";

export function SiteFooter() {
  const building = useBuildingMode();
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-3xl tracking-[0.06em]">{STORE.name}</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{STORE.description}</p>
          <p className="mt-4 text-sm text-muted-foreground">Ships from the USA.</p>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Shop</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/collections/$handle" params={{ handle: "fragrances" }} className="hover:opacity-70">Fragrances</Link></li>
            <li><Link to="/collections/$handle" params={{ handle: "makeup" }} className="hover:opacity-70">Makeup</Link></li>
            <li><Link to="/collections/$handle" params={{ handle: "skincare" }} className="hover:opacity-70">Skincare</Link></li>
            <li><Link to="/collections/$handle" params={{ handle: "hair" }} className="hover:opacity-70">Hair</Link></li>
            <li><Link to="/collections/$handle" params={{ handle: "bath-body" }} className="hover:opacity-70">Bath & body</Link></li>
            <li><Link to="/collections/$handle" params={{ handle: "rare-finds" }} className="hover:opacity-70">Hard to find</Link></li>
            <li><Link to="/collections/$handle" params={{ handle: "under-20" }} className="hover:opacity-70">Under $20</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">The vault</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/pages/about" className="hover:opacity-70">About</Link></li>
            <li><Link to="/login" className="hover:opacity-70">Create account</Link></li>
            <li><Link to="/account" className="hover:opacity-70">Account</Link></li>
            <li><Link to="/pages/refer" className="hover:opacity-70">Refer a friend</Link></li>
            <li><Link to="/pages/authenticity" className="hover:opacity-70">Authenticity</Link></li>
            <li><Link to="/pages/shipping" className="hover:opacity-70">Shipping</Link></li>
            <li><Link to="/pages/payment" className="hover:opacity-70">Payment</Link></li>
            <li><Link to="/pages/returns" className="hover:opacity-70">Returns</Link></li>
            <li><Link to="/pages/contact" className="hover:opacity-70">Contact</Link></li>
            {building ? (
              <>
                <li><Link to="/pages/shopify" className="hover:opacity-70">Shopify zip</Link></li>
                <li className="pt-3 text-[11px] tracking-[0.16em] text-muted-foreground uppercase">The vault</li>
                {VAULT_LINKS.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} params={"params" in item ? item.params : undefined} className="hover:opacity-70">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} {STORE.shortName}. For the love of beauty and skin.</p>
          <p>Ships from the USA.</p>
        </div>
      </div>
    </footer>
  );
}
