import { useEffect } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { SearchDialog } from "@/components/layout/search-dialog";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useReferralStore } from "@/lib/referral-store";
import { useOrdersStore } from "@/lib/orders-store";
import { useInventoryStore } from "@/lib/inventory-store";
import { usePublishStore } from "@/lib/publish-store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { clearTwoFactorUnlock } from "@/lib/security-session";

export function SiteShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const href = useRouterState({ select: (s) => s.location.href });
  const isAdmin = pathname.startsWith("/admin");
  const { user, isPending } = useCurrentUserState();

  useEffect(() => {
    void Promise.resolve(useCartStore.persist.rehydrate()).then(() => useCartStore.setState({ hydrated: true }));
    void Promise.resolve(useWishlistStore.persist.rehydrate()).then(() => useWishlistStore.setState({ hydrated: true }));
    void Promise.resolve(useReferralStore.persist.rehydrate()).then(() => useReferralStore.setState({ hydrated: true }));
    void Promise.resolve(useOrdersStore.persist.rehydrate()).then(() => useOrdersStore.setState({ hydrated: true }));
    void Promise.resolve(useInventoryStore.persist.rehydrate()).then(() => useInventoryStore.setState({ hydrated: true }));
    void Promise.resolve(usePublishStore.persist.rehydrate()).then(() => usePublishStore.setState({ hydrated: true }));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    const via = params.get("via") ?? undefined;
    if (ref) useReferralStore.getState().setPendingRef(ref, via);
  }, [href]);

  useEffect(() => {
    if (!isPending && !user) clearTwoFactorUnlock();
  }, [isPending, user]);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      {isAdmin ? null : <SiteHeader />}
      <div className="flex-1">
        <Outlet />
      </div>
      {isAdmin ? null : <SiteFooter />}
      {isAdmin ? null : <CartDrawer />}
      {isAdmin ? null : <SearchDialog />}
      <Toaster
        position="bottom-center"
        toastOptions={{
          className: "font-sans",
          style: {
            background: "#1A1613",
            color: "#F4EFE7",
            border: "none",
            borderRadius: "8px",
          },
        }}
      />
    </div>
  );
}
