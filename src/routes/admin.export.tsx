import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CATALOG_STATS, COLLECTIONS, PRODUCTS } from "@/data/catalog";
import { downloadText, toShopifyCsv, toShopifyJson } from "@/lib/shopify-csv";
import { downloadShopifyFile } from "@/lib/download-file";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/export")({ component: ExportPage });

function ExportPage() {
  const sample = PRODUCTS.filter((p) => p.featured).slice(0, 8);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">The vault</p>
      <h1 className="mt-1 font-display text-4xl">Shopify export</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Preferred: download the theme zip and upload it yourself in Shopify under Online Store → Themes → Add theme →
        Upload zip file. Then import the product CSV. Shopify CLI and GitHub staff access are not needed.
      </p>

      <dl className="mt-10 grid grid-cols-3 gap-3 text-center">
        {[
          [CATALOG_STATS.products.toLocaleString(), "Products"],
          [CATALOG_STATS.variants.toLocaleString(), "Variants"],
          [String(COLLECTIONS.length), "Collections"],
        ].map(([n, l]) => (
          <div key={l} className="rounded-xl bg-card px-3 py-5 shadow-[var(--shadow-border)]">
            <p className="font-display text-3xl tabular-nums">{n}</p>
            <p className="mt-1 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{l}</p>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          onClick={() => {
            void downloadShopifyFile("theme")
              .then((name) => toast(`Saved ${name}`))
              .catch((err: Error) => toast.error(err.message));
          }}
        >
          Download theme zip
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            void downloadShopifyFile("kit")
              .then((name) => toast(`Saved ${name}`))
              .catch((err: Error) => toast.error(err.message));
          }}
        >
          Download full upload kit
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            downloadText("sol-beautiful-shopify-products.csv", toShopifyCsv(), "text/csv;charset=utf-8");
            toast("Shopify product CSV downloaded");
          }}
        >
          Download Shopify CSV
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            downloadText("sol-beautiful-shopify-products.json", JSON.stringify(toShopifyJson(), null, 2), "application/json");
            toast("Shopify JSON downloaded");
          }}
        >
          Download JSON
        </Button>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Theme zip → Online Store → Themes → Add theme → Upload zip file. Then import the product CSV.
        A README with collection, page, shipping, and discount steps is inside the full kit.
      </p>

      <div className="mt-12 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs tracking-[0.12em] text-muted-foreground uppercase">
            <tr>
              <th className="px-3 py-2">Handle</th>
              <th className="px-3 py-2">Vendor</th>
              <th className="px-3 py-2">Type</th>
            </tr>
          </thead>
          <tbody>
            {sample.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-3 py-2">{p.handle}</td>
                <td className="px-3 py-2">{p.vendor}</td>
                <td className="px-3 py-2">{p.productType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
