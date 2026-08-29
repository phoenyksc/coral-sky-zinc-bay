import { createFileRoute } from "@tanstack/react-router";
import { ReferAFriend } from "@/components/referral/refer-a-friend";
import { REFERRAL, useReferralStore } from "@/lib/referral-store";
import { useOrdersStore } from "@/lib/orders-store";

export const Route = createFileRoute("/pages/refer")({ component: ReferPage });

function ReferPage() {
  const lastEmail = useReferralStore((s) => s.lastEmail);
  const lastOrder = useOrdersStore((s) => s.orders[0]);
  const email = lastEmail || lastOrder?.email || "";
  const firstName = lastOrder?.address.firstName || "Friend";

  return (
    <main className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Friends of the vault</p>
      <h1 className="mt-2 font-display text-5xl">Refer a friend</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Share Sol Beautiful. If they complete a purchase over ${REFERRAL.minPurchase}, we email you{" "}
        {REFERRAL.firstPercent}% off your next order. Five friends, five orders over ${REFERRAL.minPurchase} — we
        email you {REFERRAL.fivePercent}% off your next order.
      </p>
      {email ? (
        <ReferAFriend email={email} firstName={firstName} showIntro={false} />
      ) : (
        <p className="mt-10 text-sm text-muted-foreground">
          Place an order first — your personal link is waiting on the thank-you page.
        </p>
      )}
    </main>
  );
}
