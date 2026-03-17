class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener("click", (event) => {
      event.preventDefault();
      const cartItems =
        this.closest("cart-items") ||
        this.closest("cart-drawer-items") ||
        this.closest("cart-notification-item");
      cartItems.updateQuantity(this.dataset.index, 0);
    });
  }
}

if (!customElements.get("cart-remove-button")) {
  customElements.define("cart-remove-button", CartRemoveButton);
}

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement =
      document.getElementById("shopping-cart-line-item-status") ||
      document.getElementById("CartDrawer-LineItemStatus") ||
      document.getElementById("CartNotification-LineItemStatus");

    if (document.querySelector(".cart-shipping")) {
      this.initCartShipping();
    }

    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);

    this.addEventListener("change", debouncedOnChange.bind(this));
  }

  cartUpdateUnsubscriber = undefined;

  initCartShipping() {
    document.querySelectorAll(".cart-shipping").forEach((el) => {
      const progressEl = el.querySelector(".cart-shipping__progress-current");
      if (!progressEl) return;
      let progressPrev =
        getComputedStyle(progressEl)?.getPropertyValue("width");
      document.documentElement.style.setProperty(
        "--shipping-progress-prev",
        progressPrev
      );

      const total = el.dataset.total;
      const minSpend = el.dataset.minSpend;
      const messageTemplate = el.dataset.message;

      const minTotal = Math.round(minSpend * (Shopify.currency.rate || 1));
      let progress = (total / minTotal) * 100;
      if (progress > 100) progress = 100;

      const msgDefault = el.querySelector(".cart-shipping__message_default");
      const msgSuccess = el.querySelector(".cart-shipping__message_success");

      if (minTotal > total) {
        let amount = minTotal - total;
        // formatMoney - func in global.js
        let message = messageTemplate.replace("[amount]", formatMoney(amount));
        if (msgDefault) {
          msgDefault.innerHTML = message;
          msgDefault.classList.add("active");
        }
        if (msgSuccess) msgSuccess.classList.remove("active");
      } else {
        if (msgDefault) msgDefault.classList.remove("active");
        if (msgSuccess) msgSuccess.classList.add("active");
      }

      progressEl.style.width = progress + "%";
    });
  }

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(
      PUB_SUB_EVENTS.cartUpdate,
      (event) => {
        if (event.source === "cart-items") {
          return;
        }
        this.onCartUpdate();
      }
    );
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  onChange(event) {
    this.updateQuantity(
      event.target.dataset.index,
      event.target.value,
      document.activeElement.getAttribute("name")
    );
  }

  onCartUpdate() {
    fetch(`${routes.cart_url}?section_id=main-cart-items`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, "text/html");
        const sourceQty = html.querySelector("cart-items");
        this.innerHTML = sourceQty.innerHTML;
      })
      .catch((error) => {
        console.error("Fetch operation failed:", error);
      });
  }

  getSectionsToRender() {
    return [
      {
        id: "main-cart-items",
        section: document.getElementById("main-cart-items").dataset.id,
        selector: ".js-contents",
      },
      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
        selector: ".shopify-section",
      },
      {
        id: "cart-live-region-text",
        section: "cart-live-region-text",
        selector: ".shopify-section",
      },
      {
        id: "main-cart-footer",
        section: document.getElementById("main-cart-footer").dataset.id,
        selector: ".js-contents-totals",
      },
      {
        id: "main-cart-wrapper",
        section: document.getElementById("main-cart-wrapper").dataset.id,
        selector: ".js-contents-title",
      },
      {
        id: "main-cart-wrapper",
        section: document.getElementById("main-cart-wrapper").dataset.id,
        selector: ".js-contents-empty",
      },
      {
        id: "main-cart-shipping",
        section:
          document.getElementById("main-cart-shipping")?.dataset.id || null,
        selector: ".js-contents-shipping",
      },
    ];
  }

  updateQuantity(line, quantity, name) {
    this.enableLoading(line);
    this.updateFreeShippingProgress();

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender()
        .filter((section) => section.section)
        .map((section) => section.section),
      sections_url: window.location.pathname,
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        const quantityElement = this.closest("cart-notification")
          ? document.getElementById(`Quantity-Notification-${line}`)
          : document.getElementById(`Quantity-${line}`);

        if (parsedState.errors) {
          quantityElement.value = quantityElement.getAttribute("value");
          this.updateLiveRegions(line, parsedState.errors);
          return;
        }

        const isEmpty = parsedState.item_count === 0;
        this.classList.toggle("is-empty", isEmpty);
        const cartDrawer = document.querySelector("cart-drawer");
        const cartPageWrapper = document.querySelector(".main-cart");

        if (cartPageWrapper) {
          cartPageWrapper.classList.toggle("is-empty", isEmpty);
        }

        if (cartDrawer) {
          cartDrawer.classList.toggle("is-empty", isEmpty);
          const drawerItems = cartDrawer?.querySelector("cart-drawer-items");
          setHasScrollClass(drawerItems);
        }

        const msg = this.getMsgAfterFetch(parsedState, line, quantityElement);

        this.updateElementsAfterFetch(parsedState, quantity);
        this.updateLiveRegions(line, msg);
        this.setFocusOnElement(line, name, parsedState, quantity);
        publish(PUB_SUB_EVENTS.cartUpdate, { source: "cart-items" });

        if (this.closest("cart-notification") && quantity == 0) {
          this.closest("cart-notification").close();
        }
      })
      .catch((error) => {
        this.catchErrors();
        console.error("Fetch operation failed:", error);
      })
      .finally(() => {
        if (document.querySelector(".cart-shipping")) {
          this.initCartShipping();
        }
        this.disableLoading(line);
      });
  }

  updateElementsAfterFetch(parsedState) {
    this.getSectionsToRender()
      .filter((section) => section.section)
      .forEach((section) => {
        const elementToReplace =
          document
            .getElementById(section.id)
            ?.querySelector(section.selector) ||
          document.getElementById(section.id);
        if (elementToReplace) {
          elementToReplace.innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.section],
            section.selector
          );
        }
      });
  }

  updateFreeShippingProgress() {
    const progressEl = document.querySelector(
      ".cart-shipping__progress-current"
    );
    if (progressEl) {
      const progressPrev =
        getComputedStyle(progressEl).getPropertyValue("width");
      document.documentElement.style.setProperty(
        "--shipping-progress-prev",
        progressPrev
      );
    }
  }

  getMsgAfterFetch(parsedState, line, quantityElement) {
    let message = "";
    const itemsBefore = this.querySelectorAll(".cart-item");

    const updatedValue = parsedState.items[line - 1]
      ? parsedState.items[line - 1].quantity
      : undefined;

    if (
      itemsBefore.length === parsedState.items.length &&
      updatedValue !== parseInt(quantityElement.value)
    ) {
      if (typeof updatedValue === "undefined") {
        message = window.cartStrings.error;
      } else {
        message = window.cartStrings.quantityError.replace(
          "[quantity]",
          updatedValue
        );
      }
    }
    return message;
  }

  updateLiveRegions(line, message) {
    const lineItemError = document.getElementById(`Line-item-error-${line}`);
    if (lineItemError) {
      lineItemError.querySelector(".cart-item__error-text").innerHTML = message;
    }

    this.lineItemStatusElement.setAttribute("aria-hidden", true);

    const cartStatus =
      document.getElementById("cart-live-region-text") ||
      document.getElementById("CartDrawer-LiveRegionText");

    if (cartStatus) {
      cartStatus.setAttribute("aria-hidden", false);

      setTimeout(() => {
        cartStatus.setAttribute("aria-hidden", true);
      }, 1000);
    }
  }

  setFocusOnElement(line, name, parsedState) {
    const cartWrapper =
      document.querySelector("cart-drawer") ||
      document.querySelector(".main-cart");

    const lineItem =
      document.getElementById(`CartItem-${line}`) ||
      document.getElementById(`CartDrawer-Item-${line}`);
    const btnWithName = lineItem?.querySelector(`[name="${name}"]`);

    if (lineItem && btnWithName) {
      trapFocus(cartWrapper, btnWithName);
    } else if (parsedState.item_count === 0 && cartWrapper) {
      const emptyWrapper =
        cartWrapper.querySelector(".cart-drawer__empty") ||
        cartWrapper.querySelector(".main-cart__empty");
      trapFocus(emptyWrapper, emptyWrapper.querySelector("a"));
    } else if (document.querySelector(".cart-item") && cartWrapper) {
      trapFocus(cartWrapper, document.querySelector(".cart-item__name"));
    }
  }

  catchErrors() {
    const errors =
      document.getElementById("cart-errors") ||
      document.getElementById("CartDrawer-CartErrors");
    if (errors) errors.textContent = window.cartStrings.error;
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const cartLine =
      this.querySelector(`#CartItem-${line}`) ||
      this.querySelector(`#CartDrawer-Item-${line}`) ||
      this.querySelector(`#cart-notification-item .cart-item`);
    if (cartLine) {
      cartLine.classList.add("disabled");
      const loadingElement = cartLine.querySelector(".loading-overlay");
      if (loadingElement) loadingElement.classList.remove("hidden");
    }

    const totalsSubtotal = document.querySelector(".totals__subtotal-value");
    if (totalsSubtotal) {
      totalsSubtotal.classList.add("loading");
      const loadingEl = totalsSubtotal.querySelector(".loading-overlay");
      loadingEl.classList.remove("hidden");
    }

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute("aria-hidden", false);
  }

  disableLoading(line) {
    const cartLine =
      this.querySelector(`#CartItem-${line}`) ||
      this.querySelector(`#CartDrawer-Item-${line}`) ||
      this.querySelector(`#cart-notification-item .cart-item`);
    if (cartLine) {
      cartLine.classList.remove("disabled");
      const loadingElement = cartLine.querySelector(".loading-overlay");
      if (loadingElement) loadingElement.classList.add("hidden");
    }

    const totalsSubtotal = document.querySelector(".totals__subtotal-value");
    if (totalsSubtotal) {
      totalsSubtotal.classList.remove("loading");
      const loadingEl = totalsSubtotal.querySelector(".loading-overlay");
      loadingEl.classList.add("hidden");
    }
  }
}

