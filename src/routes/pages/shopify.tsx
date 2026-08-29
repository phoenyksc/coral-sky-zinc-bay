import { createFileRoute } from "@tanstack/react-router";
import { ShopifyZipCard } from "@/components/layout/shopify-zip-card";

export const Route = createFileRoute("/pages/shopify")({ component: ShopifyDownloadPage });

function ShopifyDownloadPage() {
  return (
    <main>
      <ShopifyZipCard />
    </main>
  );
}
