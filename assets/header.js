(function () {
  const onBlurListMenu = (header) => {
    const listMenuItems = header.querySelectorAll(
      ".list-menu--inline > .list-menu-item"
    );

    const onBlurInnerElements = () => {
      listMenuItems.forEach((item) => {
        item.querySelectorAll("a, details, summary").forEach((el) => {
          el.blur();
        });
        item.blur();
      });
    };

    listMenuItems.forEach((listMenuItem) => {
      listMenuItem.addEventListener("mouseleave", onBlurInnerElements);
    });
  };

  const initHeaderOverlay = (header) => {
    const main = document.getElementById("MainContent");
    const sections = main.querySelectorAll(".shopify-section");
    const isBoxedMode = Boolean(header.querySelector(".header--boxed-mode"));
    const isOverlayMode = Boolean(
      header.querySelector(".header--overlay-mode")
    );
    const breadcrumbs = document.querySelector(
      ".base-breadcrumbs #breadcrumbs"
    );

    const removeColorScheme = (element) => {
      if (!element) return;
      let classNames = element.getAttribute("class");
      classNames = classNames.replace(/color-background-\d+/g, "");
      element.setAttribute("class", classNames);
    };

    if (sections.length > 0 && (isBoxedMode || isOverlayMode)) {
      const hasTargetSection = sections[0].classList.contains(
        "has-header-interaction"
      );
      const sectionTargetChild = sections[0].querySelector(
        "[data-header-interaction]"
      );
      const headerGroupSections = document.querySelectorAll(
        ".shopify-section-group-header-group"
      );

      if (hasTargetSection && sectionTargetChild) {
        if (headerGroupSections[headerGroupSections.length - 1] === header) {
          sections[0].classList.remove("not-margin");
          header.classList.remove("not-mode");
          if (isOverlayMode) header.classList.add("overlay-mode-enabled");
          if (breadcrumbs) {
            removeColorScheme(breadcrumbs);
            const colorScheme = sectionTargetChild.dataset.colorScheme;
            if (colorScheme) breadcrumbs.classList.add(`color-${colorScheme}`);
          }
        } else {
          sections[0].classList.add("not-margin");
          header.classList.add("not-mode");
          header.classList.remove("overlay-mode-enabled");
          if (breadcrumbs) removeColorScheme(breadcrumbs);
        }
      } else {
        header.classList.add("not-mode");
        header.classList.remove("overlay-mode-enabled");
        if (breadcrumbs) removeColorScheme(breadcrumbs);
      }
    } else {
      header.classList.add("not-mode");
      header.classList.remove("overlay-mode-enabled");
      if (breadcrumbs) removeColorScheme(breadcrumbs);
    }

    if (header.classList.contains("overlay-mode-enabled")) {
      const headerWrapper = header.querySelector(".header-wrapper");
      if (!headerWrapper) return;

      const triggeredItems = headerWrapper.querySelectorAll(
        '.list-menu--inline > .list-menu-item[data-show-on-hover="true"]'
      );

      let removeHoverTimeout = null;
      let removeAnimateTimeout = null;

      triggeredItems.forEach((triggeredItem) => {
        triggeredItem.addEventListener("mouseenter", () => {
          if (header.classList.contains("shopify-section-header-sticky")) {
            return;
          }
          clearTimeout(removeHoverTimeout);
          clearTimeout(removeAnimateTimeout);

          headerWrapper.classList.add("hover-triggered");
          headerWrapper.classList.add("animate-triggered");
        });

        triggeredItem.addEventListener("mouseleave", () => {
          removeHoverTimeout = setTimeout(() => {
            const isStillHovered = Array.from(triggeredItems).some((el) =>
              el.matches(":hover")
            );

            if (!isStillHovered) {
              headerWrapper.classList.remove("hover-triggered");

              removeAnimateTimeout = setTimeout(() => {
                headerWrapper.classList.remove("animate-triggered");
              }, 300);
            }
          }, 0);
        });
      });
    }
  };

  const initMegaSubmenu = (header) => {
    const megaSubmenuLinks = header.querySelectorAll(".list-menu--megasubmenu");
    if (!megaSubmenuLinks || !megaSubmenuLinks.length) return;

    megaSubmenuLinks.forEach((link) => {
      const tabs = link.querySelectorAll(".mega-submenu__tab");
      const submenus = link.querySelectorAll(".mega-submenu__submenu");

      const onToggle = (event) => {
        const tab = event.target;
        if (!tab || !tab.classList.contains("mega-submenu__tab")) return;
        const tabId = tab.dataset.tabId;
        tabs.forEach((tab) => {
          tab.classList.remove("active");
        });
        tab.classList.add("active");
        submenus.forEach((submenu) => {
          submenu.classList.remove("active");
          if (submenu.dataset.tabId === tabId) {
            submenu.classList.add("active");
          }
        });
      };

      tabs.forEach((tab) => {
        tab.addEventListener("click", onToggle);
        tab.addEventListener("mouseenter", onToggle);
      });
    });
  };

  const initMegaObserver = (header) => {
    const megaMenuLinks = header.querySelectorAll(
      ".list-menu--megamenu, .list-menu--megasubmenu"
    );
    if (!megaMenuLinks || !megaMenuLinks.length) return;

    const headerEl = header.querySelector(".header.header--has-menu");
    if (!headerEl) return;

    const calcMegaMenuPosition = () => {
      const headerRect = headerEl.getBoundingClientRect();

      megaMenuLinks.forEach((link) => {
        const megaMenuEl =
          link.querySelector(".header__mega-menu") ||
          link.querySelector(".header__mega-submenu");

        if (!megaMenuEl) return;

        const linkMenuRect = link.getBoundingClientRect();

        const extraHeight = Math.abs(linkMenuRect.bottom - headerRect.bottom);
        const extraHeightFix = Math.ceil(extraHeight * 100) / 100;
        const extraLeft = (linkMenuRect.left - 20).toFixed(2);
        const extraWidth = (linkMenuRect.width + 30).toFixed(2);
        megaMenuEl.style.setProperty("--extra-height", `${extraHeightFix}px`);
        megaMenuEl.style.setProperty("--extra-left", `${extraLeft}px`);
        megaMenuEl.style.setProperty("--extra-width", `${extraWidth}px`);

        let maxCollectionHeight = 0;
        megaMenuEl.querySelectorAll(".collection-card").forEach((el) => {
          const collectionHeight = el.scrollHeight + 24;
          maxCollectionHeight = Math.max(maxCollectionHeight, collectionHeight);
        });
        if (maxCollectionHeight > 264) {
          megaMenuEl.style.maxHeight = `${maxCollectionHeight}px`;
        }
      });
    };

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        calcMegaMenuPosition();
      });
    });

    observer.observe(header);
  };

  const initHeader = () => {
    const header = document.querySelector(".shopify-section-header");
    if (!header) return;

    onBlurListMenu(header);
    initHeaderOverlay(header);
    initMegaObserver(header);
    initMegaSubmenu(header);
  };

  initHeader();

  document.addEventListener("shopify:section:load", initHeader);
  document.addEventListener("shopify:section:unload", initHeader);
  document.addEventListener("shopify:section:reorder", initHeader);
})();