if (!customElements.get("cart-items")) {
  customElements.define("cart-items", CartItems);
}

class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.header = document.querySelector(".header-wrapper");
    if (this.header) this.header.preventHide = false;

    this.setHeaderCartIconAccessibility();
    this.addEventListener("keyup", (event) => {
      event.code === "Escape" && this.close();
    });
  }

  setHeaderCartIconAccessibility() {
    const cartLink = document.querySelector("#cart-icon-bubble");
    if (!cartLink) return;
    cartLink.setAttribute("role", "button");
    cartLink.setAttribute("aria-haspopup", "dialog");
    cartLink.addEventListener("click", (event) => {
      event.preventDefault();
      if (!this.classList.contains("modal--open")) {
        this.open(cartLink);
      } else {
        this.close();
      }
    });
  }

  open(triggeredBy) {
    if (this.header) this.header.preventHide = true;
    if (triggeredBy) this.setActiveElement(triggeredBy);

    const search = document.querySelector("header-search.header-search");
    if (search && typeof search.close() === "function") search.close();

    const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
    if (cartDrawerNote && !cartDrawerNote.hasAttribute("role")) {
      this.setSummaryAccessibility(cartDrawerNote);
    }

    const drawerItems = this.querySelector("cart-drawer-items");
    setHasScrollClass(drawerItems);

    this.setAttribute("open", true);
    this.classList.add("modal--open");

    this.addEventListener(
      "transitionend",
      () => {
        const containerTrapFocus = document.getElementById("CartDrawer");
        const focusElement = this.querySelector(".cart-drawer__inner");
        trapFocus(containerTrapFocus, focusElement);
      },
      { once: true }
    );

    document.body.classList.add("overflow-hidden-drawer");
  }

  close() {
    this.removeAttribute("open");
    this.classList.remove("modal--open");

    if (this.activeElement) {
      let activeElement = this.activeElement;
      const productCard = this.activeElement.closest("product-card");
      const productCardLink = productCard?.querySelector(
        ".product-card__link-overlay"
      );
      if (productCardLink) activeElement = productCardLink;

      removeTrapFocus(activeElement);
    }

    document.body.classList.remove("overflow-hidden-drawer");

    if (this.header) this.header.preventHide = false;
  }

  setSummaryAccessibility(cartDrawerNote) {
    if (cartDrawerNote.tagName !== "SUMMARY") return;
    cartDrawerNote.setAttribute("role", "button");
    cartDrawerNote.setAttribute("aria-expanded", "false");

    cartDrawerNote.addEventListener("click", (event) => {
      const isOpen = cartDrawerNote.parentElement.hasAttribute("open");
      cartDrawerNote.setAttribute("aria-expanded", !isOpen);
    });
  }

  renderContents(parsedState) {
    if (this.classList.contains("is-empty")) {
      this.classList.remove("is-empty");
    }
    this.productId = parsedState.id;
    this.getSectionsToRender().forEach((section) => {
      const sectionElement = section.selector
        ? document.querySelector(section.selector)
        : document.getElementById(section.id);
      sectionElement.innerHTML = this.getSectionInnerHTML(
        parsedState.sections[section.id],
        section.selector
      );
    });

    const drawerItems = this.querySelector("cart-drawer-items");
    setHasScrollClass(drawerItems);

    setTimeout(() => {
      this.open();
    });
  }

  getSectionInnerHTML(html, selector = ".shopify-section") {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
  }

  getSectionsToRender() {
    return [
      {
        id: "cart-drawer",
        selector: "#CartDrawer",
      },
      {
        id: "cart-icon-bubble",
      },
    ];
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

if (!customElements.get("cart-drawer")) {
  customElements.define("cart-drawer", CartDrawer);
}

class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    return [
      {
        id: "CartDrawer",
        section: "cart-drawer",
        selector: ".cart-drawer__inner",
      },
      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
        selector: ".shopify-section",
      },
    ];
  }
}

