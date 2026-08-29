import { createFileRoute } from "@tanstack/react-router";
import { ProsePage } from "@/components/layout/prose-page";
import { STORE } from "@/lib/store-config";

export const Route = createFileRoute("/pages/authenticity")({ component: Page });

function Page() {
  return (
    <ProsePage kicker="Trust" title="Authenticity">
      <p>
        We sell authentic designer stock — factory-sealed where the manufacturer sealed it. Photographs on this site
        are of the actual pieces, not stock art. We do not sell clones, impression oils, or decants labeled
        as authentic bottles. Where we can verify it, the manufacturer UPC for the shade is listed on the product page.
      </p>
      <h2>What we check</h2>
      <p>
        Caps, crimps, batch codes, juice color, packaging, and barcode against known authentic references. Liquidation
        and discontinued does not mean gray-market mystery juice. Hard-to-find pieces are the same brands, just no
        longer on the counter. Prescriptives, allocated AERIN, and old MAC vault shades are still the original formulas.
      </p>
      <h2>If something is wrong</h2>
      <p>
        Contact us at {STORE.email} before opening if a seal looks disturbed in transit. Include photos and the{" "}
        {STORE.shippingTool} invoice number. We will make it right. Fragrance opened after delivery is not returnable
        except for a documented authenticity issue.
      </p>
    </ProsePage>
  );
}
