SOL BEAUTIFUL — Shopify upload
================================

Two files. Use them separately.

1) sol-beautiful-theme.zip     ← Online Store → Themes → Add theme → Upload zip
2) sol-beautiful-products.csv  ← Products → Import  (Shopify 2026 product template)

Do not upload this README or the CSV as a theme.
Do not unzip the theme zip first. Shopify wants the .zip as-is.

Keep product_template.csv as the blank Shopify import layout for future
catalog rebuilds. Always fill that same column set.

The theme matches the Sol Beautiful preview: cream/ivory, Cormorant + Outfit,
zen header, “What we love” tiles (Fragrances, Makeup, Skincare, Hair,
Bath & body, Hard to find), Popular / Rare / Low inventory / Beauty Sets,
Our Story collage, product pages with shade buttons, bag with Share and Save.

--------------------------------
A. Theme (the storefront)
--------------------------------
1. Shopify admin → Online Store → Themes.
2. Add theme → Upload zip file.
3. Choose sol-beautiful-theme.zip.
4. Preview, then Publish when you are ready.

If a theme is already published from an older zip, upload this zip again
(or replace the GitHub shopify branch) so homepage tiles and nav match.

--------------------------------
B. Catalog, then collections
--------------------------------
File: sol-beautiful-products.csv
  2,181 products  ·  8,402 variants  ·  SKU on every shade  ·  inventory tracked

1. Products → Import → Add file → sol-beautiful-products.csv.
2. First import: leave “Overwrite products with matching handles” unchecked.
3. Re-import / qty update: check overwrite.
4. Photos load from listing image URLs. A large import takes several minutes.

Two lipstick listings had more than 100 shades (Shopify’s limit). Extra shades
are on a second product titled “more shades.”

Create automated collections with these EXACT handles (the theme is wired to them):

  Handle          Title            Rule
  fragrances      Fragrances       Product type is equal to Fragrance
  makeup          Makeup           Product type is equal to Makeup
  skincare        Skincare         Product type is equal to Skincare
  hair            Hair             Product type is equal to Hair
  bath-body       Bath & body      Product type is equal to Bath & Body
  rare-finds      Hard to find     Tag is equal to rare
  beauty-sets     Beauty Sets      Title contains set
  low-inventory   Low inventory    Inventory stock is less than 6
  all             Catalog          already exists

“What we love” tiles show even before collections exist (theme photos).
After these collections are created, the tiles and rails fill with products.

3Dsellers: match eBay Custom label to the CSV SKU column. Do not also
cross-list eBay → Shopify after this import (that duplicates products).

--------------------------------
C. Pages, discounts, shipping
--------------------------------
Pages: about (template page.about), shipping, returns, authenticity,
payment, contact (template page.contact). Contact: info@solbeautiful.com

Nav is already Fragrances, Makeup, Skincare, Hard to find in the theme.
Footer: About, Create account, Shipping, Returns, Contact.

Discounts (Discounts → Create):
  FIRST10   10% off first purchase
  SHARE10   10% off
  SHARE15   15% off, minimum $75
  SHARE20   20% off, minimum $125

Shipping: standard $6.95, free over $75, express $14.95. USA only.
Payments: cards, Shop Pay, PayPal, Apple Pay / Google Pay.

Shopify hosted checkout cannot use the preview’s custom checkout header.
Share and Save appears on the bag page; the codes above work at Shopify checkout.

Shopify CLI / GitHub is not required for the CSV import.
