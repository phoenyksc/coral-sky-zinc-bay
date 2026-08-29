import { Link } from "@tanstack/react-router";
import { usePublishStore } from "@/lib/publish-store";
import { ShopifyZipCard } from "@/components/layout/shopify-zip-card";

export const VAULT_LINKS = [
  { to: "/admin" as const, label: "Reports" },
  { to: "/admin/inventory" as const, label: "Inventory" },
  { to: "/admin/listings/$id" as const, params: { id: "new" }, label: "Create listing" },
  { to: "/admin/export" as const, label: "Shopify export" },
  { to: "/admin/security" as const, label: "Security" },
] as const;

export function useBuildingMode() {
  return !usePublishStore((s) => s.publicLive);
}

export function BuildingAdminBanner() {
  const building = useBuildingMode();
  if (!building) return null;
  return (
    <div className="border-t border-border/70 bg-foreground px-4 py-2.5 text-center text-sm text-background sm:px-6">
      Building the vault —{" "}
      <Link to="/admin" className="font-medium underline underline-offset-4">
        The vault
      </Link>{" "}
      is on the shop until you publish. After publish it sits behind administrator access.
      <ShopifyZipCard compact />
    </div>
  );
}
