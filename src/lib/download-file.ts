const FILES = {
  theme: "sol-beautiful-theme.zip",
  kit: "sol-beautiful-shopify-upload.zip",
  csv: "sol-beautiful-products.csv",
} as const;

export type ShopifyDownloadKind = keyof typeof FILES;

export function shopifyDownloadName(kind: ShopifyDownloadKind) {
  return FILES[kind];
}

export function triggerBlobDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function downloadShopifyFile(kind: ShopifyDownloadKind) {
  const filename = FILES[kind];
  const api = `/api/shopify-zip?file=${kind}`;
  const res = await fetch(api, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not prepare ${filename}`);
  const blob = await res.blob();
  if (blob.size < 100) throw new Error(`Could not prepare ${filename}`);
  triggerBlobDownload(filename, blob);
  // Preview iframes often block blob saves. A new tab with attachment headers can still land in Downloads.
  window.setTimeout(() => {
    const a = document.createElement("a");
    a.href = api;
    a.download = filename;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, 250);
  return filename;
}
