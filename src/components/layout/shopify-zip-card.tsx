import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadShopifyFile, type ShopifyDownloadKind } from "@/lib/download-file";

function useZipDownload() {
  const [busy, setBusy] = useState<ShopifyDownloadKind | null>(null);
  const run = (kind: ShopifyDownloadKind) => {
    if (busy) return;
    setBusy(kind);
    void downloadShopifyFile(kind)
      .then((name) => toast(`Saved ${name}`))
      .catch((err: Error) => toast.error(err.message || "Could not download the zip."))
      .finally(() => setBusy(null));
  };
  return { busy, run };
}

export function ShopifyZipCard({ compact = false }: { compact?: boolean }) {
  const { busy, run } = useZipDownload();

  if (compact) {
    return (
      <p className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
        <button type="button" className="font-medium underline underline-offset-4" onClick={() => run("theme")} disabled={Boolean(busy)}>
          {busy === "theme" ? "Preparing zip…" : "Theme zip"}
        </button>
        <button type="button" className="underline underline-offset-4" onClick={() => run("csv")} disabled={Boolean(busy)}>
          {busy === "csv" ? "Preparing CSV…" : "Inventory CSV"}
        </button>
        <button type="button" className="underline underline-offset-4" onClick={() => run("kit")} disabled={Boolean(busy)}>
          {busy === "kit" ? "Preparing kit…" : "Both in one zip"}
        </button>
      </p>
    );
  }

  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Shopify upload</p>
        <h2 className="mt-2 font-display text-4xl">Theme zip and inventory</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Theme zip → Shopify Online Store → Themes → Upload zip file (do not unzip it).
          Inventory CSV → Products → Import.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button size="lg" type="button" disabled={Boolean(busy)} onClick={() => run("theme")}>
            {busy === "theme" ? "Preparing…" : "Theme zip"}
          </Button>
          <Button size="lg" variant="outline" type="button" disabled={Boolean(busy)} onClick={() => run("csv")}>
            {busy === "csv" ? "Preparing…" : "Inventory CSV"}
          </Button>
          <Button size="lg" variant="outline" type="button" disabled={Boolean(busy)} onClick={() => run("kit")}>
            {busy === "kit" ? "Preparing…" : "Both in one zip"}
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          After the theme is on Shopify, import the CSV under Products → Import so the listings, prices, and photos come with it.
        </p>
      </div>
    </section>
  );
}
