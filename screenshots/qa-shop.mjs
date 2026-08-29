import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://127.0.0.1:8080";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
page.on("console", (m) => {
  if (m.type() === "error") console.log("CONSOLE", m.text());
});

async function shot(name, path) {
  await page.goto(base + path, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `/workspace/screenshots/${name}.png`, fullPage: false });
  const title = await page.title();
  const h1 = await page.locator("h1").first().textContent();
  console.log(name, title, "|", h1?.slice(0, 80));
}

await shot("qa-home", "/");
await shot("qa-collection", "/collections/makeup");
await shot("qa-fragrances", "/collections/fragrances");
await shot("qa-shipping", "/pages/shipping");
await shot("qa-payment", "/pages/payment");
await shot("qa-returns", "/pages/returns");
await shot("qa-about", "/pages/about");

// Open first product card
await page.goto(base + "/collections/bestsellers", { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(600);
const first = page.locator("article a").first();
await first.click();
await page.waitForTimeout(1000);
await page.screenshot({ path: "/workspace/screenshots/qa-pdp.png" });
const pdpH1 = await page.locator("h1").first().textContent();
console.log("pdp", pdpH1);

const add = page.getByRole("button", { name: /add to bag/i });
if (await add.count()) {
  await add.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "/workspace/screenshots/qa-cart.png" });
  console.log("added to bag");
}

await browser.close();
console.log("qa done");
