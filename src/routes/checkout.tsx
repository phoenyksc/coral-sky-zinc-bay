import { useEffect, useState, type ChangeEvent } from "react";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  useCartStore,
  resolveLines,
  cartSubtotal,
  cartDiscount,
  shippingCost,
  taxAmount,
} from "@/lib/cart-store";
import { useOrdersStore } from "@/lib/orders-store";
import { useReferralStore } from "@/lib/referral-store";
import { formatMoney, moneyString } from "@/lib/money";
import { STORE } from "@/lib/store-config";
import type { ShippingAddress } from "@/lib/types";
import { uniqueId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListingImage } from "@/components/product/listing-image";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { loadAccount, saveAccountOrder, type AccountBundle } from "@/lib/account-server";
import { setAccountFlags } from "@/lib/account-flags";
import { cardBrand, makeTrackingNumber, shipStatusFor } from "@/lib/shipping-status";

export const Route = createFileRoute("/checkout")({ component: CheckoutRoute });

function CheckoutRoute() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/checkout/success")) return <Outlet />;
  return <CheckoutPage />;
}

const emptyAddress: ShippingAddress = {
  email: "",
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  state: "CA",
  zip: "",
  country: "United States",
  phone: "",
};

function CheckoutPage() {
  const navigate = useNavigate();
  const lines = useCartStore((s) => s.lines);
  const code = useCartStore((s) => s.discountCode);
  const applyCode = useCartStore((s) => s.applyCode);
  const clear = useCartStore((s) => s.clear);
  const addOrder = useOrdersStore((s) => s.add);
  const onOrderPlaced = useReferralStore((s) => s.onOrderPlaced);
  const pendingRef = useReferralStore((s) => s.pendingRef);
  const lastEmail = useReferralStore((s) => s.lastEmail);
  const rewards = useReferralStore((s) => s.rewards);
  const unusedMine = rewards.filter((r) => r.email === lastEmail && !r.used);
  const { user, isPending } = useCurrentUserState();
  const [account, setAccount] = useState<AccountBundle | null>(null);
  const [keepCard, setKeepCard] = useState(true);
  const [savedCardId, setSavedCardId] = useState("");
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [method, setMethod] = useState<"standard" | "express">("standard");
  const [promo, setPromo] = useState(code);
  const [card, setCard] = useState({ name: "", number: "", exp: "", cvc: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      setAccountFlags({ signedIn: false, firstPurchaseUsed: true });
      return;
    }
    void loadAccount()
      .then((data) => {
        setAccount(data);
        setAccountFlags({ signedIn: true, firstPurchaseUsed: data.firstPurchaseUsed });
        if (!data.firstPurchaseUsed && !useCartStore.getState().discountCode) applyCode("FIRST10");
        const def = data.addresses.find((a) => a.isDefault) ?? data.addresses[0];
        if (def) {
          setAddress((cur) => ({
            ...cur,
            email: cur.email || user.primaryEmail || "",
            firstName: cur.firstName || def.firstName,
            lastName: cur.lastName || def.lastName,
            address1: cur.address1 || def.address1,
            address2: cur.address2 || def.address2,
            city: cur.city || def.city,
            state: def.state || cur.state,
            zip: cur.zip || def.zip,
            country: def.country || cur.country,
            phone: cur.phone || def.phone,
          }));
        } else if (user.primaryEmail) {
          setAddress((cur) => ({ ...cur, email: cur.email || user.primaryEmail || "" }));
        }
        const cardDef = data.cards.find((c) => c.isDefault) ?? data.cards[0];
        if (cardDef) {
          setSavedCardId(cardDef.id);
          setCard((c) => ({
            ...c,
            name: c.name || cardDef.nameOnCard,
            exp: c.exp || `${cardDef.expMonth}/${cardDef.expYear.slice(-2)}`,
          }));
        }
      })
      .catch(() => setAccount(null));
  }, [user?.id, applyCode]);

  const resolved = resolveLines(lines);
  const subtotal = cartSubtotal(lines);
  const discount = cartDiscount(lines, code);
  const after = Math.max(0, subtotal - discount);
  const shipping = shippingCost(after, method);
  const tax = taxAmount(after + shipping, address.state);
  const total = after + shipping + tax;

  if (!resolved.length) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl">Nothing to check out</h1>
        <Button className="mt-6" asChild>
          <Link to="/collections/$handle" params={{ handle: "all" }}>Shop</Link>
        </Button>
      </main>
    );
  }

  const set = (key: keyof ShippingAddress) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAddress((a) => ({ ...a, [key]: e.target.value }));

  function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!address.email || !address.firstName || !address.lastName || !address.address1 || !address.city || !address.zip) {
      toast.error("Please complete shipping details.");
      return;
    }
    const usingSaved = Boolean(savedCardId);
    if (usingSaved) {
      if (card.cvc.length < 3) {
        toast.error("Enter the CVC for your saved card.");
        return;
      }
    } else if (card.number.replace(/\s/g, "").length < 13 || card.exp.length < 4 || card.cvc.length < 3) {
      toast.error("Enter demo card details to place the order.");
      return;
    }
    setSubmitting(true);
    const orderId = uniqueId("ord");
    const number = `SOL-${String(Date.now()).slice(-6)}`;
    const createdAt = new Date().toISOString();
    const tracking = makeTrackingNumber();
    const shipStatus = shipStatusFor(createdAt, method);
    const saved = account?.cards.find((c) => c.id === savedCardId);
    const order = {
      id: orderId,
      number,
      createdAt,
      email: address.email,
      lines: resolved.map(({ line, product, variant }) => ({
        title: product.title,
        variantTitle: variant.title,
        sku: variant.sku,
        quantity: line.quantity,
        price: moneyString(Number(variant.price) * line.quantity),
        image: product.images[0]?.src ?? "",
      })),
      subtotal,
      discount,
      discountCode: code || undefined,
      shipping,
      shippingMethod: method,
      tax,
      total,
      address,
      status: "confirmed" as const,
      referredBy: pendingRef || undefined,
      tracking,
      shipStatus,
    };
    addOrder(order);
    onOrderPlaced(order);
    if (user) {
      const expParts = card.exp.split("/");
      void saveAccountOrder({
        data: {
          order,
          tracking,
          shipStatus,
          address,
          saveCard:
            keepCard && !usingSaved
              ? {
                  brand: cardBrand(card.number),
                  last4: card.number.replace(/\D/g, "").slice(-4),
                  expMonth: (expParts[0] ?? "").trim(),
                  expYear: (expParts[1] ?? "").trim(),
                  nameOnCard: card.name,
                }
              : saved
                ? undefined
                : undefined,
        },
      })
        .then((next) => {
          setAccountFlags({ signedIn: true, firstPurchaseUsed: next.firstPurchaseUsed });
        })
        .catch(() => {
          /* order is stored on this device even if the account save fails */
        });
    }
    clear();
    toast("Order confirmed");
    void navigate({ to: "/checkout/success", search: { order: orderId } });
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px]">
      <form onSubmit={placeOrder} className="space-y-10">
        <div>
          <h1 className="font-display text-5xl">Checkout</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Guest checkout. Demo payments — no card is charged.
            {!isPending && !user ? (
              <>
                {" "}
                <Link to="/login" search={{ redirect: "/checkout" }} className="underline">
                  Create an account
                </Link>{" "}
                for 10% off your first purchase, saved shipping and cards, tracking, returns, and referrals.
              </>
            ) : null}
            {user && account && !account.firstPurchaseUsed ? (
              <> First-purchase code FIRST10 is on this order.</>
            ) : null}
          </p>
        </div>
        <section className="space-y-4">
          <h2 className="font-display text-2xl">Contact</h2>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={address.email} onChange={set("email")} autoComplete="email" />
          </div>
        </section>
        <section className="space-y-4">
          <h2 className="font-display text-2xl">Shipping</h2>
          {account?.addresses.length ? (
            <div className="flex flex-wrap gap-2">
              {account.addresses.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="rounded-full border border-border px-3 py-1 text-xs"
                  onClick={() =>
                    setAddress((cur) => ({
                      ...cur,
                      firstName: a.firstName,
                      lastName: a.lastName,
                      address1: a.address1,
                      address2: a.address2,
                      city: a.city,
                      state: a.state,
                      zip: a.zip,
                      country: a.country,
                      phone: a.phone,
                      email: cur.email || user?.primaryEmail || "",
                    }))
                  }
                >
                  {a.label}: {a.address1}
                </button>
              ))}
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="first">First name</Label>
              <Input id="first" required value={address.firstName} onChange={set("firstName")} autoComplete="given-name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="last">Last name</Label>
              <Input id="last" required value={address.lastName} onChange={set("lastName")} autoComplete="family-name" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="addr1">Address</Label>
            <Input id="addr1" required value={address.address1} onChange={set("address1")} autoComplete="address-line1" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="addr2">Apartment, suite</Label>
            <Input id="addr2" value={address.address2} onChange={set("address2")} autoComplete="address-line2" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="city">City</Label>
              <Input id="city" required value={address.city} onChange={set("city")} autoComplete="address-level2" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="state">State</Label>
              <select
                id="state"
                value={address.state}
                onChange={set("state")}
                className="flex h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
              >
                {["CA", "NY", "TX", "FL", "WA", "AZ", "NV", "OR", "IL", "PA"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="zip">ZIP</Label>
              <Input id="zip" required value={address.zip} onChange={set("zip")} autoComplete="postal-code" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={address.phone} onChange={set("phone")} autoComplete="tel" />
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-2xl">Delivery</h2>
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
            <span className="flex items-center gap-3 text-sm">
              <input type="radio" name="ship" checked={method === "standard"} onChange={() => setMethod("standard")} />
              Standard · 3–5 business days
            </span>
            <span className="text-sm tabular-nums">
              {shippingCost(after, "standard") === 0 ? "Free" : formatMoney(STORE.standardShipping)}
            </span>
          </label>
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
            <span className="flex items-center gap-3 text-sm">
              <input type="radio" name="ship" checked={method === "express"} onChange={() => setMethod("express")} />
              Express · 1–2 business days
            </span>
            <span className="text-sm tabular-nums">{formatMoney(STORE.expressShipping)}</span>
          </label>
        </section>
        <section className="space-y-4">
          <h2 className="font-display text-2xl">Payment</h2>
          <p className="text-xs text-muted-foreground">Demo card — use any 16-digit number. Nothing is charged.</p>
          {account?.cards.length ? (
            <div className="space-y-2">
              <button type="button" className="text-xs underline" onClick={() => setSavedCardId("")}>
                Use a new card
              </button>
              {account.cards.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm">
                  <input type="radio" name="savedcard" checked={savedCardId === c.id} onChange={() => setSavedCardId(c.id)} />
                  {c.brand} ···· {c.last4} · {c.expMonth}/{c.expYear}
                </label>
              ))}
            </div>
          ) : null}
          <div className="space-y-1">
            <Label htmlFor="cardname">Name on card</Label>
            <Input id="cardname" required value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cardnum">Card number</Label>
            <Input
              id="cardnum"
              required={!savedCardId}
              disabled={Boolean(savedCardId)}
              inputMode="numeric"
              placeholder={savedCardId ? "Saved card" : "4242 4242 4242 4242"}
              value={
                savedCardId
                  ? `•••• •••• •••• ${account?.cards.find((c) => c.id === savedCardId)?.last4 ?? ""}`
                  : card.number
              }
              onChange={(e) => setCard({ ...card, number: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="exp">Expiry</Label>
              <Input id="exp" required placeholder="MM/YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" required placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} />
            </div>
          </div>
          {user ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={keepCard} onChange={(e) => setKeepCard(e.target.checked)} />
              Save this card to my account (last four digits only)
            </label>
          ) : null}
        </section>
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          Place order · {formatMoney(total)}
        </Button>
      </form>
      <aside className="h-fit rounded-xl bg-card p-6 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-2xl">Order</h2>
        <ul className="mt-4 space-y-3">
          {resolved.map(({ line, product, variant }) => (
            <li key={line.id} className="flex gap-3">
              <ListingImage src={product.images[0]?.src} alt="" className="size-16 rounded-md bg-card" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{product.title}</p>
                <p className="text-xs text-muted-foreground">
                  {variant.title} × {line.quantity}
                </p>
              </div>
              <p className="text-sm tabular-nums">{formatMoney(Number(variant.price) * line.quantity)}</p>
            </li>
          ))}
        </ul>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const res = applyCode(promo);
            toast[res.ok ? "success" : "error"](res.message);
          }}
        >
          <Input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Promo" />
          <Button type="submit" variant="outline">Apply</Button>
        </form>
        {unusedMine.map((r) => (
              <p key={r.code} className="mt-2 text-xs text-muted-foreground">
                You have{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => {
                    setPromo(r.code);
                    applyCode(r.code);
                  }}
                >
                  {r.code}
                </button>{" "}
                ({r.percent}% off), emailed after a friend’s order.
              </p>
            ))}
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatMoney(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Discount</dt>
            <dd className="tabular-nums">−{formatMoney(discount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd className="tabular-nums">{shipping === 0 ? "Free" : formatMoney(shipping)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Tax {address.state === "CA" ? "(CA)" : ""}</dt>
            <dd className="tabular-nums">{formatMoney(tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-medium">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatMoney(total)}</dd>
          </div>
        </dl>
      </aside>
    </main>
  );
}
