export type InventoryPolicy = "deny" | "continue";

export interface ProductImage {
  id: string;
  src: string;
  alt: string;
  position: number;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  barcode?: string;
  price: string;
  compareAtPrice?: string;
  inventoryQuantity: number;
  inventoryPolicy: InventoryPolicy;
  option1?: string;
  option2?: string;
  option3?: string;
  weight: number;
  weightUnit: "oz" | "lb";
  available: boolean;
  imageId?: string;
  taxable: boolean;
  requiresShipping: boolean;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  bodyHtml: string;
  vendor: string;
  productType: string;
  category?: string;
  tags: string[];
  status: "active" | "draft" | "ended";
  publishedAt: string;
  options: ProductOption[];
  variants: ProductVariant[];
  images: ProductImage[];
  collectionHandles: string[];
  seoTitle: string;
  seoDescription: string;
  featured?: boolean;
  notes?: string[];
  sold: number;
  watchers: number;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: string;
  productHandles?: string[];
  rule?: "all" | "sale" | "featured" | "type" | "tag" | "price-max" | "popular" | "low" | "rare" | "sets";
  ruleValue?: string;
}

export interface Review {
  id: string;
  productHandle: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
}

export interface CartLine {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
}

export interface ShippingAddress {
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  number: string;
  createdAt: string;
  email: string;
  lines: Array<{
    title: string;
    variantTitle: string;
    sku: string;
    quantity: number;
    price: string;
    image: string;
  }>;
  subtotal: number;
  discount: number;
  discountCode?: string;
  shipping: number;
  shippingMethod: string;
  tax: number;
  total: number;
  address: ShippingAddress;
  status: "confirmed";
  referredBy?: string;
  tracking?: string;
  shipStatus?: string;
}

export type SortKey =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "title-asc"
  | "newest"
  | "best-selling";