if (!customElements.get("cart-drawer-items")) {
  customElements.define("cart-drawer-items", CartDrawerItems);
}

class CartNote extends HTMLElement {
  constructor() {
    super();
    this.spinnerIcon = this.querySelector(".cart__note-loading");
    this.successIcon = this.querySelector(".cart__note-success");
    this.textarea = this.querySelector("textarea");
    this.cartButtons = document.querySelector(".cart__ctas");
    this.drawerButtons = document.querySelector(".cart-drawer__buttons");

    this.textarea.addEventListener(
      "input",
      debounce((event) => {
        if (this.spinnerIcon) this.spinnerIcon.style.display = "flex";
        if (this.successIcon) this.successIcon.style.display = "none";
        if (this.cartButtons) this.cartButtons.style.pointerEvents = "none";
        if (this.cartButtons) this.cartButtons.style.opacity = "0.7";
        if (this.drawerButtons) this.drawerButtons.style.pointerEvents = "none";
        if (this.drawerButtons) this.drawerButtons.style.opacity = "0.7";

        const body = JSON.stringify({ note: event.target.value });

        fetch(`${routes.cart_update_url}`, {
          ...fetchConfig(),
          ...{ body },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            if (this.successIcon) this.successIcon.style.display = "flex";
            setTimeout(() => {
              if (this.successIcon) this.successIcon.style.display = "none";
            }, 2000);
          })
          .catch((error) => {
            console.error("Something went wrong. ", error);
          })
          .finally(() => {
            if (this.spinnerIcon) this.spinnerIcon.style.display = "none";
            if (this.cartButtons) this.cartButtons.removeAttribute("style");
            if (this.drawerButtons) this.drawerButtons.removeAttribute("style");
          });
      }, ON_CHANGE_DEBOUNCE_TIMER)
    );
  }
}

