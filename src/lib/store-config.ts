export const STORE = {
  name: "Sol Beautiful",
  shortName: "Sol Beautiful",
  tagline: "For the love of beauty and skin.",
  description:
    "A family-run California vault of designer fragrance, makeup, and skincare — forty years of care.",
  email: "info@solbeautiful.com",
  phone: "",
  origin: "Fountain Valley, California",
  shipsFrom: "USA",
  inventoryTool: "3DSeller",
  shippingTool: "Teapplix",
  currency: "USD" as const,
  freeShippingThreshold: 75,
  standardShipping: 6.95,
  expressShipping: 14.95,
  caTaxRate: 0.0775,
  announcement: "Free standard shipping on US orders $75+  ·  Authenticity guaranteed  ·  Ships from the USA",
};

export const PROMO_CODES: Record<
  string,
  { label: string; type: "percent" | "amount"; value: number; minSubtotal?: number }
> = {
  SOL15: { label: "15% off", type: "percent", value: 15 },
  WELCOME10: { label: "$10 off $50+", type: "amount", value: 10, minSubtotal: 50 },
  RARE20: { label: "20% off hard-to-find", type: "percent", value: 20 },
  FIRST10: { label: "10% off first purchase", type: "percent", value: 10 },
};
