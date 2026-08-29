import { createFileRoute, Link } from "@tanstack/react-router";
import { ProsePage } from "@/components/layout/prose-page";
import { STORE } from "@/lib/store-config";

export const Route = createFileRoute("/pages/payment")({ component: Page });

function Page() {
  return (
    <ProsePage kicker="Policy" title="Payment">
      <p>
        Prices on Sol Beautiful are in US dollars. What you see on the product page is what we charge, plus shipping
        and tax.
      </p>
      <h2>Methods we accept</h2>
      <ul>
        <li>Visa, Mastercard, American Express, and Discover</li>
        <li>PayPal</li>
        <li>Apple Pay and Google Pay where your browser supports them</li>
      </ul>
      <p>
        Guest checkout is available — no account required. We never ask you to send payment off-site, by wire, or as
        a gift card. This preview charges a demo card so you can walk the bag through; a live processor is wired when
        the shop is connected to payments.
      </p>
      <h2>When you are charged</h2>
      <p>
        The card or PayPal account is authorized at checkout and captured when the {STORE.shippingTool} label is
        created. If a shade sells out between bag and capture, we cancel that line and refund it rather than substitute.
      </p>
      <h2>Sales tax</h2>
      <p>
        California orders are charged {(STORE.caTaxRate * 100).toFixed(2)}% sales tax on merchandise and taxable
        shipping. Other US states: we collect where the law requires. Tax is calculated at checkout from the ship-to
        address.
      </p>
      <h2>Promotions</h2>
      <p>
        Codes SOL15 (15% off), WELCOME10 ($10 off $50+), and RARE20 (20% off hard-to-find) can be applied in the bag.
        Codes do not stack. Free standard shipping still starts at ${STORE.freeShippingThreshold} after discounts.
      </p>
      <h2>Invoices</h2>
      <p>
        A {STORE.shippingTool} invoice rides with the shipment and is emailed at label creation: items, price, tax,
        shipping method, and tracking. Keep it for returns. Questions:{" "}
        <Link to="/pages/contact">contact the shop</Link>.
      </p>
    </ProsePage>
  );
}