if (!customElements.get("cart-note")) {
  customElements.define("cart-note", CartNote);
}

class CartNotification extends HTMLElement {
  constructor() {
    super();

    this.header = document.querySelector(".header-wrapper");
    if (this.header) this.header.preventHide = false;

    this.itemEl = this.querySelector("#cart-notification-item");
    this.recommWrapper = this.querySelector(".cart-notification__recommend");
    this.productRecommList = null;
    this.cartItemKey = "";
    this.cartItemLine = "";
    this.productId = "";

    this.addEventListener("keyup", (event) => {
      event.code === "Escape" && this.close();
    });
  }

  open(triggeredBy) {
    if (this.header) this.header.preventHide = true;
    if (triggeredBy) this.setActiveElement(triggeredBy);

    const search = document.querySelector("header-search.header-search");
    if (search && typeof search.close() === "function") search.close();

    this.setAttribute("open", true);
    this.classList.add("modal--open");

    this.addEventListener(
      "transitionend",
      () => {
        const focusElement = this.querySelector(".cart-drawer__inner");
        trapFocus(this, focusElement);
      },
      { once: true }
    );

    document.body.classList.add("overflow-hidden-drawer");
  }

  close() {
    this.removeAttribute("open");
    this.classList.remove("modal--open");

    if (this.activeElement) {
      let activeElement = this.activeElement;
      const productCard = this.activeElement.closest("product-card");
      const productCardLink = productCard?.querySelector(
        ".product-card__link-overlay"
      );
      if (productCardLink) activeElement = productCardLink;

      removeTrapFocus(activeElement);
    }

    document.body.classList.remove("overflow-hidden-drawer");

    if (this.header) this.header.preventHide = false;
    if (this.itemEl) this.itemEl.innerHTML = "";
    if (this.recommWrapper) this.recommWrapper.removeAttribute("style");
    if (this.productRecommList) {
      this.productRecommList.remove();
      this.productRecommList = null;
    }
    this.cartItemKey = "";
    this.cartItemLine = "";
    this.productId = "";
    this.isSuccess = false;
  }

