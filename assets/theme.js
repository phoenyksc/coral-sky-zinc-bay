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
  swatches.forEach(function (btn) {
    btn.addEventListener("click", function () {
      swatches.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      if (idInput) idInput.value = btn.getAttribute("data-variant-id");
      const price = btn.getAttribute("data-price");
      const compare = btn.getAttribute("data-compare");
      const priceEl = document.querySelector("[data-product-price]");
      if (priceEl && price) priceEl.innerHTML = price + (compare ? '<span class="compare">' + compare + "</span>" : "");
      const avail = btn.getAttribute("data-available") === "true";
      const submit = form.querySelector("[type='submit']");
      if (submit) {
        submit.disabled = !avail;
        submit.textContent = avail ? "Add to bag" : "Sold out";
      }
    });
  });
})();
