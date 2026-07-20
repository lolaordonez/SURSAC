(function () {
  const productItems = [
    { label: "Saco malla", href: "products.html#launchpad-item-large-photo-1424" },
    { label: "Saco malla Plus", href: "products.html#launchpad-item-large-photo-1425" },
    { label: "Saco tejido", href: "products.html#launchpad-item-large-photo-1443" },
    { label: "Piola", href: "products.html#launchpad-item-large-photo-1436" }
  ];

  const productSignature = productItems.map((item) => item.label).join("|");
  const desktopMegaMenuQuery =
    ".main-navigation ul.menu-level-0 > li.menu-item--expanded";
  const desktopMediaQuery = window.matchMedia("(min-width: 64rem)");

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

  function getNormalizedText(node) {
    return (node.textContent || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function isAllProductsText(text) {
    return (
      text === "all products" ||
      text === "all productos" ||
      text.includes("all products") ||
      text.includes("all productos")
    );
  }

  function normalizeProductTrigger(link) {
    link.textContent = "Productos";
    link.setAttribute("href", "products.html");
  }

  function bindProductTriggerNavigation(link) {
    if (link.dataset.sursacProductTriggerBound === "true") return;

    link.addEventListener(
      "click",
      (event) => {
        if (event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.assign(link.href);
      },
      { capture: true }
    );

    link.dataset.sursacProductTriggerBound = "true";
  }

  function normalizeProductDropdown(menuItem) {
    const dropdown = menuItem.querySelector(":scope > .menu_link_content");
    if (!dropdown) return;

    dropdown
      .querySelectorAll(".menu-desktop-links, .menu-headline, [class*='desktop-links']")
      .forEach((node) => node.remove());

    dropdown.querySelectorAll("a, span, p, div").forEach((node) => {
      if (!isAllProductsText(getNormalizedText(node))) return;

      const removable =
        node.closest(".menu-desktop-links") ||
        node.closest(".menu-item") ||
        node.closest("p") ||
        node.closest("div") ||
        node;

      if (removable !== dropdown) {
        removable.remove();
      }
    });

    const subnav =
      dropdown.querySelector(":scope > .menu-subnav") ||
      dropdown.querySelector(".menu-subnav");

    if (!subnav) return;

    const currentLabels = Array.from(
      subnav.querySelectorAll(":scope > ul.menu-level-1 > li > a")
    )
      .map((anchor) => (anchor.textContent || "").trim())
      .join("|");
    const hasUnexpectedContent = Array.from(subnav.children).some(
      (child) => !child.matches("ul.menu-level-1")
    );

    if (currentLabels === productSignature && !hasUnexpectedContent) {
      subnav.dataset.sursacProductsNormalized = "true";
      return;
    }

    subnav.innerHTML = buildProductMenuMarkup();
    subnav.dataset.sursacProductsNormalized = "true";
  }

  function normalizeProductMenus(root) {
    root.querySelectorAll("a.complexflyout-products").forEach((link) => {
      normalizeProductTrigger(link);
      bindProductTriggerNavigation(link);
      const menuItem = link.closest("li.menu-item");
      if (menuItem) {
        normalizeProductDropdown(menuItem);
      }
    });
  }

  function isSustainabilityTrigger(link) {
    if (!link) return false;
    const href = (link.getAttribute("href") || "").trim().toLowerCase();
    const text = (link.textContent || "").trim().toLowerCase();

    return (
      href === "sustainability.html" ||
      href.startsWith("sustainability.html?") ||
      href.includes("/sustainability") ||
      href === "index.html#launchpad-item-homepage-photo-2395" ||
      text === "sostenibilidad" ||
      text === "sustainability"
    );
  }

  function normalizeSustainabilityTrigger(link) {
    link.textContent = "Sostenibilidad";
    link.setAttribute("href", "sustainability.html");
  }

  function isAboutTrigger(link) {
    if (!link) return false;
    const href = (link.getAttribute("href") || "").trim();
    return href === "about.html" || href.startsWith("about.html?");
  }

  function disableDirectLinkMegaMenus(root) {
    root.querySelectorAll(desktopMegaMenuQuery).forEach((menuItem) => {
      const trigger = menuItem.querySelector(":scope > a");
      const isAbout = isAboutTrigger(trigger);
      const isSustainability = isSustainabilityTrigger(trigger);
      if (!isAbout && !isSustainability) return;

      if (isSustainability) {
        normalizeSustainabilityTrigger(trigger);
      }

      closeMegaMenu(menuItem);
      menuItem.classList.remove(
        "menu-item--expanded",
        "menu-item--active-trail",
        "sursac-mega-open"
      );

      const dropdown = menuItem.querySelector(":scope > .menu_link_content");
      if (dropdown) {
        dropdown.remove();
      }

      menuItem.dataset.sursacMegaMenuBound = "direct-link-disabled";
    });
  }

  function normalizeSustainabilityMenus(root) {
    root
      .querySelectorAll(".main-navigation ul.menu-level-0 > li > a")
      .forEach((link) => {
        if (!isSustainabilityTrigger(link)) return;
        normalizeSustainabilityTrigger(link);
      });
  }

  function clearMegaMenuCloseTimer(menuItem) {
    if (!menuItem || !menuItem._sursacCloseTimer) return;
    window.clearTimeout(menuItem._sursacCloseTimer);
    menuItem._sursacCloseTimer = null;
  }

  function openMegaMenu(menuItem) {
    if (!desktopMediaQuery.matches || !menuItem) return;
    clearMegaMenuCloseTimer(menuItem);
    menuItem.classList.add("sursac-mega-open");
  }

  function closeMegaMenu(menuItem) {
    if (!menuItem) return;
    clearMegaMenuCloseTimer(menuItem);
    menuItem.classList.remove("sursac-mega-open");
  }

  function scheduleMegaMenuClose(menuItem) {
    if (!menuItem) return;
    clearMegaMenuCloseTimer(menuItem);
    menuItem._sursacCloseTimer = window.setTimeout(() => {
      menuItem.classList.remove("sursac-mega-open");
      menuItem._sursacCloseTimer = null;
    }, 160);
  }

  function bindDesktopMegaMenus(root) {
    root.querySelectorAll(desktopMegaMenuQuery).forEach((menuItem) => {
      if (menuItem.dataset.sursacMegaMenuBound === "true") return;

      const dropdown = menuItem.querySelector(":scope > .menu_link_content");
      if (!dropdown) return;

      const openHandler = () => openMegaMenu(menuItem);
      const closeHandler = () => scheduleMegaMenuClose(menuItem);

      menuItem.addEventListener("pointerenter", openHandler);
      menuItem.addEventListener("pointerleave", closeHandler);
      dropdown.addEventListener("pointerenter", openHandler);
      dropdown.addEventListener("pointerleave", closeHandler);

      menuItem.dataset.sursacMegaMenuBound = "true";
    });
  }

  let scheduled = false;

  function scheduleNormalization() {
    if (scheduled) return;
    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      disableDirectLinkMegaMenus(document);
      normalizeSustainabilityMenus(document);
      normalizeProductMenus(document);
      bindDesktopMegaMenus(document);
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

  desktopMediaQuery.addEventListener("change", (event) => {
    if (event.matches) return;

    document
      .querySelectorAll(".main-navigation ul.menu-level-0 > li.sursac-mega-open")
      .forEach((menuItem) => closeMegaMenu(menuItem));
  });

  const observer = new MutationObserver(scheduleNormalization);
  observer.observe(document.body, { childList: true, subtree: true });
})();
