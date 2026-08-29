import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { BarChart3, Download, LayoutGrid, Plus, Shield, Store } from "lucide-react";
import { STORE } from "@/lib/store-config";
import { cn } from "@/lib/utils";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { claimAdmin, getSecurityState, type SecurityState } from "@/lib/security-server";
import { isTwoFactorUnlocked } from "@/lib/security-session";
import { TwoFactorChallenge } from "@/components/auth/two-factor-challenge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePublishStore } from "@/lib/publish-store";

const NAV = [
  { to: "/admin" as const, label: "Reports", icon: BarChart3, match: (p: string) => p === "/admin" },
  {
    to: "/admin/inventory" as const,
    label: "Inventory",
    icon: LayoutGrid,
    match: (p: string) => p.startsWith("/admin/inventory") || (p.startsWith("/admin/listings/") && !p.endsWith("/new")),
  },
  {
    to: "/admin/listings/$id" as const,
    params: { id: "new" },
    label: "Create listing",
    icon: Plus,
    match: (p: string) => p === "/admin/listings/new",
  },
  {
    to: "/admin/export" as const,
    label: "Shopify export",
    icon: Download,
    match: (p: string) => p.startsWith("/admin/export"),
  },
  {
    to: "/admin/security" as const,
    label: "Security",
    icon: Shield,
    match: (p: string) => p.startsWith("/admin/security"),
  },
];

export function AdminShell() {
  return (
    <AdminGate>
      <AdminChrome />
    </AdminGate>
  );
}

function AdminGate({ children }: { children: ReactNode }) {
  const publicLive = usePublishStore((s) => s.publicLive);
  if (!publicLive) return <>{children}</>;
  return <PublishedAdminGate>{children}</PublishedAdminGate>;
}

function AdminChrome() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="border-b border-border px-4 py-5">
          <p className="font-display text-2xl tracking-[0.04em]">{STORE.shortName}</p>
          <p className="mt-1 text-xs tracking-[0.14em] text-muted-foreground uppercase">The vault</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                params={"params" in item ? item.params : undefined}
                className={cn(
                  "flex h-11 items-center gap-2 rounded-md px-3 text-sm",
                  active ? "bg-foreground text-background" : "text-foreground/80 hover:bg-accent",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <Link
            to="/"
            className="flex h-11 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Store className="size-4" />
            View storefront
          </Link>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
          <p className="font-display text-xl">{STORE.shortName}</p>
          <nav className="ml-auto flex gap-3 text-xs tracking-[0.12em] uppercase">
            <Link to="/admin">Reports</Link>
            <Link to="/admin/inventory">Inventory</Link>
            <Link to="/admin/export">Export</Link>
            <Link to="/admin/security">Security</Link>
          </nav>
        </header>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function PublishedAdminGate({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const intended = useRef(pathname.startsWith("/admin") ? pathname : "/admin");
  if (pathname.startsWith("/admin")) intended.current = pathname;
  const [mounted, setMounted] = useState(false);
  const [sec, setSec] = useState<SecurityState | null>(null);
  const [fail, setFail] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) {
      setSec(null);
      setFail(null);
      return;
    }
    let cancelled = false;
    void getSecurityState()
      .then((next) => {
        if (!cancelled) {
          setSec(next);
          setFail(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setFail(err.message || "Could not open the vault.");
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (!mounted || isPending) {
    return <div className="grid min-h-dvh place-items-center text-sm text-muted-foreground">Opening the vault…</div>;
  }
  if (!user) {
    return <Navigate to="/login" search={{ redirect: intended.current || "/admin" }} replace />;
  }
  if (fail) {
    return (
      <main className="mx-auto max-w-md px-4 py-20">
        <h1 className="font-display text-4xl">The vault</h1>
        <p className="mt-3 text-sm text-muted-foreground">{fail}</p>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </main>
    );
  }
  if (!sec) {
    return <div className="grid min-h-dvh place-items-center text-sm text-muted-foreground">Checking administrator access…</div>;
  }
  if (!sec.isAdmin && sec.canClaimAdmin) {
    return (
      <main className="mx-auto max-w-md px-4 py-20">
        <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">The vault</p>
        <h1 className="mt-2 font-display text-4xl">Become the administrator</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Inventory, reports, and Shopify export stay off the public site. The first signed-in account can claim them.
        </p>
        <Button
          className="mt-6"
          onClick={() => {
            void claimAdmin()
              .then((next) => {
                setSec(next);
                toast("You are the vault administrator.");
              })
              .catch((err: Error) => toast.error(err.message));
          }}
        >
          Claim the vault
        </Button>
      </main>
    );
  }
  if (!sec.isAdmin) {
    return (
      <main className="mx-auto max-w-md px-4 py-20">
        <h1 className="font-display text-4xl">Not an administrator</h1>
        <p className="mt-3 text-sm text-muted-foreground">This login cannot open the vault.</p>
        <Button className="mt-6" asChild>
          <Link to="/account">Back to account</Link>
        </Button>
      </main>
    );
  }
  if (sec.twoFactorRequired && !isTwoFactorUnlocked(user.id)) {
    return <TwoFactorChallenge state={sec} onVerified={() => setTick((n) => n + 1)} />;
  }
  return <>{children}</>;
}

export function AdminHint({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>;
}
