import { createFileRoute, Link } from "@tanstack/react-router";
import { ProsePage } from "@/components/layout/prose-page";
import { STORE } from "@/lib/store-config";

export const Route = createFileRoute("/pages/shipping")({ component: Page });

function Page() {
  return (
    <ProsePage kicker="Policy" title="Shipping">
      <p>
        Every order is packed in the United States, from {STORE.origin}. Once payment clears, we
        create the shipping label and packing invoice in {STORE.shippingTool} and hand the parcel to USPS or UPS.
      </p>
      <h2>Processing time</h2>
      <p>
        Most in-stock orders go out within one business day (Monday–Friday, excluding US holidays). Weekend orders
        print Monday. During heat waves we may hold fragrance an extra day rather than cook a bottle on a porch.
      </p>
      <h2>Rates (contiguous United States)</h2>
      <ul>
        <li>Standard — ${STORE.standardShipping.toFixed(2)}, 3–5 business days after it leaves California.</li>
        <li>Express — ${STORE.expressShipping.toFixed(2)}, 1–2 business days after it leaves.</li>
        <li>Free standard shipping on orders ${STORE.freeShippingThreshold}+ after discounts.</li>
      </ul>
      <p>
        Alaska, Hawaii, US territories, and PO boxes ship USPS only; express may not be available. We do not currently
        offer international checkout on this site.
      </p>
      <h2>Tracking & invoices</h2>
      <p>
        You receive a {STORE.shippingTool} invoice with carrier, tracking number, and the line items we packed.
        Tracking usually appears within a few hours of the label being created. Signature may be required on high-value
        fragrance.
      </p>
      <h2>Damage in transit</h2>
      <p>
        Photograph the box, the packing, and the item before you discard anything, then write us with the order number.
        We will file with the carrier or replace from stock when we still have it. See also{" "}
        <Link to="/pages/returns">returns</Link>.
      </p>
    </ProsePage>
  );
}
