(function () {
  const productItems = [
    { label: "Saco malla", href: "products.html#launchpad-item-large-photo-1424" },
    { label: "Saco malla Plus", href: "products.html#launchpad-item-large-photo-1425" },
    { label: "Piola", href: "products.html#launchpad-item-large-photo-1436" },
    { label: "Saco tejido", href: "products.html#launchpad-item-large-photo-1443" }
  ];

  const productSignature = productItems.map((item) => item.label).join("|");

  function buildProductMenuMarkup() {
    return [
      '<ul class="menu menu-list menu-level-1">',
      ...productItems.map(
        (item) =>
          [
            '  <li class="menu-item">',
            `    <a href="${item.href}">${item.label}</a>`,
            "  </li>"
          ].join("\n")
      ),
      "</ul>"
    ].join("\n");
  }

  function normalizeAllProductsLinks(root) {
    root.querySelectorAll("a, span").forEach((node) => {
      const text = (node.textContent || "").trim().toLowerCase();
      if (text === "all products") {
        node.textContent = "Ver todos los productos";
        if (node.tagName === "A") {
          node.setAttribute("href", "products.html");
        }
      }
    });
  }

  function normalizeProductTrigger(link) {
    link.textContent = "Productos";
    link.setAttribute("href", "products.html");
  }

  function normalizeProductDropdown(menuItem) {
    const dropdown = menuItem.querySelector(":scope > .menu_link_content");
    if (!dropdown) return;

    const subnav =
      dropdown.querySelector(":scope > .menu-subnav") ||
      dropdown.querySelector(".menu-subnav");

    if (!subnav) return;

    const currentLabels = Array.from(
      subnav.querySelectorAll(":scope > ul.menu-level-1 > li > a")
    )
      .map((anchor) => (anchor.textContent || "").trim())
      .join("|");

    if (currentLabels === productSignature) {
      subnav.dataset.sursacProductsNormalized = "true";
      return;
    }

    subnav.innerHTML = buildProductMenuMarkup();
    subnav.dataset.sursacProductsNormalized = "true";
  }

  function normalizeProductMenus(root) {
    root.querySelectorAll("a.complexflyout-products").forEach((link) => {
      normalizeProductTrigger(link);
      const menuItem = link.closest("li.menu-item");
      if (menuItem) {
        normalizeProductDropdown(menuItem);
      }
    });

    normalizeAllProductsLinks(root);
  }

  let scheduled = false;

  function scheduleNormalization() {
    if (scheduled) return;
    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      normalizeProductMenus(document);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleNormalization, {
      once: true
    });
  } else {
    scheduleNormalization();
  }

  window.addEventListener("load", scheduleNormalization);

  const observer = new MutationObserver(scheduleNormalization);
  observer.observe(document.body, { childList: true, subtree: true });
})();