if (!customElements.get("burger-menu")) {
  customElements.define(
    "burger-menu",
    class BurgerMenu extends HTMLElement {
      constructor() {
        super();
        this.header = document.querySelector(".header-wrapper");
        this.burgerMenu = this.querySelector(".burger-menu");
        this.openButton = this.querySelector(".burger-menu__toggle");
        this.closeButton = this.querySelector(".modal-close-button");
        this.overlayEl = this.querySelector(".modal__overlay");

        this.open = this.onOpen.bind(this);
        this.close = this.onClose.bind(this);
        this.handleKeyDown = this.onHandleKeyDown.bind(this);
      }

      connectedCallback() {
        this.openButton?.addEventListener("click", this.open);
        this.closeButton?.addEventListener("click", this.close);
        this.overlayEl?.addEventListener("click", this.close);
        this.header?.addEventListener("keydown", this.handleKeyDown);
      }

      disconnectedCallback() {
        this.openButton?.removeEventListener("click", this.open);
        this.closeButton?.removeEventListener("click", this.close);
        this.overlayEl?.removeEventListener("click", this.close);
        this.header?.removeEventListener("keydown", this.handleKeyDown);
      }

      onOpen() {
        if (this.header) this.header.preventHide = true;
        this.setAttribute("open", true);
        this.burgerMenu.classList.add("modal--open");
        document.body.classList.add("overflow-hidden-desktop-menu");
        if (this.burgerMenu && this.closeButton) {
          trapFocus(this.burgerMenu, this.closeButton);
        }
      }

      onClose() {
        document.body.classList.remove("overflow-hidden-desktop-menu");
        document.body.classList.remove("overflow-hidden");
        this.removeAttribute("open");
        this.burgerMenu.classList.remove("modal--open");
        removeTrapFocus(this.openButton);
        this.querySelectorAll("menu-drawer").forEach((submenu) => {
          if (submenu && typeof submenu.closeMenuDrawer === "function") {
            submenu.closeMenuDrawer(this.openButton);
          }
        });
        if (this.header) this.header.preventHide = false;
      }

      onHandleKeyDown(event) {
        if (this.getAttribute("open")) {
          if (event.key === "Escape") {
            this.close();
          }
        }
      }
    }
  );
}

