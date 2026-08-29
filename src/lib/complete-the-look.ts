import type { Product, ProductVariant } from "@/lib/types";

export type MakeupRole =
  | "foundation"
  | "concealer"
  | "powder"
  | "primer"
  | "setting"
  | "blush"
  | "bronzer"
  | "lipstick"
  | "lipgloss"
  | "lipliner"
  | "eyeshadow"
  | "eyeliner"
  | "mascara"
  | "brow"
  | "brush"
  | "fragrance"
  | "skincare"
  | "hair"
  | "other";

export type SkinDepth = "fair" | "light" | "medium" | "tan" | "deep";
export type Undertone = "cool" | "warm" | "neutral";
export type ColorFamily = "nude" | "pink" | "coral" | "red" | "berry" | "brown" | "gold";

export interface ShadeProfile {
  role: MakeupRole;
  depth: SkinDepth | null;
  undertone: Undertone | null;
  color: ColorFamily | null;
}

export interface LookSuggestion {
  product: Product;
  variant: ProductVariant;
  role: MakeupRole;
  reason: string;
  score: number;
}

export interface CompleteLook {
  headline: string;
  subtitle: string;
  items: LookSuggestion[];
}

const ROLE_FROM_CATEGORY: Record<string, MakeupRole> = {
  Foundation: "foundation",
  Concealer: "concealer",
  "Face Powder": "powder",
  "Face Primer": "primer",
  "Setting Spray": "setting",
  Blush: "blush",
  "Bronzer, Contour & Highlighter": "bronzer",
  Lipstick: "lipstick",
  "Lip Gloss": "lipgloss",
  "Lip Liner": "lipliner",
  "Eye Shadow": "eyeshadow",
  Eyeliner: "eyeliner",
  Mascara: "mascara",
  "Eyebrow Liner & Definition": "brow",
  Brushes: "brush",
  "Women's Fragrances": "fragrance",
  "Men's Fragrances": "fragrance",
  "Unisex Fragrances": "fragrance",
  Moisturizers: "skincare",
  "Cleansers & Toners": "skincare",
  "Anti-Aging Products": "skincare",
};

const ROLE_PATTERNS: Array<[MakeupRole, RegExp]> = [
  ["foundation", /\bfoundation\b|\bstudio fix fluid\b|\bdouble wear\b|\bcc cream\b|\bbb cream\b|\balphabet cream\b/i],
  ["concealer", /\bconcealer\b|\bcamouflage cream\b/i],
  ["powder", /\b(pressed|loose|setting|finishing|translucent|perfecting)\s+powder\b|\bface powder\b|\bpowder plus foundation\b|\bsuperpowder\b/i],
  ["primer", /\bprimer\b/i],
  ["setting", /\bsetting spray\b|\bfix\s*\+/i],
  ["blush", /\bblush(er)?\b|\bcheek (flush|color|colour|palette)\b/i],
  ["bronzer", /\bbronzer\b|\bcontour\b|\bhighlighter\b|\billuminat/i],
  ["lipstick", /\blipstick\b|\blip colou?r\b|\blipcolor\b|\brouge\b|\blip gelee\b/i],
  ["lipgloss", /\blip\s*gloss\b|\bjuicy tubes\b|\bhigh lip shine\b/i],
  ["lipliner", /\blip\s*(liner|pencil|defining|shaper)\b/i],
  ["eyeshadow", /\beye\s*shadow\b|\beye color quad\b|\blid lacquer\b|\beye smoker\b/i],
  ["eyeliner", /\beye\s*liner\b|\beye pencil\b/i],
  ["mascara", /\bmascara\b/i],
  ["brow", /\bbrow\b|\beyebrow\b/i],
  ["brush", /\bbrush(es)?\b|\bsponge\b|\bapplicator\b/i],
  ["fragrance", /\b(eau de |edp|edt|parfum|cologne|fragrance)\b/i],
  ["skincare", /\b(moisturizer|moisturiser|serum|cleanser|toner|cream|lotion|mask)\b/i],
  ["hair", /\b(shampoo|conditioner|hair)\b/i],
];

