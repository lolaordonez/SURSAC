(function () {
  const productItems = [
    { label: "Sacos Leno Original", href: "products.html#launchpad-item-large-photo-1424" },
    { label: "Sacos Leno Plus", href: "products.html#launchpad-item-large-photo-1425" },
    { label: "Sacos Tejidos", href: "products.html#launchpad-item-large-photo-sacos-tejidos" },
    { label: "Sacos Impresos", href: "products.html#launchpad-item-large-photo-1445" },
    { label: "Sacos Impresos con Asa", href: "products.html#launchpad-item-large-photo-sacos-impresos-con-asa" },
    { label: "Saco Transparente", href: "products.html#launchpad-item-large-photo-saco-transparente" },
    { label: "Telas De Polipropileno", href: "products.html#launchpad-item-large-photo-1443" },
    { label: "Piolas", href: "products.html#launchpad-item-large-photo-1436" }
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

  function bindDirectLinkNavigation(link, boundKey) {
    if (link.dataset[boundKey] === "true") return;

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

    link.dataset[boundKey] = "true";
  }

  function bindProductTriggerNavigation(link) {
    bindDirectLinkNavigation(link, "sursacProductTriggerBound");
  }

  function normalizeProductDropdown(menuItem) {
    const dropdown = menuItem.querySelector(":scope > .menu_link_content");
    if (!dropdown) return;

    menuItem.classList.add("sursac-product-menu-item");
    dropdown.classList.add("sursac-product-dropdown");

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

    subnav.classList.add("sursac-product-subnav");

    const currentLabels = Array.from(
      subnav.querySelectorAll(":scope > ul.menu-level-1 > li > a")
    )
      .map((anchor) => (anchor.textContent || "").trim())
      .join("|");
    const hasUnexpectedContent = Array.from(subnav.children).some(
      (child) => !child.matches("ul.menu-level-1")
    );

    if (currentLabels === productSignature && !hasUnexpectedContent) {
      const existingList = subnav.querySelector(":scope > ul.menu-level-1");
      if (existingList) {
        existingList.classList.add("sursac-product-menu-list");
      }
      subnav.dataset.sursacProductsNormalized = "true";
      return;
    }

    subnav.innerHTML = buildProductMenuMarkup();
    const normalizedList = subnav.querySelector(":scope > ul.menu-level-1");
    if (normalizedList) {
      normalizedList.classList.add("sursac-product-menu-list");
    }
    subnav.dataset.sursacProductsNormalized = "true";
  }

  function ensureMobileProductToggle(menuItem) {
    if (!menuItem) return;

    const dropdown = menuItem.querySelector(":scope > .menu_link_content");
    if (!dropdown) return;

    if (desktopMediaQuery.matches) {
      menuItem.querySelectorAll(":scope > .sursac-mobile-plus").forEach((button) => {
        button.remove();
      });
      dropdown.style.display = "";
      return;
    }

    menuItem.querySelectorAll(":scope > .plus").forEach((button) => button.remove());

    let toggle = menuItem.querySelector(":scope > .sursac-mobile-plus");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "sursac-mobile-plus";
      menuItem.insertBefore(toggle, dropdown);
    }

    const syncState = () => {
      const isOpen = menuItem.classList.contains("open");
      toggle.classList.toggle("plus-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        isOpen ? "Ocultar submenu de Productos" : "Mostrar submenu de Productos"
      );
      dropdown.style.display = isOpen ? "block" : "none";
    };

    if (toggle.dataset.sursacToggleBound !== "true") {
      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        menuItem.classList.toggle("open");
        syncState();
      });

      toggle.dataset.sursacToggleBound = "true";
    }

    syncState();
  }

  function normalizeProductMenus(root) {
    root.querySelectorAll("a.complexflyout-products").forEach((link) => {
      normalizeProductTrigger(link);
      bindProductTriggerNavigation(link);
      const menuItem = link.closest("li.menu-item");
      if (menuItem) {
        normalizeProductDropdown(menuItem);
        ensureMobileProductToggle(menuItem);
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

  function bindSustainabilityTriggerNavigation(link) {
    return link;
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

  function normalizeProductsPageHeader(root) {
    if (!root.body || !root.body.classList.contains("path-na--products")) return;

    const header = root.querySelector(".site-header");
    if (!header || header.dataset.sursacLocalHeader === "true") return;

    header.dataset.sursacLocalHeader = "true";
    header.innerHTML = [
      '<div class="wrap">',
      '  <h2 class="logo">',
      '    <a href="index.html" aria-label="SURSAC">',
      '      <img src="Image20250414170531.png" alt="SURSAC" class="site-logo-image" width="1600" height="1578" />',
      "    </a>",
      "  </h2>",
      '  <div class="site-navigation">',
      '    <div class="main-navigation">',
      '      <nav role="navigation" aria-labelledby="products-main-navigation-menu" id="products-main-navigation">',
      '        <h2 class="visually-hidden" id="products-main-navigation-menu">Main Navigation</h2>',
      '        <ul data-region="site_header" class="menu menu-list menu-level-0">',
      '          <li class="menu-item"><a href="products.html" aria-current="page">Productos</a></li>',
      '          <li class="menu-item"><a href="sustainability.html">Sostenibilidad</a></li>',
      '          <li class="menu-item"><a href="about.html">Acerca de nosotros</a></li>',
      '          <li class="menu-item"><a href="contact.html" class="sonoco-button" style="background:#8E1B22 !important; background-color:#8E1B22 !important; background-image:none !important; color:#F6F1E9 !important;">Contáctanos</a></li>',
      "        </ul>",
      "      </nav>",
      "    </div>",
      "  </div>",
      "</div>"
    ].join("");
  }

  function dedupeMobilePlusButtons(root) {
    root.querySelectorAll(".main-navigation li").forEach((menuItem) => {
      if (menuItem.classList.contains("sursac-product-menu-item")) {
        return;
      }

      const plusButtons = Array.from(menuItem.children).filter(
        (child) => child.matches && child.matches(".plus")
      );

      if (plusButtons.length < 2) return;

      plusButtons.slice(1).forEach((button) => button.remove());
    });
  }

  function syncMobileProductMenus(root) {
    root.querySelectorAll(".sursac-product-menu-item").forEach((menuItem) => {
      ensureMobileProductToggle(menuItem);
    });
  }

  function syncMobileMenuToggle(root) {
    const toggle = root.querySelector(".menu-toggle");
    if (!toggle) return;

    const label = toggle.querySelector("span");
    const isNavOpen = !!(root.body && root.body.classList.contains("nav-open"));

    if (label) {
      label.textContent = isNavOpen ? "" : "Menu";
    }

    toggle.setAttribute("aria-label", isNavOpen ? "Cerrar menu" : "Abrir menu");
    toggle.setAttribute("aria-expanded", isNavOpen ? "true" : "false");
  }

  const popupDismissKey = "sursacLeadPopupDismissed";
  let popupScheduled = false;
  let popupOpenBound = false;

  function isLeadPopupDismissed() {
    try {
      return window.sessionStorage.getItem(popupDismissKey) === "true";
    } catch (error) {
      return false;
    }
  }

  function setLeadPopupDismissed() {
    try {
      window.sessionStorage.setItem(popupDismissKey, "true");
    } catch (error) {
      // Ignore storage failures and still close the popup for this page view.
    }
  }

  function closeLeadPopup() {
    const popup = document.querySelector(".sursac-lead-popup");
    if (!popup) return;

    popup.classList.remove("is-visible");
    popup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sursac-popup-open");
    setLeadPopupDismissed();
  }

  function openLeadPopup() {
    const popup = document.querySelector(".sursac-lead-popup");
    if (!popup || isLeadPopupDismissed()) return;

    popup.classList.add("is-visible");
    popup.setAttribute("aria-hidden", "false");
    document.body.classList.add("sursac-popup-open");
  }

  function bindLeadPopupEvents(popup) {
    if (!popup || popupOpenBound) return;

    const closeButton = popup.querySelector(".sursac-lead-popup__close");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        closeLeadPopup();
      });
    }

    popup.addEventListener("click", (event) => {
      if (event.target === popup) {
        closeLeadPopup();
      }
    });

    popup.querySelectorAll(".sursac-lead-popup__action").forEach((link) => {
      link.addEventListener("click", () => {
        setLeadPopupDismissed();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeLeadPopup();
      }
    });

    popupOpenBound = true;
  }

  function ensureLeadPopup(root) {
    if (!root.body || root.body.dataset.sursacLeadPopupMounted === "true") return;

    const popup = document.createElement("div");
    popup.className = "sursac-lead-popup";
    popup.setAttribute("aria-hidden", "true");
    popup.innerHTML = [
      '<div class="sursac-lead-popup__dialog" role="dialog" aria-modal="true" aria-labelledby="sursac-lead-popup-title">',
      '  <button type="button" class="sursac-lead-popup__close" aria-label="Cerrar ventana de contacto">×</button>',
      '  <div class="sursac-lead-popup__media">',
      '    <img src="assets/banners/productos_banner.png?v=20260722-122200" alt="Sacos y mallas SURSAC" />',
      "  </div>",
      '  <div class="sursac-lead-popup__content">',
      '    <p class="sursac-lead-popup__eyebrow">Contacto directo</p>',
      '    <h2 id="sursac-lead-popup-title">¿Necesitas sacos?</h2>',
      '    <p class="sursac-lead-popup__copy">Cotiza directo con nuestro equipo.</p>',
      '    <div class="sursac-lead-popup__actions">',
      '      <a class="sursac-lead-popup__action" href="tel:+593996804001">',
      '        <span class="sursac-lead-popup__icon" aria-hidden="true">📞</span>',
      '        <span>099 680 4001</span>',
      "      </a>",
      '      <a class="sursac-lead-popup__action sursac-lead-popup__action--whatsapp" href="https://wa.me/593996804001" target="_blank" rel="noopener noreferrer">',
      '        <span class="sursac-lead-popup__icon" aria-hidden="true">💬</span>',
      '        <span>WhatsApp: 099 680 4001</span>',
      "      </a>",
      "    </div>",
      "  </div>",
      "</div>"
    ].join("\n");

    root.body.appendChild(popup);
    root.body.dataset.sursacLeadPopupMounted = "true";
    bindLeadPopupEvents(popup);

    if (isLeadPopupDismissed() || popupScheduled) return;

    popupScheduled = true;
    window.setTimeout(() => {
      popupScheduled = false;
      openLeadPopup();
    }, 1400);
  }

  let scheduled = false;

  function scheduleNormalization() {
    if (scheduled) return;
    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      normalizeProductsPageHeader(document);
      disableDirectLinkMegaMenus(document);
      normalizeSustainabilityMenus(document);
      normalizeProductMenus(document);
      dedupeMobilePlusButtons(document);
      syncMobileProductMenus(document);
      syncMobileMenuToggle(document);
      bindDesktopMegaMenus(document);
      ensureLeadPopup(document);
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

  const bodyClassObserver = new MutationObserver(() => {
    syncMobileProductMenus(document);
    syncMobileMenuToggle(document);
  });

  bodyClassObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });
})();