if (!customElements.get("header-search")) {
  customElements.define(
    "header-search",
    class HeaderSearch extends HTMLElement {
      constructor() {
        super();
        this.header = document.querySelector(".header-wrapper");
        this.searchLink = this.querySelector(".header__button--search");
        this.modalContainer = this.querySelector(".header__search-modal");
        this.closeButton =
          this.querySelector(".modal-close-button") ||
          this.querySelector(".mobile-submenu__back");
        this.overlayEl = this.querySelector(".modal__overlay");
        this.location = this.dataset.location;

        this.searchInput = this.querySelector(
          "#Search-In-Modal, #Search-In-Modal-Mobile"
        );

        this.open = this.onOpen.bind(this);
        this.close = this.onClose.bind(this);
        this.handleKeyDown = this.onHandleKeyDown.bind(this);
      }

      connectedCallback() {
        this.searchLink?.addEventListener("click", this.open);
        this.closeButton?.addEventListener("click", this.close);
        this.overlayEl?.addEventListener("click", this.close);
        this.header?.addEventListener("keydown", this.handleKeyDown);

        this.setTimeout = null;
      }

      disconnectedCallback() {
        this.searchLink?.removeEventListener("click", this.open);
        this.closeButton?.removeEventListener("click", this.close);
        this.overlayEl?.removeEventListener("click", this.close);
        this.header?.removeEventListener("keydown", this.handleKeyDown);
      }

      onOpen(event) {
        event.preventDefault();
        this.setTimeout && window.clearTimeout(this.setTimeout);
        if (this.header) this.header.preventHide = true;
        this.setAttribute("open", true);
        this.modalContainer.classList.add("modal--open");

        // transition duration in modal 300ms
        if (this.searchInput && navigator.userAgent.indexOf("iPhone") === -1) {
          this.setTimeout = setTimeout(() => {
            trapFocus(this.modalContainer, this.searchInput);
          }, 300);
        }

        if (this.location === "desktop-header") {
          document.body.classList.add("overflow-hidden-laptop");
        }
      }

      onClose() {
        this.setTimeout && window.clearTimeout(this.setTimeout);
        this.removeAttribute("open");
        this.modalContainer.classList.remove("modal--open");

        if (this.location === "desktop-header") {
          document.body.classList.remove("overflow-hidden-laptop");
        }

        removeTrapFocus(this.searchLink);

        if (this.header) this.header.preventHide = false;
        const parentMenu = this.closest("header-drawer");
        if (!parentMenu) removeTrapFocus(this.searchLink);
        if (parentMenu) {
          removeTrapFocus(parentMenu.closeBtn);
          const parentOpenScrollY = parentMenu.openScrollY || 0;
          window.scrollTo(0, parentOpenScrollY);
        }
      }

      onHandleKeyDown(event) {
        if (this.getAttribute("open")) {
          if (event.key === "Escape") {
            this.close();
          }
        }
      }
    }
  );
}