const COMPANIONS: Record<MakeupRole, MakeupRole[]> = {
  foundation: ["concealer", "powder", "primer", "setting"],
  concealer: ["foundation", "powder", "setting"],
  powder: ["foundation", "blush", "bronzer"],
  primer: ["foundation", "concealer", "setting"],
  setting: ["foundation", "powder", "concealer"],
  lipstick: ["blush", "eyeshadow", "lipliner"],
  lipgloss: ["lipstick", "blush", "lipliner"],
  lipliner: ["lipstick", "blush", "eyeshadow"],
  blush: ["lipstick", "eyeshadow", "bronzer"],
  bronzer: ["blush", "eyeshadow", "powder"],
  eyeshadow: ["blush", "lipstick", "eyeliner"],
  eyeliner: ["mascara", "eyeshadow", "brow"],
  mascara: ["eyeliner", "eyeshadow", "brow"],
  brow: ["eyeliner", "mascara", "eyeshadow"],
  brush: ["foundation", "blush", "eyeshadow"],
  fragrance: ["fragrance", "skincare"],
  skincare: ["skincare", "fragrance"],
  hair: ["hair"],
  other: ["blush", "lipstick", "eyeshadow"],
};

const COLOR_COMPANIONS: Record<ColorFamily, ColorFamily[]> = {
  nude: ["nude", "pink", "brown", "gold"],
  pink: ["pink", "nude", "coral", "gold"],
  coral: ["coral", "gold", "nude", "pink"],
  red: ["pink", "berry", "brown", "gold"],
  berry: ["berry", "pink", "brown"],
  brown: ["nude", "gold", "brown", "pink"],
  gold: ["brown", "nude", "coral", "gold"],
};

const DEPTH_ORDER: SkinDepth[] = ["fair", "light", "medium", "tan", "deep"];

function hay(product: Product, variant?: ProductVariant) {
  return [
    product.title,
    product.category ?? "",
    product.productType,
    variant?.title ?? "",
    variant?.option1 ?? "",
    ...(variant ? [] : product.variants.map((v) => `${v.title} ${v.option1 ?? ""}`)),
  ]
    .join(" ")
    .toLowerCase();
}

export function classifyRole(product: Product): MakeupRole {
  const cat = product.category ? ROLE_FROM_CATEGORY[product.category] : undefined;
  if (cat && cat !== "other") return cat;
  const text = `${product.title} ${product.category ?? ""}`;
  for (const [role, re] of ROLE_PATTERNS) {
    if (re.test(text)) return role;
  }
  if (product.productType === "Fragrance") return "fragrance";
  if (product.productType === "Skincare") return "skincare";
  if (product.productType === "Hair") return "hair";
  return "other";
}

