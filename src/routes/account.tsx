import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  deleteAddress,
  deleteCard,
  loadAccount,
  requestReturn,
  saveAddress,
  type AccountBundle,
  type SavedAddress,
} from "@/lib/account-server";
import { setAccountFlags } from "@/lib/account-flags";
import { useCartStore } from "@/lib/cart-store";
import { getSecurityState, type SecurityState } from "@/lib/security-server";
import { isTwoFactorUnlocked } from "@/lib/security-session";
import { TwoFactorChallenge } from "@/components/auth/two-factor-challenge";
import { TwoFactorSettings } from "@/components/auth/two-factor-settings";
import { formatMoney } from "@/lib/money";
import { shipStatusFor } from "@/lib/shipping-status";
import { ReferAFriend } from "@/components/referral/refer-a-friend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListingImage } from "@/components/product/listing-image";
import { useBuildingMode } from "@/components/layout/building-admin";

export const Route = createFileRoute("/account")({ component: AccountPage });

const emptyAddress: Omit<SavedAddress, "id"> = {
  label: "Home",
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  state: "CA",
  zip: "",
  country: "United States",
  phone: "",
  isDefault: true,
};

function AccountPage() {
  const { user, isPending } = useCurrentUserState();
  const applyCode = useCartStore((s) => s.applyCode);
  const [bundle, setBundle] = useState<AccountBundle | null>(null);
  const [addr, setAddr] = useState(emptyAddress);
  const [returnFor, setReturnFor] = useState<string>("");
  const [reason, setReason] = useState("");
  const [sec, setSec] = useState<SecurityState | null>(null);
  const [, setTick] = useState(0);
  const building = useBuildingMode();

  useEffect(() => {
    if (!user) return;
    void loadAccount()
      .then((data) => {
        setBundle(data);
        setAccountFlags({ signedIn: true, firstPurchaseUsed: data.firstPurchaseUsed });
        if (!data.firstPurchaseUsed) applyCode("FIRST10");
      })
      .catch(() => setBundle(null));
  }, [user?.id, applyCode]);

  useEffect(() => {
    if (!user) return;
    void getSecurityState().then(setSec).catch(() => setSec(null));
  }, [user?.id]);

  if (isPending) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24">
        <div className="h-10 w-48 animate-pulse rounded-md bg-foreground/10" />
      </main>
    );
  }
  if (!user) return <RedirectToSignIn />;

  if (sec?.twoFactorRequired && !isTwoFactorUnlocked(user.id)) {
    return <TwoFactorChallenge state={sec} onVerified={() => setTick((n) => n + 1)} />;
  }

  const email = user.primaryEmail || "";
  const firstName = user.displayName?.split(" ")[0] || "Friend";

  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Your vault</p>
          <h1 className="mt-2 font-display text-5xl">Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">{email || user.displayName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sec?.isAdmin || building ? (
            <Button variant="outline" asChild>
              <Link to="/admin">The vault</Link>
            </Button>
          ) : null}
          <UserButton />
        </div>
      </div>

      {bundle && !bundle.firstPurchaseUsed ? (
        <section className="mt-10 rounded-2xl bg-card px-6 py-6">
          <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">First purchase</p>
          <h2 className="mt-1 font-display text-2xl">10% off is on your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Code <span className="text-foreground">FIRST10</span> applies at checkout on your first order.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/checkout">Use it now</Link>
          </Button>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-display text-3xl">Orders & tracking</h2>
        <p className="mt-2 text-sm text-muted-foreground">Every parcel ships from the USA. Tracking updates as it moves.</p>
        {!bundle?.orders.length ? (
          <p className="mt-4 text-sm text-muted-foreground">No orders on this account yet.</p>
        ) : (
          <ul className="mt-6 space-y-6">
            {bundle.orders.map((entry) => (
              <li key={entry.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">{entry.number}</p>
                  <p className="text-sm text-muted-foreground">{formatMoney(entry.order.total)}</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {shipStatusFor(entry.createdAt, entry.order.shippingMethod)} · {entry.tracking}
                </p>
                <ul className="mt-3 space-y-2">
                  {entry.order.lines.map((line, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <ListingImage src={line.image} alt="" className="size-12 rounded-md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{line.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {line.variantTitle} × {line.quantity}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setReturnFor(entry.id)}
                >
                  Start a return
                </Button>
                {returnFor === entry.id ? (
                  <form
                    className="mt-3 space-y-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void requestReturn({ data: { orderId: entry.id, sku: entry.order.lines[0]?.sku ?? "", reason } })
                        .then((next) => {
                          setBundle(next);
                          setReturnFor("");
                          setReason("");
                          toast.success("Return requested. We’ll write you at this account.");
                        })
                        .catch((err: Error) => toast.error(err.message));
                    }}
                  >
                    <Label htmlFor={`ret-${entry.id}`}>Why are you sending it back?</Label>
                    <Input id={`ret-${entry.id}`} value={reason} onChange={(e) => setReason(e.target.value)} required />
                    <Button type="submit" size="sm">Submit return</Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {bundle?.returns.length ? (
        <section className="mt-12">
          <h2 className="font-display text-3xl">Returns</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {bundle.returns.map((r) => (
              <li key={r.id} className="flex justify-between gap-3 border-b border-border py-2">
                <span>{r.reason}</span>
                <span className="text-muted-foreground capitalize">{r.status}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-display text-3xl">Saved shipping</h2>
        <ul className="mt-4 space-y-3">
          {bundle?.addresses.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm">
              <p>
                {a.firstName} {a.lastName}
                {a.isDefault ? <span className="text-muted-foreground"> · default</span> : null}
                <br />
                {a.address1}, {a.city} {a.state} {a.zip}
              </p>
              <button type="button" className="text-muted-foreground underline" onClick={() => void deleteAddress({ data: { id: a.id } }).then(setBundle)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-6 grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            void saveAddress({ data: { address: addr } })
              .then((next) => {
                setBundle(next);
                setAddr(emptyAddress);
                toast.success("Address saved.");
              })
              .catch((err: Error) => toast.error(err.message));
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="af">First name</Label>
            <Input id="af" required value={addr.firstName} onChange={(e) => setAddr({ ...addr, firstName: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="al">Last name</Label>
            <Input id="al" required value={addr.lastName} onChange={(e) => setAddr({ ...addr, lastName: e.target.value })} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="aa">Address</Label>
            <Input id="aa" required value={addr.address1} onChange={(e) => setAddr({ ...addr, address1: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ac">City</Label>
            <Input id="ac" required value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="az">ZIP</Label>
            <Input id="az" required value={addr.zip} onChange={(e) => setAddr({ ...addr, zip: e.target.value })} />
          </div>
          <Button type="submit" className="sm:col-span-2">Save address</Button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Saved cards</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We keep brand, last four digits, and expiry — never the full number or CVC. Cards save from checkout after
          you place an order.
        </p>
        <ul className="mt-4 space-y-3">
          {bundle?.cards.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm">
              <p>
                {c.brand} ···· {c.last4} · {c.expMonth}/{c.expYear}
                {c.isDefault ? <span className="text-muted-foreground"> · default</span> : null}
              </p>
              <button type="button" className="text-muted-foreground underline" onClick={() => void deleteCard({ data: { id: c.id } }).then(setBundle)}>
                Remove
              </button>
            </li>
          ))}
          {!bundle?.cards.length ? <li className="text-sm text-muted-foreground">No cards saved yet.</li> : null}
        </ul>
      </section>

      {email ? <ReferAFriend email={email} firstName={firstName} /> : null}

      {sec ? (
        <section className="mt-12">
          <h2 className="font-display text-3xl">Two-factor authentication</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Optional extra step after you sign in. Text message rates may apply.
          </p>
          <div className="mt-6">
            <TwoFactorSettings variant="customer" state={sec} onChange={setSec} />
          </div>
        </section>
      ) : null}
    </main>
  );
}
