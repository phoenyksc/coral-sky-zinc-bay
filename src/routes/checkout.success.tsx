import { createFileRoute, Link } from "@tanstack/react-router";
import { useOrdersStore } from "@/lib/orders-store";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { ListingImage } from "@/components/product/listing-image";
import { ReferAFriend } from "@/components/referral/refer-a-friend";
import { REFERRAL } from "@/lib/referral-store";
import { SignedIn, SignedOut } from "@/lib/auth/gates";

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    order: typeof search.order === "string" ? search.order : "",
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { order: orderId } = Route.useSearch();
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === orderId));
  const hydrated = useOrdersStore((s) => s.hydrated);

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Loading your order…</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl">Order not found</h1>
        <Button className="mt-6" asChild>
          <Link to="/">Home</Link>
        </Button>
      </main>
    );
  }

  const helpedAFriend = Boolean(order.referredBy) && order.subtotal > REFERRAL.minPurchase;

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Confirmed</p>
      <h1 className="mt-2 font-display text-5xl">Thank you, {order.address.firstName}.</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Order <span className="text-foreground tabular-nums">{order.number}</span> is on its way from the USA.
        {order.tracking ? (
          <>
            {" "}
            Tracking <span className="text-foreground tabular-nums">{order.tracking}</span>
            {order.shipStatus ? ` · ${order.shipStatus}` : ""}.
          </>
        ) : (
          <> A confirmation is stored on this device for {order.email}.</>
        )}
      </p>
      <SignedOut>
        <section className="mt-8 rounded-2xl bg-card px-6 py-6">
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Keep this order</p>
          <h2 className="mt-2 font-display text-3xl">Create an account</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Save this card and shipping address, track the parcel, manage a return, and refer a friend from one
            place. New members receive 10% off their first purchase.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/login">Create an account</Link>
          </Button>
        </section>
      </SignedOut>
      <SignedIn>
        <p className="mt-4 text-sm text-muted-foreground">
          Saved to your <Link to="/account" className="underline">account</Link> — track shipping, start a return, or
          refer a friend there.
        </p>
      </SignedIn>
      {helpedAFriend ? (
        <p className="mt-3 text-sm text-muted-foreground">
          You used a friend’s link on an order over ${REFERRAL.minPurchase} — their thank-you code is on its way
          by email.
        </p>
      ) : null}
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {order.lines.map((line, i) => (
          <li key={i} className="flex items-center gap-3 py-4">
            <ListingImage src={line.image} alt="" className="size-16 rounded-md" />
            <div className="flex-1">
              <p className="text-sm">{line.title}</p>
              <p className="text-xs text-muted-foreground">
                {line.variantTitle} × {line.quantity}
              </p>
            </div>
            <p className="text-sm tabular-nums">{formatMoney(line.price)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex justify-between text-base font-medium">
        <span>Total</span>
        <span className="tabular-nums">{formatMoney(order.total)}</span>
      </div>
      <ReferAFriend email={order.email} firstName={order.address.firstName} />
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/collections/$handle" params={{ handle: "all" }}>Keep shopping</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/account">View account</Link>
        </Button>
      </div>
    </main>
  );
}
