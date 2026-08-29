import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { emptyDraft, hydrateDraft, productToDraft, useInventoryStore, type ListingDraft } from "@/lib/inventory-store";
import { stripHtml, withDetails, type ProductDetails, type YesNo } from "@/lib/product-details";
import { AMAZON_PRODUCT_TYPES, type ProductOffer } from "@/lib/product-offer";
import { getProductById } from "@/data/catalog";
import { generateSku } from "@/lib/sku";
import { uniqueId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ListingImage } from "@/components/product/listing-image";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/lib/types";

export const Route = createFileRoute("/admin/listings/$id")({
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } => {
    const tab = search.tab;
    if (tab === "details" || tab === "images" || tab === "variations" || tab === "offer") return { tab };
    return {};
  },
  component: ListingEditorPage,
});

type Tab = "details" | "images" | "variations" | "offer";

const TABS: { id: Tab; label: string }[] = [
  { id: "details", label: "Product Details" },
  { id: "images", label: "Images" },
  { id: "variations", label: "Variations" },
  { id: "offer", label: "Offer" },
];

const TYPES = ["Makeup", "Fragrance", "Skincare", "Hair", "Bath & Body"];

function loadDraft(id: string): ListingDraft {
  if (id === "new") return hydrateDraft(emptyDraft());
  const stored = useInventoryStore.getState().getDraft(id);
  if (stored) return hydrateDraft(stored);
  const p = getProductById(id);
  if (p) return hydrateDraft(productToDraft(p));
  return hydrateDraft(emptyDraft());
}

function ListingEditorPage() {
  const { id } = Route.useParams();
  const { tab: tabFromSearch } = Route.useSearch();
  const navigate = useNavigate();
  const saveDraft = useInventoryStore((s) => s.saveDraft);
  const copyAsTemplate = useInventoryStore((s) => s.copyAsTemplate);
  const removeListing = useInventoryStore((s) => s.removeListing);
  const [tab, setTab] = useState<Tab>(tabFromSearch ?? "details");
  const [draft, setDraft] = useState<ListingDraft>(() => loadDraft(id));

  useEffect(() => {
    const next = loadDraft(id);
    setDraft(next);
    setTab(tabFromSearch ?? "details");
  }, [id, tabFromSearch]);

  function set<K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function save(status?: ListingDraft["status"]) {
    if (!(draft.details?.itemName || draft.title).trim()) {
      toast.error("Add an item name before saving.");
      setTab("details");
      return;
    }
    const next = { ...draft, status: status ?? draft.status };
    if (id === "new") {
      // keep generated id
    }
    saveDraft(next);
    toast(status === "active" ? "Listed" : status === "draft" ? "Saved as draft" : "Saved");
    if (id === "new") {
      void navigate({ to: "/admin/listings/$id", params: { id: next.id }, search: { tab } });
    }
  }

  const previewPrice = draft.variants[0]?.price ?? "0.00";

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            <Link to="/admin/inventory" className="hover:underline">Inventory</Link>
            {" / "}
            {id === "new" ? "Create listing" : "Edit listing"}
          </p>
          <h1 className="mt-1 font-display text-4xl">{draft.details?.itemName || draft.title || "Untitled listing"}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => save("draft")}>Save as draft</Button>
          <Button onClick={() => save("active")}>List item</Button>
        </div>
      </div>

      <div className="mt-6 flex gap-6 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 border-b-2 px-1 py-3 text-sm",
              tab === t.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
        <div>
          {tab === "details" ? <DetailsTab draft={draft} set={set} setDraft={setDraft} /> : null}
          {tab === "images" ? <ImagesTab draft={draft} setDraft={setDraft} /> : null}
          {tab === "variations" ? <VariationsTab draft={draft} setDraft={setDraft} /> : null}
          {tab === "offer" ? <OfferTab draft={draft} set={set} setDraft={setDraft} /> : null}
        </div>
        <aside className="h-fit rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Preview</p>
          <ListingImage src={draft.images[0]?.src} alt="" className="mt-3 aspect-square rounded-md" />
          <p className="mt-3 text-sm font-medium">{draft.details?.itemName || draft.title || "Listing title"}</p>
          <p className="text-sm tabular-nums">${previewPrice}</p>
          <p className="mt-1 text-xs text-muted-foreground capitalize">{draft.status}</p>
          {draft.copiedFrom ? <p className="mt-2 text-xs text-muted-foreground">Copied from another listing</p> : null}
          <div className="mt-4 flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => {
                saveDraft(draft);
                const made = copyAsTemplate(draft.id);
                toast("Opened a copy as a template");
                void navigate({ to: "/admin/listings/$id", params: { id: made.id } });
              }}
            >
              Copy as template
            </Button>
            {id !== "new" ? (
              <Button
                variant="outline"
                onClick={() => {
                  if (window.confirm("Delete this listing?")) {
                    removeListing(draft.id);
                    toast("Deleted");
                    void navigate({ to: "/admin/inventory" });
                  }
                }}
              >
                Delete
              </Button>
            ) : null}
            <Button variant="ghost" asChild>
              <Link to="/admin/inventory">Cancel</Link>
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
}

