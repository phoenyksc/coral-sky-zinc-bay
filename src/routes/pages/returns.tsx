import { createFileRoute, Link } from "@tanstack/react-router";
import { ProsePage } from "@/components/layout/prose-page";
import { STORE } from "@/lib/store-config";

export const Route = createFileRoute("/pages/returns")({ component: Page });

function Page() {
  return (
    <ProsePage kicker="Policy" title="Returns">
      <p>
        Unopened, unused items in original packaging may be returned within 14 days of delivery. Buyer pays return
        shipping unless we shipped the wrong thing, a damaged parcel, or an item that does not match the product photo.
      </p>
      <h2>What we cannot take back</h2>
      <ul>
        <li>Opened fragrance, including testers once the cellophane or cap seal is broken.</li>
        <li>Used makeup, skincare, or hair products — hygiene items are final sale once opened.</li>
        <li>Items marked hard-to-find, discontinued, or limited once the factory seal is broken.</li>
        <li>Sale or under-$20 minis once opened.</li>
      </ul>
      <h2>How to start</h2>
      <p>
        Email {STORE.email} with the order number, the reason, and photos of the item plus the packing slip. We will
        send a return address. Refunds go back to the original tender after we inspect the return — usually 3–5
        business days after it lands in Fountain Valley. Original outbound shipping is only refunded when the error
        was ours.
      </p>
      <h2>Exchanges</h2>
      <p>
        We do not hold inventory for shade exchanges. Return the unopened piece, then reorder the shade you want if
        it is still in stock. Inventory moves in {STORE.inventoryTool} as soon as it sells.
      </p>
      <p>
        Payment methods and charge timing are on the <Link to="/pages/payment">payment policy</Link>. Shipping times
        are on the <Link to="/pages/shipping">shipping policy</Link>.
      </p>
    </ProsePage>
  );
}
