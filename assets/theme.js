(function () {
  const menuBtn = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-nav]");
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      const open = menu.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  const form = document.querySelector("[data-product-form]");
  if (!form) return;
  const idInput = form.querySelector("[name='id']");
  const swatches = form.querySelectorAll("[data-variant-id]");
  function applySwatch(btn) {
    swatches.forEach(function (b) {
      b.classList.remove("is-active");
    });
    btn.classList.add("is-active");
    if (idInput) idInput.value = btn.getAttribute("data-variant-id");
    const price = btn.getAttribute("data-price");
    const compare = btn.getAttribute("data-compare");
    const priceEl = document.querySelector("[data-product-price]");
    if (priceEl && price) {
      priceEl.innerHTML =
        price + (compare ? '<span class="compare">' + compare + "</span>" : "");
    }
    const avail = btn.getAttribute("data-available") === "true";
    const submit = form.querySelector("[type='submit']");
    if (submit) {
      submit.disabled = !avail;
      // Variant-level ATC only — never a page-level sold-out when other shades exist
      submit.textContent = avail ? "Add to bag" : "Sold out";
    }
  }
  swatches.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      // Sold-out stay visible/greyed; unclickable — never select OOS (Dru 2026-09-22)
      var unavailable =
        btn.disabled ||
        btn.getAttribute("aria-disabled") === "true" ||
        btn.classList.contains("is-soldout") ||
        btn.getAttribute("data-available") === "false";
      if (unavailable) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      applySwatch(btn);
    });
  });
  let active = form.querySelector(".swatch.is-active[data-available='true'],[data-variant-id].is-active[data-available='true']");
  if (!active) {
    active = form.querySelector("[data-variant-id][data-available='true']");
    if (active) applySwatch(active);
  } else {
    applySwatch(active);
  }
})();

(function () {
  // Dru 2026-09-22: digits in product titles use sans (.num); letters stay Cormorant
  function wrapProductTitleDigits(root) {
    var nodes = (root || document).querySelectorAll(
      ".pdp h1, h1.product__title, .product__title h1, .product__title"
    );
    nodes.forEach(function (el) {
      if (el.querySelector(".num")) return;
      var text = el.textContent;
      if (!text || !/\d/.test(text)) return;
      el.innerHTML = text.replace(/(\d+)/g, '<span class="num">$1</span>');
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      wrapProductTitleDigits(document);
    });
  } else {
    wrapProductTitleDigits(document);
  }
})();