function DetailsTab({
  draft,
  set,
  setDraft,
}: {
  draft: ListingDraft;
  set: <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => void;
  setDraft: (fn: (d: ListingDraft) => ListingDraft) => void;
}) {
  const d = withDetails(draft).details;
  const v0 = draft.variants[0];

  function setDetail<K extends keyof ProductDetails>(key: K, value: ProductDetails[K]) {
    setDraft((cur) => {
      const details = { ...withDetails(cur).details, [key]: value };
      return {
        ...cur,
        details,
        title: key === "itemName" ? String(value) : cur.title,
        vendor: key === "brandName" ? String(value) : cur.vendor,
      };
    });
  }

  return (
    <div className="space-y-10">
      <Section title="Customizations">
        <YesNo value={d.customizations} onChange={(v) => setDetail("customizations", v)} label="Does this product have custom features?" />
      </Section>

      <Section title="Identity">
        <Field label="Item name" hint={`${d.itemName.length} / 200`}>
          <Input maxLength={200} value={d.itemName} onChange={(e) => setDetail("itemName", e.target.value)} placeholder="The main title for this listing" />
        </Field>
        <Field label="Item highlight" hint="Key selling points">
          <Textarea value={d.itemHighlight} onChange={(e) => setDetail("itemHighlight", e.target.value)} placeholder="Brief highlights customers see first" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand name">
            <Input value={d.brandName} onChange={(e) => setDetail("brandName", e.target.value)} placeholder="e.g. MAC" />
          </Field>
          <Field label="Manufacturer">
            <Input value={d.manufacturer} onChange={(e) => setDetail("manufacturer", e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="External product ID type">
            <Select value={d.externalIdType} onChange={(v) => setDetail("externalIdType", v as ProductDetails["externalIdType"])}>
              <option>ASIN</option>
              <option>UPC</option>
              <option>EAN</option>
              <option>GTIN</option>
            </Select>
          </Field>
          <Field label="External product ID">
            <Input value={d.externalId} onChange={(e) => setDetail("externalId", e.target.value)} placeholder="B0081X4XEM" />
          </Field>
          <div className="grid grid-cols-[1fr_auto] items-end gap-2">
            <Field label="SKU / custom label">
              <Input
                value={v0?.sku ?? ""}
                onChange={(e) =>
                  setDraft((cur) => ({
                    ...cur,
                    variants: cur.variants.map((v, i) => (i === 0 ? { ...v, sku: e.target.value } : v)),
                  }))
                }
              />
            </Field>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setDraft((cur) => ({
                  ...cur,
                  variants: cur.variants.map((v, i) => (i === 0 ? { ...v, sku: generateSku() } : v)),
                }))
              }
            >
              Generate
            </Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Item type keyword">
            <Input value={d.itemTypeKeyword} onChange={(e) => setDetail("itemTypeKeyword", e.target.value)} placeholder="makeup-brush-sets" />
          </Field>
          <Field label="Target audience keyword">
            <Select value={d.targetAudienceKeyword} onChange={(v) => setDetail("targetAudienceKeyword", v)}>
              <option value="unisex-adult">unisex-adult</option>
              <option value="female-adult">female-adult</option>
              <option value="male-adult">male-adult</option>
              <option value="unisex-youth">unisex-youth</option>
            </Select>
          </Field>
        </div>
        <YesNo value={d.fulfilledFromOrigin} onChange={(v) => setDetail("fulfilledFromOrigin", v)} label="Is fulfilled from origin item" />
        <Field label="Category">
          <Select value={draft.productType} onChange={(v) => set("productType", v)}>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
      </Section>

      <Section title="Product description">
        <Field label="Product description">
          <Textarea
            className="min-h-40"
            value={d.description || stripHtml(draft.bodyHtml)}
            onChange={(e) => setDetail("description", e.target.value)}
            placeholder="Detailed product information and features"
          />
        </Field>
        <div className="space-y-2">
          <Label>Bullet point</Label>
          <p className="text-xs text-muted-foreground">Specific key features and benefits — five lines, same as Amazon.</p>
          {d.bullets.map((line, i) => (
            <Input
              key={i}
              value={line}
              placeholder={`Bullet ${i + 1}`}
              onChange={(e) => {
                const bullets = [...d.bullets];
                bullets[i] = e.target.value;
                setDetail("bullets", bullets);
              }}
            />
          ))}
        </div>
        <Field label="Generic keyword">
          <Input value={d.genericKeyword} onChange={(e) => setDetail("genericKeyword", e.target.value)} placeholder="Search keywords to help customers find the listing" />
        </Field>
        <Field label="Special features">
          <Input value={d.specialFeatures} onChange={(e) => setDetail("specialFeatures", e.target.value)} placeholder="e.g. adjustable nylon strap" />
        </Field>
        <Field label="Lifestyle">
          <Select value={d.lifestyle} onChange={(v) => setDetail("lifestyle", v)}>
            <option>Mass Beauty</option>
            <option>Premium Beauty</option>
            <option>Prestige</option>
            <option>Clean Beauty</option>
          </Select>
        </Field>
      </Section>

      <Section title="Material & features">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Material type">
            <Input value={d.materialType} onChange={(e) => setDetail("materialType", e.target.value)} placeholder="Nylon" />
          </Field>
          <Field label="Material features">
            <Input value={d.materialFeature} onChange={(e) => setDetail("materialFeature", e.target.value)} placeholder="Natural" />
          </Field>
          <Field label="Handle material">
            <Input value={d.handleMaterial} onChange={(e) => setDetail("handleMaterial", e.target.value)} placeholder="Nylon" />
          </Field>
          <Field label="Bristle material">
            <Input value={d.bristleMaterial} onChange={(e) => setDetail("bristleMaterial", e.target.value)} placeholder="Resin" />
          </Field>
          <Field label="Ferrule material">
            <Input value={d.ferruleMaterial} onChange={(e) => setDetail("ferruleMaterial", e.target.value)} placeholder="Aluminum" />
          </Field>
        </div>
      </Section>

      <Section title="Quantities & sizes">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Number of items">
            <Input value={d.numberOfItems} onChange={(e) => setDetail("numberOfItems", e.target.value)} />
          </Field>
          <Field label="Item package quantity">
            <Input value={d.itemPackageQuantity} onChange={(e) => setDetail("itemPackageQuantity", e.target.value)} />
          </Field>
          <Field label="Number of pieces">
            <Input value={d.numberOfPieces} onChange={(e) => setDetail("numberOfPieces", e.target.value)} />
          </Field>
          <Field label="Size">
            <Input value={d.size} onChange={(e) => setDetail("size", e.target.value)} />
          </Field>
          <Field label="Number of packs">
            <Input value={d.numberOfPacks} onChange={(e) => setDetail("numberOfPacks", e.target.value)} />
          </Field>
          <Field label="Set name">
            <Input value={d.setName} onChange={(e) => setDetail("setName", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Color settings">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Color">
            <Input value={d.color} onChange={(e) => setDetail("color", e.target.value)} placeholder="Black" />
          </Field>
          <Field label="Color map">
            <Input value={d.colorMap} onChange={(e) => setDetail("colorMap", e.target.value)} placeholder="Black" />
          </Field>
        </div>
      </Section>

      <Section title="Form & unit count">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Item form">
            <Select value={d.itemForm} onChange={(v) => setDetail("itemForm", v)}>
              <option value="">Select</option>
              <option>Wand</option>
              <option>Cream</option>
              <option>Liquid</option>
              <option>Powder</option>
              <option>Spray</option>
              <option>Balm</option>
              <option>Serum</option>
              <option>Oil</option>
              <option>Stick</option>
              <option>Pencil</option>
              <option>Pad</option>
            </Select>
          </Field>
          <Field label="Unit count">
            <Input value={d.unitCount} onChange={(e) => setDetail("unitCount", e.target.value)} placeholder="1.0" />
          </Field>
          <Field label="Unit count type">
            <Select value={d.unitCountType} onChange={(v) => setDetail("unitCountType", v)}>
              <option>Count</option>
              <option>Fl Oz</option>
              <option>Ounce</option>
              <option>Milliliter</option>
              <option>Gram</option>
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Dates & safety">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product site launch date">
            <Input type="date" value={d.siteLaunchDate} onChange={(e) => setDetail("siteLaunchDate", e.target.value)} />
          </Field>
          <YesNo value={d.heatSensitive} onChange={(v) => setDetail("heatSensitive", v)} label="Is the item heat sensitive?" />
        </div>
        <Field label="Recommended uses for product">
          <Input value={d.recommendedUses} onChange={(e) => setDetail("recommendedUses", e.target.value)} placeholder="For Makeup Brushes" />
        </Field>
      </Section>

      <Section title="Government contract details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Government contract name">
            <Input value={d.governmentContractName} onChange={(e) => setDetail("governmentContractName", e.target.value)} />
          </Field>
          <Field label="Government contract number">
            <Input value={d.governmentContractNumber} onChange={(e) => setDetail("governmentContractNumber", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Item weight">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Item weight">
            <Input value={d.itemWeight} onChange={(e) => setDetail("itemWeight", e.target.value)} />
          </Field>
          <Field label="Weight unit">
            <Select value={d.itemWeightUnit} onChange={(v) => setDetail("itemWeightUnit", v as ProductDetails["itemWeightUnit"])}>
              <option value="ounces">ounces</option>
              <option value="pounds">pounds</option>
              <option value="grams">grams</option>
            </Select>
          </Field>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-b border-border pb-10 last:border-0 last:pb-0">
      <h2 className="font-display text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <select className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
      {children}
    </select>
  );
}

function YesNo({ value, onChange, label, name }: { value: YesNo; onChange: (v: YesNo) => void; label: string; name?: string }) {
  const group = name ?? label;
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="flex gap-6">
        {(["yes", "no"] as const).map((opt) => (
          <label key={opt} className="flex h-11 items-center gap-2 text-sm capitalize">
            <input type="radio" name={group} checked={value === opt} onChange={() => onChange(opt)} />
            {opt}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ImagesTab({ draft, setDraft }: { draft: ListingDraft; setDraft: (fn: (d: ListingDraft) => ListingDraft) => void }) {
  const [url, setUrl] = useState("");
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Use a warehouse photo URL. First image is the catalog hero.</p>
      <div className="flex gap-2">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
        <Button
          type="button"
          onClick={() => {
            if (!url.trim()) return;
            setDraft((d) => ({
              ...d,
              images: [...d.images, { id: uniqueId("img"), src: url.trim(), alt: d.title, position: d.images.length + 1 }],
            }));
            setUrl("");
          }}
        >
          Add photo
        </Button>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {draft.images.map((img, i) => (
          <li key={img.id} className="rounded-lg border border-border p-2">
            <ListingImage src={img.src} alt="" className="aspect-square rounded-md" />
            <div className="mt-2 flex justify-between text-xs">
              <span>{i === 0 ? "Primary" : `Photo ${i + 1}`}</span>
              <button
                type="button"
                className="underline"
                onClick={() => setDraft((d) => ({ ...d, images: d.images.filter((x) => x.id !== img.id) }))}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function VariationsTab({ draft, setDraft }: { draft: ListingDraft; setDraft: (fn: (d: ListingDraft) => ListingDraft) => void }) {
  const optionName = draft.options[0]?.name ?? "Title";
  return (
    <div className="space-y-4">
      <Field label="Variation theme">
        <Input
          value={optionName}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              options: [{ name: e.target.value || "Title", values: d.variants.map((v) => v.title) }],
            }))
          }
        />
      </Field>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">{optionName}</th>
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="px-3 py-2 font-medium">UPC</th>
              <th className="px-3 py-2 font-medium">Qty</th>
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {draft.variants.map((v) => (
              <tr key={v.id} className="border-b border-border last:border-0">
                <td className="px-2 py-2">
                  <Input value={v.title} onChange={(e) => patchVar(setDraft, v.id, { title: e.target.value })} />
                </td>
                <td className="px-2 py-2">
                  <Input value={v.sku} onChange={(e) => patchVar(setDraft, v.id, { sku: e.target.value })} />
                </td>
                <td className="px-2 py-2">
                  <Input value={v.barcode ?? ""} onChange={(e) => patchVar(setDraft, v.id, { barcode: e.target.value })} />
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    className="w-20"
                    value={v.inventoryQuantity}
                    onChange={(e) => patchVar(setDraft, v.id, { inventoryQuantity: Number(e.target.value) || 0 })}
                  />
                </td>
                <td className="px-2 py-2">
                  <Input className="w-24" value={v.price} onChange={(e) => patchVar(setDraft, v.id, { price: e.target.value })} />
                </td>
                <td className="px-2 py-2">
                  <button
                    type="button"
                    className="text-xs underline"
                    onClick={() => setDraft((d) => ({ ...d, variants: d.variants.filter((x) => x.id !== v.id) }))}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          setDraft((d) => ({
            ...d,
            variants: [
              ...d.variants,
              {
                id: uniqueId("var"),
                title: `Shade ${d.variants.length + 1}`,
                sku: generateSku(),
                price: d.variants[0]?.price ?? "0.00",
                inventoryQuantity: 0,
                inventoryPolicy: "deny",
                weight: 0.25,
                weightUnit: "oz",
                available: false,
                taxable: true,
                requiresShipping: true,
              } satisfies ProductVariant,
            ],
          }))
        }
      >
        Add variation
      </Button>
    </div>
  );
}

function OfferTab({
  draft,
  set,
  setDraft,
}: {
  draft: ListingDraft;
  set: <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => void;
  setDraft: (fn: (d: ListingDraft) => ListingDraft) => void;
}) {
  const o = hydrateDraft(draft).offer;
  const qty = draft.variants.reduce((s, v) => s + v.inventoryQuantity, 0);

  function setOffer<K extends keyof ProductOffer>(key: K, value: ProductOffer[K]) {
    setDraft((cur) => {
      const offer = { ...hydrateDraft(cur).offer, [key]: value };
      const variants = cur.variants.map((v, i) => {
        if (i !== 0) return v;
        return {
          ...v,
          sku: key === "sku" ? String(value) : v.sku,
          price: key === "yourPrice" ? String(value) : v.price,
          compareAtPrice: key === "listPrice" ? String(value) : v.compareAtPrice,
          inventoryQuantity: key === "quantity" ? Math.max(0, Number(value) || 0) : v.inventoryQuantity,
        };
      });
      return { ...cur, offer, variants };
    });
  }

  return (
    <div className="space-y-10">
      <Section title="Basic offer details">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <Field label="SKU">
            <Input value={o.sku} onChange={(e) => setOffer("sku", e.target.value)} placeholder="EC-6SKT-E5RD" />
          </Field>
          <Button type="button" className="self-end" variant="outline" onClick={() => setOffer("sku", generateSku())}>
            Generate
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product type">
            <Select value={o.amazonProductType} onChange={(v) => setOffer("amazonProductType", v)}>
              {AMAZON_PRODUCT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Quantity">
            <Input type="number" min={0} value={o.quantity} onChange={(e) => setOffer("quantity", e.target.value)} />
          </Field>
          <Field label="Handling time (days)">
            <Input type="number" min={0} value={o.handlingTime} onChange={(e) => setOffer("handlingTime", e.target.value)} />
          </Field>
          <Field label="Restock date">
            <Input type="date" value={o.restockDate} onChange={(e) => setOffer("restockDate", e.target.value)} />
          </Field>
        </div>
        {draft.variants.length > 1 ? <p className="text-xs text-muted-foreground">{qty} units across {draft.variants.length} variations — quantity above is the default offer.</p> : null}
      </Section>

      <Section title="Pricing & discounts">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your price" hint="USD">
            <Input value={o.yourPrice} onChange={(e) => setOffer("yourPrice", e.target.value)} placeholder="55.77" />
          </Field>
          <Field label="Minimum advertised price (MAP)">
            <Input value={o.mapPrice} onChange={(e) => setOffer("mapPrice", e.target.value)} />
          </Field>
          <Field label="Minimum seller allowed price">
            <Input value={o.minSellerPrice} onChange={(e) => setOffer("minSellerPrice", e.target.value)} />
          </Field>
          <Field label="Maximum seller allowed price">
            <Input value={o.maxSellerPrice} onChange={(e) => setOffer("maxSellerPrice", e.target.value)} />
          </Field>
          <Field label="List price">
            <Input value={o.listPrice} onChange={(e) => setOffer("listPrice", e.target.value)} />
          </Field>
          <Field label="Sale price">
            <Input value={o.salePrice} onChange={(e) => setOffer("salePrice", e.target.value)} />
          </Field>
          <Field label="Sale start date">
            <Input type="date" value={o.saleStartDate} onChange={(e) => setOffer("saleStartDate", e.target.value)} />
          </Field>
          <Field label="Sale end date">
            <Input type="date" value={o.saleEndDate} onChange={(e) => setOffer("saleEndDate", e.target.value)} />
          </Field>
        </div>
        <YesNo name="currency-conversion" value={o.currencyConversion} onChange={(v) => setOffer("currencyConversion", v)} label="Apply currency conversion" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Item cost">
            <Input value={draft.cost} onChange={(e) => set("cost", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Dates & fulfillment">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Offering release date">
            <Input type="date" value={o.offeringReleaseDate} onChange={(e) => setOffer("offeringReleaseDate", e.target.value)} />
          </Field>
          <Field label="Merchant release date">
            <Input type="date" value={o.merchantReleaseDate} onChange={(e) => setOffer("merchantReleaseDate", e.target.value)} />
          </Field>
          <Field label="Item condition">
            <Select value={o.itemCondition} onChange={(v) => setOffer("itemCondition", v)}>
              <option>New</option>
              <option>New with box</option>
              <option>New without box</option>
              <option>Refurbished</option>
              <option>Used</option>
            </Select>
          </Field>
          <Field label="Maximum order quantity">
            <Input type="number" min={1} value={o.maxOrderQuantity} onChange={(e) => setOffer("maxOrderQuantity", e.target.value)} />
          </Field>
        </div>
        <Field label="Listing status">
          <Select value={draft.status} onChange={(v) => set("status", v as ListingDraft["status"])}>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="ended">Ended</option>
          </Select>
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.featured} onChange={(e) => set("featured", e.target.checked)} />
          Feature on the storefront
        </label>
      </Section>

      <Section title="Gifting & supplemental information">
        <YesNo name="gift-message" value={o.giftMessage} onChange={(v) => setOffer("giftMessage", v)} label="Offering can be gift messaged" />
        <YesNo name="gift-wrap" value={o.giftWrap} onChange={(v) => setOffer("giftWrap", v)} label="Is gift wrap available" />
        <Field label="Import designation">
          <Input value={o.importDesignation} onChange={(e) => setOffer("importDesignation", e.target.value)} placeholder="United States" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Accessories">
            <Input value={o.accessoriesCondition} onChange={(e) => setOffer("accessoriesCondition", e.target.value)} />
          </Field>
          <Field label="Functional condition">
            <Input value={o.functionalCondition} onChange={(e) => setOffer("functionalCondition", e.target.value)} />
          </Field>
          <Field label="Packaging">
            <Input value={o.packagingCondition} onChange={(e) => setOffer("packagingCondition", e.target.value)} />
          </Field>
          <Field label="Renewed grade">
            <Input value={o.renewedGrade} onChange={(e) => setOffer("renewedGrade", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Dimensions & shipping">
        <p className="text-sm text-muted-foreground">Item dimensions</p>
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Length">
            <Input value={o.itemLength} onChange={(e) => setOffer("itemLength", e.target.value)} />
          </Field>
          <Field label="Width">
            <Input value={o.itemWidth} onChange={(e) => setOffer("itemWidth", e.target.value)} />
          </Field>
          <Field label="Height">
            <Input value={o.itemHeight} onChange={(e) => setOffer("itemHeight", e.target.value)} />
          </Field>
          <Field label="Unit">
            <Select value={o.itemDimUnit} onChange={(v) => setOffer("itemDimUnit", v as ProductOffer["itemDimUnit"])}>
              <option value="inches">inches</option>
              <option value="centimeters">centimeters</option>
            </Select>
          </Field>
        </div>
        <p className="text-sm text-muted-foreground">Package dimensions</p>
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Length">
            <Input value={o.packageLength} onChange={(e) => setOffer("packageLength", e.target.value)} />
          </Field>
          <Field label="Width">
            <Input value={o.packageWidth} onChange={(e) => setOffer("packageWidth", e.target.value)} />
          </Field>
          <Field label="Height">
            <Input value={o.packageHeight} onChange={(e) => setOffer("packageHeight", e.target.value)} />
          </Field>
          <Field label="Unit">
            <Select value={o.packageDimUnit} onChange={(v) => setOffer("packageDimUnit", v as ProductOffer["packageDimUnit"])}>
              <option value="inches">inches</option>
              <option value="centimeters">centimeters</option>
            </Select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Package weight">
            <Input value={o.packageWeight} onChange={(e) => setOffer("packageWeight", e.target.value)} placeholder="0.5" />
          </Field>
          <Field label="Weight unit">
            <Select value={o.packageWeightUnit} onChange={(v) => setOffer("packageWeightUnit", v as ProductOffer["packageWeightUnit"])}>
              <option value="pounds">pounds</option>
              <option value="ounces">ounces</option>
              <option value="grams">grams</option>
            </Select>
          </Field>
          <Field label="Master pack layers per pallet">
            <Input value={o.masterPackLayers} onChange={(e) => setOffer("masterPackLayers", e.target.value)} />
          </Field>
          <Field label="Master packs per layer">
            <Input value={o.masterPacksPerLayer} onChange={(e) => setOffer("masterPacksPerLayer", e.target.value)} />
          </Field>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Shipping options</p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs tracking-[0.12em] text-muted-foreground uppercase">
                <tr>
                  <th className="px-3 py-2">Method</th>
                  <th className="px-3 py-2">Enabled</th>
                  <th className="px-3 py-2">Delivery</th>
                  <th className="px-3 py-2">Fee (USD)</th>
                </tr>
              </thead>
              <tbody>
                {o.shippingMethods.map((m) => (
                  <tr key={m.id} className="border-t border-border">
                    <td className="px-3 py-2">{m.name}</td>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={m.enabled}
                        onChange={(e) =>
                          setOffer(
                            "shippingMethods",
                            o.shippingMethods.map((x) => (x.id === m.id ? { ...x, enabled: e.target.checked } : x)),
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{m.days}</td>
                    <td className="px-3 py-2">
                      <Input
                        className="h-9 w-28"
                        value={m.fee}
                        onChange={(e) =>
                          setOffer(
                            "shippingMethods",
                            o.shippingMethods.map((x) => (x.id === m.id ? { ...x, fee: e.target.value } : x)),
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-3">
        <Label>{label}</Label>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function patchVar(setDraft: (fn: (d: ListingDraft) => ListingDraft) => void, id: string, patch: Partial<ProductVariant>) {
  setDraft((d) => ({
    ...d,
    variants: d.variants.map((v) => (v.id === id ? { ...v, ...patch } : v)),
  }));
}