function macDepth(text: string): SkinDepth | null {
  const m = text.match(/\b(?:nc|nw|c|n|w|wn|cn)\s*(\d{1,2})\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  if (n <= 15) return "fair";
  if (n <= 25) return "light";
  if (n <= 37) return "medium";
  if (n <= 45) return "tan";
  return "deep";
}

function wordDepth(text: string): SkinDepth | null {
  if (/\b(porcelain|ivory|alabaster|fair|pale|bone|vanilla|linen|meringue|shell|1c1|1w0|1c0|cool bone|warm porcelain)\b/.test(text)) {
    return "fair";
  }
  if (/\b(light\s*\/\s*medium|medium\s*\/\s*tan)\b/.test(text)) {
    if (text.includes("light / medium") || text.includes("light/medium")) return "light";
    return "medium";
  }
  if (/\b(espresso|mahogany|mocha|cocoa|deep|dark|rich tan|extra dark|nw4[5-9]|nc4[6-9])\b/.test(text)) {
    return "deep";
  }
  if (/\b(tan|caramel|amber|tawny|spiced sand|warm honey)\b/.test(text)) return "tan";
  if (/\b(medium|honey|golden|sand|natural beige|warm beige|honeyed)\b/.test(text)) return "medium";
  if (/\b(light|cream|buff|bisque|beige|fawn|neutral beige)\b/.test(text)) return "light";
  const level = text.match(/\blevel\s*(\d)\b/);
  if (level) {
    const n = Number(level[1]);
    if (n <= 1) return "fair";
    if (n === 2) return "light";
    if (n === 3) return "medium";
    if (n === 4) return "tan";
    return "deep";
  }
  return null;
}

function undertoneOf(text: string): Undertone | null {
  if (/\b(cool|pink undertone|rosy|nw\b|cn\s*\d|c\d)\b/.test(text) || /\bnw\s*\d/.test(text)) return "cool";
  if (/\b(warm|golden|peach|yellow undertone|nc\b|wn\s*\d|w\d)\b/.test(text) || /\bnc\s*\d/.test(text)) return "warm";
  if (/\b(neutral|\bn\s*\d|beige undertone)\b/.test(text)) return "neutral";
  return null;
}

function colorOf(text: string): ColorFamily | null {
  if (/\b(ruby woo|chili|diva|red|cherry|scarlet|crimson|vixen|carnal|russian red)\b/.test(text)) return "red";
  if (/\b(berry|plum|wine|grape|mauve|magenta|fuchsia|wineberry|aubergine|eggplant)\b/.test(text)) return "berry";
  if (/\b(coral|peach|apricot|dreamsicle|tangerine|guava)\b/.test(text)) return "coral";
  if (/\b(gold|champagne|bronze|copper|honey|amber glow)\b/.test(text)) return "gold";
  if (/\b(velvet teddy|nude|naked|buff|beige|sand|khaki|taupe|teddy|cork|rice\s*paper|natural)\b/.test(text)) return "nude";
  if (/\b(pink|rose|petal|blush|rosewood|rosy|flushed)\b/.test(text)) return "pink";
  if (/\b(brown|espresso|cocoa|mocha|spice|earth|stone|dusk)\b/.test(text)) return "brown";
  return null;
}

export function shadeProfile(product: Product, variant?: ProductVariant): ShadeProfile {
  const text = hay(product, variant);
  return {
    role: classifyRole(product),
    depth: macDepth(text) ?? wordDepth(text),
    undertone: undertoneOf(text),
    color: colorOf(text),
  };
}

function depthDistance(a: SkinDepth | null, b: SkinDepth | null) {
  if (!a || !b) return 2;
  return Math.abs(DEPTH_ORDER.indexOf(a) - DEPTH_ORDER.indexOf(b));
}

function roleLabel(role: MakeupRole) {
  switch (role) {
    case "foundation":
      return "foundation";
    case "concealer":
      return "concealer";
    case "powder":
      return "powder";
    case "primer":
      return "primer";
    case "setting":
      return "setting spray";
    case "blush":
      return "blush";
    case "bronzer":
      return "bronzer";
    case "lipstick":
      return "lipstick";
    case "lipgloss":
      return "lip gloss";
    case "lipliner":
      return "lip liner";
    case "eyeshadow":
      return "eye shadow";
    case "eyeliner":
      return "eyeliner";
    case "mascara":
      return "mascara";
    case "brow":
      return "brow";
    case "brush":
      return "brush";
    case "fragrance":
      return "fragrance";
    case "skincare":
      return "skincare";
    case "hair":
      return "hair";
    default:
      return "piece";
  }
}

function reasonFor(target: ShadeProfile, pick: ShadeProfile, variantTitle: string) {
  const shade = variantTitle && variantTitle !== "Default" ? variantTitle : null;
  if (target.depth && pick.depth && depthDistance(target.depth, pick.depth) === 0) {
    return shade ? `${pick.depth} ${roleLabel(pick.role)} · ${shade}` : `Matched to your ${target.depth} shade`;
  }
  if (target.color && pick.color && (target.color === pick.color || COLOR_COMPANIONS[target.color].includes(pick.color))) {
    return shade ? `${roleLabel(pick.role)} in ${pick.color} · ${shade}` : `Pairs with your ${target.color} shade`;
  }
  return shade ? `${roleLabel(pick.role)} · ${shade}` : `To complete the look`;
}

function scoreVariant(target: ShadeProfile, product: Product, variant: ProductVariant, wantedRole: MakeupRole) {
  if (!variant.available || variant.inventoryQuantity <= 0) return -1;
  const pick = shadeProfile(product, variant);
  let score = 8;
  if (pick.role === wantedRole) score += 42;
  else score -= 20;

  const needsSkin = wantedRole === "foundation" || wantedRole === "concealer" || wantedRole === "powder" || wantedRole === "primer";
  const needsColor =
    wantedRole === "lipstick" ||
    wantedRole === "lipgloss" ||
    wantedRole === "lipliner" ||
    wantedRole === "blush" ||
    wantedRole === "eyeshadow" ||
    wantedRole === "bronzer";

  if (needsSkin && target.depth) {
    const d = depthDistance(target.depth, pick.depth);
    if (d === 0) score += 36;
    else if (d === 1) score += 16;
    else if (pick.depth) score -= 12;
  }
  if (needsSkin && target.undertone && pick.undertone) {
    score += target.undertone === pick.undertone ? 14 : -6;
  }
  if (needsColor && target.color) {
    if (pick.color === target.color) score += 32;
    else if (pick.color && COLOR_COMPANIONS[target.color].includes(pick.color)) score += 18;
    else if (pick.color) score += 4;
  }
  if (product.vendor && product.vendor !== "Sol Beautiful") score += 4;
  score += Math.min(12, Math.log10((product.sold || 0) + 1) * 4);
  return score;
}

function bestForRole(
  catalog: Product[],
  source: Product,
  target: ShadeProfile,
  wanted: MakeupRole,
  used: Set<string>,
): LookSuggestion | null {
  let best: LookSuggestion | null = null;
  for (const product of catalog) {
    if (product.id === source.id || used.has(product.id) || product.status !== "active") continue;
    if (classifyRole(product) !== wanted) continue;
    for (const variant of product.variants) {
      const score = scoreVariant(target, product, variant, wanted);
      if (score < 20) continue;
      if (!best || score > best.score) {
        const pick = shadeProfile(product, variant);
        best = {
          product,
          variant,
          role: wanted,
          reason: reasonFor(target, pick, variant.option1 ?? variant.title),
          score,
        };
      }
    }
  }
  return best;
}

function headlineFor(role: MakeupRole) {
  if (role === "lipstick" || role === "lipgloss" || role === "lipliner") return "Complete the look";
  if (role === "foundation" || role === "concealer" || role === "powder") return "Suggested together";
  if (role === "eyeshadow" || role === "blush") return "Complete the look";
  return "Suggested together";
}

function subtitleFor(product: Product, variant: ProductVariant, profile: ShadeProfile) {
  const shade = variant.option1 && variant.option1 !== "Default" ? variant.option1 : variant.title !== "Default" ? variant.title : null;
  if (profile.role === "lipstick" || profile.role === "lipgloss") {
    return shade
      ? `Eye and cheek shades chosen to sit next to ${shade}.`
      : "Blush and eye color picked to finish the lip.";
  }
  if (profile.depth) {
    return shade
      ? `Other ${profile.depth} shades to wear with ${shade}.`
      : `Matched to ${profile.depth} complexion shades.`;
  }
  if (profile.color) {
    return `Pieces in the same ${profile.color} family as ${product.vendor}.`;
  }
  return "Pieces that finish this ritual.";
}

export function completeTheLook(
  product: Product,
  variant: ProductVariant | undefined,
  catalog: Product[],
  limit = 2,
): CompleteLook | null {
  const v = variant ?? product.variants.find((x) => x.available) ?? product.variants[0];
  if (!v) return null;
  const target = shadeProfile(product, v);
  const wanted = COMPANIONS[target.role] ?? COMPANIONS.other;
  const used = new Set<string>([product.id]);
  const items: LookSuggestion[] = [];
  for (const role of wanted) {
    if (items.length >= limit) break;
    const pick = bestForRole(catalog, product, target, role, used);
    if (pick) {
      used.add(pick.product.id);
      items.push(pick);
    }
  }
  if (!items.length) return null;
  return {
    headline: headlineFor(target.role),
    subtitle: subtitleFor(product, v, target),
    items,
  };
}

export function lookFromQuery(query: string, catalog: Product[], limit = 3): CompleteLook | null {
  const q = query.trim();
  if (q.length < 3) return null;
  const fake: Product = {
    id: "query",
    handle: "query",
    title: q,
    bodyHtml: "",
    vendor: "",
    productType: "Makeup",
    category: "",
    tags: [],
    status: "active",
    publishedAt: "",
    options: [{ name: "Title", values: [q] }],
    variants: [
      {
        id: "q",
        title: q,
        sku: "",
        price: "0",
        inventoryQuantity: 1,
        inventoryPolicy: "deny",
        option1: q,
        weight: 0,
        weightUnit: "oz",
        available: true,
        taxable: true,
        requiresShipping: true,
      },
    ],
    images: [],
    collectionHandles: [],
    seoTitle: "",
    seoDescription: "",
    sold: 0,
    watchers: 0,
  };
  const profile = shadeProfile(fake, fake.variants[0]);
  const makeupQuery = profile.role !== "other" || profile.depth || profile.color;
  if (!makeupQuery) return null;
  const look = completeTheLook(fake, fake.variants[0], catalog, limit);
  if (!look) return null;
  const depthBit = profile.depth ? `${profile.depth} ` : "";
  const colorBit = profile.color ? `${profile.color} ` : "";
  return {
    ...look,
    headline: "Pair with",
    subtitle: `Shades and pieces that sit next to ${depthBit}${colorBit}${roleLabel(profile.role === "other" ? "foundation" : profile.role)}.`.replace(
      /\s+/g,
      " ",
    ),
  };
}

export function lookFromCart(
  lines: Array<{ product: Product; variant: ProductVariant }>,
  catalog: Product[],
  limit = 2,
): CompleteLook | null {
  const makeup = [...lines].reverse().find((l) => {
    const role = classifyRole(l.product);
    return role !== "other" && role !== "fragrance" && role !== "hair";
  });
  if (!makeup) return null;
  const look = completeTheLook(makeup.product, makeup.variant, catalog, limit);
  if (!look) return null;
  const inBag = new Set(lines.map((l) => l.product.id));
  const items = look.items.filter((i) => !inBag.has(i.product.id));
  if (!items.length) return null;
  return { ...look, items };
}