  renderContents(parsedState) {
    this.isSuccess = false;
    this.cartItemKey = parsedState.key;
    this.productId = parsedState.product_id;

    this.getSectionsToRender().forEach((section) => {
      if (section.id === "cart-notification-items") {
        const addedItemSource = this.getParsedElement(
          parsedState.sections[section.id],
          section.selector
        );

        if (addedItemSource && this.itemEl) {
          this.cartItemLine = addedItemSource.dataset.index;
          this.itemEl.innerHTML = "";
          this.itemEl.append(addedItemSource);
          this.isSuccess = true;
        }
        return;
      }

      const sectionElement = section.selector
        ? document.querySelector(section.selector)
        : document.getElementById(section.id);

      if (!sectionElement) return;
      sectionElement.innerHTML = this.getSectionInnerHTML(
        parsedState.sections[section.id],
        section.selector
      );
    });

    this.getProductRecommedations();

    setTimeout(() => {
      if (this.isSuccess) {
        this.open();
      } else if (document.querySelector("cart-drawer")) {
        document.querySelector("cart-drawer").open(this.activeElement);
      } else {
        window.location = window.routes.cart_url;
      }
    });
  }

  getParsedElement(html, selector) {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector);
  }

  getSectionInnerHTML(html, selector = ".shopify-section") {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
  }

  getSectionsToRender() {
    return [
      {
        id: "cart-notification-items",
        selector: `[id="CartNotification-Item-${this.cartItemKey}"]`,
      },
      {
        id: "cart-notification",
        selector: "#CartNotification-Shipping",
      },
      {
        id: "cart-icon-bubble",
      },
      {
        id: "cart-drawer",
        selector: "#CartDrawer",
      },
    ];
  }

  getProductRecommedations() {
    if (this.isSuccess && this.productId && this.recommWrapper) {
      const baseUrl = this.recommWrapper.dataset.baseUrl;
      const newUrl = baseUrl.replace("[product_id]", this.productId);
      const loadingEl = this.recommWrapper.querySelector(
        ".cart-notification__recommend-loading"
      );
      if (loadingEl) {
        loadingEl.style.display = "flex";
      }
      fetch(newUrl)
        .then((response) => response.text())
        .then((text) => {
          const html = document.createElement("div");
          html.innerHTML = text;
          this.productRecommList = html.querySelector(
            ".cart-notification__recommend-list"
          );
          if (!this.productRecommList) {
            this.recommWrapper.style.display = "none";
            return;
          }
          this.recommWrapper.appendChild(this.productRecommList);
          const focusElement = this.querySelector(".cart-drawer__inner");
          trapFocus(this, focusElement);
        })
        .catch((error) => {
          console.error("Failed to load recommended products:", error);
        })
        .finally(() => {
          if (loadingEl) {
            loadingEl.style.display = "none";
          }
        });
    }
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

if (!customElements.get("cart-notification")) {
  customElements.define("cart-notification", CartNotification);
}

class CartNotificationItem extends CartItems {
  connectedCallback() {
    this.cartUpdateUnsubscriber = undefined;
  }

  getSectionsToRender(cartItemLine) {
    return [
      {
        id: "cart-notification-items",
        section: "cart-notification-items",
        selector: `[id^="CartNotification-Item-"][data-index="${cartItemLine}"]`,
      },
      {
        id: "CartNotification",
        section: "cart-notification",
        selector: "#CartNotification-Shipping",
      },
      {
        id: "CartDrawer",
        section: "cart-drawer",
        selector: ".cart-drawer__inner",
      },
      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
        selector: ".shopify-section",
      },
    ];
  }

  updateElementsAfterFetch(parsedState, quantity) {
    const cartNotification = this.closest("cart-notification");
    const cartItemLine = cartNotification?.cartItemLine;
    const cartItem = this.closest("cart-notification")?.itemEl;

    this.getSectionsToRender(cartItemLine).forEach((section) => {
      if (section.id === "cart-notification-items") {
        if (quantity == 0 && cartItem) {
          cartItem.innerHTML = "";
          return;
        }

        const itemSource = this.getParsedElement(
          parsedState.sections[section.id],
          section.selector
        );

        if (itemSource && cartItem) {
          cartItem.innerHTML = "";
          cartItem.append(itemSource);
        }
        return;
      }

      const elementToReplace =
        document.getElementById(section.id)?.querySelector(section.selector) ||
        document.getElementById(section.id);
      if (elementToReplace) {
        elementToReplace.innerHTML = this.getSectionInnerHTML(
          parsedState.sections[section.section],
          section.selector
        );
      }
    });
  }

  getParsedElement(html, selector) {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector);
  }

  updateLiveRegions(line, message) {
    const lineItemError = document.getElementById(
      `Line-item-error-Notification-${line}`
    );
    if (lineItemError) {
      lineItemError.querySelector(".cart-item__error-text").innerHTML = message;
    }

    this.lineItemStatusElement.setAttribute("aria-hidden", true);

    const cartStatus = document.getElementById(
      "CartNotification-LiveRegionText"
    );

    if (cartStatus) {
      cartStatus.setAttribute("aria-hidden", false);

      setTimeout(() => {
        cartStatus.setAttribute("aria-hidden", true);
      }, 1000);
    }
  }

  catchErrors() {
    const errors = document.getElementById("CartNotification-CartErrors");
    if (errors) errors.textContent = window.cartStrings.error;
  }

  setFocusOnElement(line, name, parsedState = {}, quantity) {
    const parent = this.closest("cart-notification");
    if (quantity == 0) {
      const activeElement = parent?.activeElement;
      if (activeElement) {
        setTimeout(() => {
          removeTrapFocus(activeElement);
        }, 1);
        return;
      }
    }

    const lineItem = this.querySelector(
      `[id^="CartNotification-Item-"][data-index="${line}"]`
    );
    const btnWithName = lineItem?.querySelector(`[name="${name}"]`);
    trapFocus(parent || this, btnWithName);
  }
}

if (!customElements.get("cart-notification-item")) {
  customElements.define("cart-notification-item", CartNotificationItem);
}
