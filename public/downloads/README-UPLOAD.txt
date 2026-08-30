SOL BEAUTIFUL — Shopify upload
================================

Two files. Use them separately.

1) sol-beautiful-theme.zip     ← Online Store → Themes → Add theme → Upload zip
2) sol-beautiful-products.csv  ← Products → Import  (Shopify 2026 product template)

Do not upload this README or the CSV as a theme.
Do not unzip the theme zip first. Shopify wants the .zip as-is.

Keep product_template.csv as the blank Shopify import layout for future
catalog rebuilds. Always fill that same column set.

--------------------------------
A. Theme (the storefront)
--------------------------------
1. Shopify admin → Online Store → Themes.
2. Add theme → Upload zip file.
3. Choose sol-beautiful-theme.zip.
4. Preview, then Publish when you are ready.

The theme is Sol Beautiful — the vault: zen header, cream pages, collection
tiles, Popular / Rare / Low inventory / Beauty Sets carousels, Our Story
collage, product pages with shade buttons, bag, search, and customer accounts.

--------------------------------
B. Catalog
--------------------------------
File: sol-beautiful-products.csv
  2,181 products  ·  8,402 variants  ·  SKU on every shade  ·  inventory tracked

1. Products → Import → Add file → sol-beautiful-products.csv.
2. First import: leave “Overwrite products with matching handles” unchecked.
3. Re-import / qty update: check overwrite.
4. Photos load from listing image URLs. A large import takes several minutes.

Two lipstick listings had more than 100 shades (Shopify’s limit). Extra shades
are on a second product titled “more shades.”

Then create automated collections:

  Fragrances     Product type is equal to Fragrance
  Makeup         Product type is equal to Makeup
  Skincare       Product type is equal to Skincare
  Hair           Product type is equal to Hair
  Bath & body    Product type is equal to Bath & Body
  Hard to find   Tag is equal to rare
  Beauty Sets    Title contains set
  Low inventory  Inventory stock is less than 6

Themes → Customize: assign those collections to the homepage carousels
and “What we love” tiles.

3Dsellers: match eBay Custom label to the CSV SKU column. Do not also
cross-list eBay → Shopify after this import (that duplicates products).

--------------------------------
C. Pages, menus, shipping
--------------------------------
Pages: about (template page.about), shipping, returns, authenticity,
payment, contact (template page.contact). Contact: info@solbeautiful.com

Main menu: Fragrances, Makeup, Skincare, Hard to find.
Footer: About, Create account, Shipping, Returns, Contact.

Shipping: standard $6.95, free over $75, express $14.95. USA only.
Discount FIRST10 = 10% off first purchase.
Payments: cards, Shop Pay, PayPal, Apple Pay / Google Pay.

Shopify CLI / GitHub is not required for the CSV import.
