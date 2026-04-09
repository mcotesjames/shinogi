/*
 * ------------ Theme Common JS ------------
 */

if (navigator.userAgent.indexOf("iPhone") > -1) {
  document
    .querySelector("[name=viewport]")
    .setAttribute(
      "content",
      "width=device-width, initial-scale=1, maximum-scale=1"
    );
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute("role", "button");
  summary.setAttribute("aria-expanded", "false");

  if (summary.nextElementSibling.getAttribute("id")) {
    summary.setAttribute("aria-controls", summary.nextElementSibling.id);
  }

  summary.addEventListener("click", (event) => {
    event.currentTarget.setAttribute(
      "aria-expanded",
      !event.currentTarget.closest("details").hasAttribute("open")
    );
  });

  if (summary.closest("header-drawer")) return;
  summary.parentElement.addEventListener("keyup", onKeyUpEscape);
});

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== "ESCAPE") return;

  const openDetailsElement = event.target.closest("details[open]");
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector("summary");
  openDetailsElement.removeAttribute("open");
  summaryElement.setAttribute("aria-expanded", false);
  summaryElement.focus();
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = "json") {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: `application/${type}`,
    },
  };
}

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener("keydown", trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function () {
    document.removeEventListener("keydown", trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== "TAB") return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener("focusout", trapFocusHandlers.focusout);
  document.addEventListener("focusin", trapFocusHandlers.focusin);

  elementToFocus?.focus();
}

function pauseAllVideos(exceptElement = null) {
  document.querySelectorAll(".js-youtube").forEach((video) => {
    if (exceptElement && exceptElement.contains(video)) return;
    video.contentWindow.postMessage(
      '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
      "*"
    );
  });
  document.querySelectorAll(".js-vimeo").forEach((video) => {
    if (exceptElement && exceptElement.contains(video)) return;
    video.contentWindow.postMessage('{"method":"pause"}', "*");
  });
  document.querySelectorAll("video").forEach((video) => {
    if (exceptElement && exceptElement.contains(video)) return;
    video.pause();
  });
}

function pauseAllModels(exceptElement = null) {
  document.querySelectorAll("product-model").forEach((model) => {
    if (exceptElement && exceptElement.contains(model)) return;
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function pauseAllMedia(exceptElement = null) {
  pauseAllVideos(exceptElement);
  pauseAllModels(exceptElement);
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener("focusin", trapFocusHandlers.focusin);
  document.removeEventListener("focusout", trapFocusHandlers.focusout);
  document.removeEventListener("keydown", trapFocusHandlers.keydown);

  if (
    elementToFocus &&
    !elementToFocus.classList.contains("product-card__button")
  ) {
    elementToFocus.focus();
  }
}

function formatMoney(cents, format = "") {
  if (typeof cents === "string") {
    cents = cents.replace(".", "");
  }
  cents = parseInt(cents, 10);

  let value = "";
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  const formatString = format || theme.moneyFormat;

  function formatWithDelimiters(
    number,
    precision = 2,
    thousands = ",",
    decimal = "."
  ) {
    if (isNaN(number) || number == null) {
      return "0";
    }

    number = (number / 100.0).toFixed(precision);

    const parts = number.split(".");
    const dollarsAmount = parts[0].replace(
      /(\d)(?=(\d\d\d)+(?!\d))/g,
      `$1${thousands}`
    );
    const centsAmount = parts[1] ? decimal + parts[1] : "";

    return dollarsAmount + centsAmount;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case "amount":
      value = formatWithDelimiters(cents, 2, ",", ".");
      break;
    case "amount_no_decimals":
      value = formatWithDelimiters(cents, 0, ",", ".");
      break;
    case "amount_with_comma_separator":
      value = formatWithDelimiters(cents, 2, ".", ",");
      break;
    case "amount_no_decimals_with_comma_separator":
      value = formatWithDelimiters(cents, 0, ".", ",");
      break;
    case "amount_with_apostrophe_separator":
      value = formatWithDelimiters(cents, 2, "'", ".");
      break;
    case "amount_no_decimals_with_space_separator":
      value = formatWithDelimiters(cents, 0, " ", ".");
      break;
    case "amount_with_space_separator":
      value = formatWithDelimiters(cents, 2, " ", ",");
      break;
    case "amount_with_period_and_space_separator":
      value = formatWithDelimiters(cents, 2, " ", ".");
      break;
    default:
      value = formatWithDelimiters(cents, 2, ",", ".");
  }

  return formatString.replace(placeholderRegex, value);
}

function slideUp(toggleEl, contentEl, duration = 300) {
  // Get the current height of the element
  const height = contentEl.clientHeight;

  // Set animation styles
  contentEl.style.transitionProperty = "height, margin, padding";
  contentEl.style.transitionDuration = duration + "ms";
  contentEl.style.overflow = "hidden";

  // Set initial values
  contentEl.style.height = height + "px";
  contentEl.style.padding = "0";
  contentEl.style.margin = "0";

  // Delay to start animation
  setTimeout(function () {
    // Set the values ​​for hiding the element
    contentEl.style.height = "0";
    contentEl.style.padding = "0";
    contentEl.style.margin = "0";
  }, 10);

  // Delay for animation to complete
  setTimeout(function () {
    // Remove installed styles after animation
    toggleEl.classList.remove("active");
    contentEl.classList.remove("active");
    contentEl.style.removeProperty("height");
    contentEl.style.removeProperty("padding");
    contentEl.style.removeProperty("margin");
    contentEl.style.removeProperty("overflow");
    contentEl.style.removeProperty("transition-duration");
    contentEl.style.removeProperty("transition-property");
  }, duration);
}

function slideDown(toggleEl, contentEl, duration = 300) {
  toggleEl.classList.add("active");
  contentEl.classList.add("active");
  contentEl.style.overflow = "hidden";
  contentEl.style.height = "0";

  const height = contentEl.scrollHeight;

  setTimeout(function () {
    contentEl.style.height = height + "px";
  }, 10);

  setTimeout(function () {
    contentEl.style.removeProperty("overflow");
    contentEl.style.removeProperty("height");
  }, duration);
}

function setHasScrollClass(el) {
  if (!el) return;
  el.classList.toggle("has-inner-scroll", el.scrollHeight > el.clientHeight);
}

if (!Element.prototype.replaceChildren) {
  Element.prototype.replaceChildren = function (...nodes) {
    while (this.firstChild) this.removeChild(this.firstChild);
    this.append(...nodes);
  };
}

/*
 * ------------ Shopify Common JS ------------
 */

if (typeof window.Shopify == "undefined") {
  window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  };
};

Shopify.setSelectorByValue = function (selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener
    ? target.addEventListener(eventName, callback, false)
    : target.attachEvent("on" + eventName, callback);
};

Shopify.postLink = function (path, options) {
  options = options || {};
  var method = options["method"] || "post";
  var params = options["parameters"] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for (var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (
  country_domid,
  province_domid,
  options
) {
  this.countryEl = document.getElementById(country_domid);
  this.provinceEl = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(
    options["hideElement"] || province_domid
  );

  Shopify.addListener(
    this.countryEl,
    "change",
    Shopify.bind(this.countryHandler, this)
  );

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function () {
    var value = this.countryEl.getAttribute("data-default");
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function () {
    var value = this.provinceEl.getAttribute("data-default");
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function (e) {
    var opt = this.countryEl.options[this.countryEl.selectedIndex];
    if (!opt) return;
    var raw = opt.getAttribute("data-provinces");
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = "none";
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement("option");
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function (selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function (selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement("option");
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  },
};

/*
 * ------------ Theme Web Components ------------
 */

class ProductCard extends HTMLElement {
  constructor() {
    super();

    this._onOptionInputClick = this._onOptionInputClick.bind(this);
  }

  connectedCallback() {
    this.hasColorSwatches = this.dataset?.cardColorSwatches === "true";
    this.hasQuickOptions = this.dataset?.cardQuickOption === "true";
    this.optionGroupSelector = ".js-card-option-group";

    if (this.hasColorSwatches || this.hasQuickOptions) {
      this.cardOptions =
        this.querySelector("[data-product-card-options]")?.dataset || {};
      this.addEventListener("click", this._onOptionInputClick);
    }

    const hoverInfo = this.querySelector(
      ".product-card__information.product-card__information--hover"
    );
    const hoverInfoBottom = this.querySelector(
      ".product-card__information-bottom.show-on-hover"
    );
    const dynamicInf = this.querySelector(
      ".product-card__information.product-card__information--dynamic"
    );
    if ((!hoverInfo && hoverInfoBottom) || dynamicInf) this.calcInfoMaxHeight();
  }

  disconnectedCallback() {
    this.removeEventListener("click", this._onOptionInputClick);
  }

  _onOptionInputClick(event) {
    const input = event.target.closest("input[type='radio']");
    if (!input || !input.checked) return;

    const group = input.closest(this.optionGroupSelector);
    if (!group) return;

    const allInputs = group.querySelectorAll("input");
    this.updateCardInputAttr(allInputs, input);

    const fallbackVariantId = input.dataset?.variantId;
    this.updateCardVariant(fallbackVariantId);
  }

  updateCardVariant(fallbackVariantId = "") {
    const productVariants = this.parseData("[data-product-card-variants]");
    if (!productVariants) return;

    const selectedOptions = this.getSelectedOptions();

    const matchedVariant = productVariants.find((variant) => {
      return Object.entries(selectedOptions).every(([key, value]) => {
        return variant[key] === value;
      });
    });

    const variantId = matchedVariant ? matchedVariant.id : fallbackVariantId;

    const originalMedia = this.parseData("[data-product-card-featured-media]");
    const newFeaturedMedia =
      matchedVariant?.featured_media?.preview_image ||
      matchedVariant?.featured_image ||
      originalMedia?.preview_image ||
      originalMedia;

    this.updateCardLinkOverlay(variantId);
    this.updateAddToCartForm(variantId);
    this.updateQuickViewUrl(variantId);
    this.updateFeaturedImage(newFeaturedMedia);
    this.updateOptionsInputs(productVariants);
    this.updateAddToCartBtn(matchedVariant);
    this.resetErrorMessage();

    const hasAddToCartBtn = this.querySelector(
      'product-form .product-card__button[type="submit"]'
    );
    const hasProductVaries = this.cardOptions?.productHasPriceVaries === "true";
    if (hasAddToCartBtn && hasProductVaries) {
      this.updatePrice(matchedVariant);
      this.updateUnitPrice(matchedVariant);
    }

    return matchedVariant;
  }

  updateCardInputAttr(allInputs, currentInput) {
    if (!currentInput) return;
    allInputs.forEach((input) => {
      input.removeAttribute("checked");
    });
    currentInput.setAttribute("checked", true);
  }

  getSelectedOptions() {
    const selectedOptions = {};

    this.querySelectorAll(`${this.optionGroupSelector} input:checked`).forEach(
      (input) => {
        const group = input.closest(this.optionGroupSelector);
        const optionPosition = group?.dataset?.optionPosition;
        if (optionPosition) {
          selectedOptions[`option${optionPosition}`] = input.value;
        }
      }
    );

    return selectedOptions;
  }

  updateCardLinkOverlay(newVariantId) {
    const currentVariantId = newVariantId;
    const linkOverlay = this.querySelector(".product-card__link-overlay");
    if (!linkOverlay || !currentVariantId) return;
    const currentHref = linkOverlay.getAttribute("href");
    const newUrl = new URL(currentHref, window.location.origin);
    newUrl.searchParams.set("variant", currentVariantId);
    linkOverlay.setAttribute("href", newUrl.toString());
  }

  updateQuickViewUrl(newVariantId) {
    const quickViewBtn = this.querySelector(
      ".product-card__quickview > modal-opener > .product-card__button"
    );
    if (!quickViewBtn || !newVariantId) return;
    const productUrl = quickViewBtn.dataset.productUrl;
    quickViewBtn.dataset.productUrl = productUrl.includes("variant=")
      ? productUrl.replace(/variant=\d+/, `variant=${newVariantId}`)
      : `${productUrl}?variant=${newVariantId}`;
  }

  updateAddToCartForm(newVariantId) {
    const currentVariantId = newVariantId;
    const quickAddInput = this.querySelector(
      '.product-card__quickadd input[name="id"]'
    );
    if (!quickAddInput || !currentVariantId) return;
    quickAddInput.value = currentVariantId;
  }

  generateSizes(imageObj) {
    const aspectRatioImage = imageObj.width / imageObj.height;
    const aspectRatioSettings = Number(this.cardOptions?.productRatio || 0.75);
    const imageFitSettings = this.cardOptions?.productFit || "cover";
    const columns = Number(this.cardOptions?.productColumns || 1);
    const columnsMobile = Number(this.cardOptions?.productColumnsMobile || 1);
    let calcRatio = 1;
    if (imageFitSettings == "cover" && aspectRatioImage > aspectRatioSettings) {
      calcRatio = (aspectRatioImage / aspectRatioSettings).toFixed(2);
    }

    let sizes = `(min-width: 1200px) calc(${calcRatio} * (100vw / ${columns}))`;
    if (columns >= 3) {
      sizes += `, (min-width: 990px) calc(${calcRatio} * (100vw / 3))`;
    }
    if (columns >= 2) {
      sizes += `, (min-width: 576px) calc(${calcRatio} * (100vw / 2))`;
    }

    sizes += `, ${
      columnsMobile == 2
        ? `calc(${calcRatio} * 50vw)`
        : `calc(${calcRatio} * 100vw)`
    }`;

    return sizes;
  }

  generateSrcset(imageObj) {
    const imageUrl = new URL(imageObj.src, window.location.origin);
    const widths = [
      360, 535, 720, 940, 1066, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600,
      2800, 3000, 3200, 3400, 3600, 3800,
    ];
    return widths
      .filter((width) => width <= imageObj.width)
      .map((width) => {
        imageUrl.searchParams.set("width", width.toString());
        return `${imageUrl.href} ${width}w`;
      })
      .join(", ");
  }

  updateImgElement(imageEl, imageObj) {
    imageEl.alt = imageObj.alt || this.cardOptions?.productTitle || "";
    imageEl.sizes = this.generateSizes(imageObj);
    imageEl.src = imageObj.src;
    imageEl.srcset = this.generateSrcset(imageObj);
    imageEl.loading = "eager";
    imageEl.fetchPriority = "high";
    return imageEl;
  }

  updateFeaturedImage(featuredMedia) {
    const primaryImage = this.querySelector(".media--first");
    const secondaryImage = this.querySelector(".media--second");
    if (!featuredMedia || !featuredMedia.src || !primaryImage) return;

    const newPrimaryImage = this.updateImgElement(primaryImage, featuredMedia);

    if (secondaryImage) {
      const secondaryImagePathname = new URL(secondaryImage.src).pathname;
      const newPrimaryImagePathname = new URL(newPrimaryImage.src).pathname;

      if (secondaryImagePathname === newPrimaryImagePathname) {
        primaryImage.remove();
        secondaryImage.classList.remove("media--second");
        secondaryImage.classList.add("media--first");
        return;
      }
    }

    if (secondaryImage) {
      secondaryImage.remove();
    }
  }

  updateAddToCartBtn(currentVariant) {
    const isVariantAvailable = currentVariant
      ? currentVariant.available
      : false;

    const quickAddBtn = this.querySelector(
      '.product-card__quickadd button[name="add"]'
    );
    if (quickAddBtn) {
      const quickAddBtnLabel = quickAddBtn.querySelector("span");
      const soldOutMessage = quickAddBtn.querySelector(".sold-out-message");

      if (isVariantAvailable) {
        quickAddBtn.setAttribute("aria-disabled", false);
        if (quickAddBtnLabel) quickAddBtnLabel.classList.remove("hidden");
        if (soldOutMessage) soldOutMessage.classList.add("hidden");
      } else {
        quickAddBtn.setAttribute("aria-disabled", true);
        if (quickAddBtnLabel) quickAddBtnLabel.classList.add("hidden");
        if (soldOutMessage) soldOutMessage.classList.remove("hidden");
      }
    }
  }

  resetErrorMessage() {
    const errorEl = this.querySelector(".product-card__error");
    if (!errorEl) return;
    errorEl.setAttribute("hidden", true);
    errorEl.textContent = "";
  }

  updateOptionsInputs(productVariants) {
    const selectedOptions = this.getSelectedOptions();

    this.querySelectorAll(this.optionGroupSelector).forEach((group) => {
      const optionPosition = group.dataset?.optionPosition;
      if (!optionPosition) return;

      const optionKey = `option${optionPosition}`;
      const inputs = group.querySelectorAll("input");

      inputs.forEach((input) => {
        const testOptions = {
          ...selectedOptions,
          [optionKey]: input.value,
        };

        const isAvailable = productVariants.some((variant) => {
          return (
            variant.available &&
            Object.entries(testOptions).every(
              ([key, value]) => variant[key] === value
            )
          );
        });

        //input.disabled = !isAvailable;
        input.classList.toggle("disabled", !isAvailable);
      });
    });
  }

  updatePrice(currentVariant) {
    const priceEl = this.querySelector(".product-card__information .price");
    if (!priceEl || !currentVariant || !currentVariant.price) return;

    const currencyCode = priceEl.dataset?.currencyCode || "";

    if (currentVariant.compare_at_price > currentVariant.price) {
      const saleWrapper = priceEl.querySelector(".price__sale");
      const saleEl = saleWrapper?.querySelector(".price-item--sale");
      const oldEl = saleWrapper?.querySelector(".price-item--regular");
      if (!saleEl || !oldEl) return;
      priceEl.classList.remove("price--no-compare");
      priceEl.classList.add("price--on-sale");
      saleEl.textContent = currencyCode
        ? `${formatMoney(currentVariant.price)} ${currencyCode}`
        : formatMoney(currentVariant.price);
      oldEl.textContent = currencyCode
        ? `${formatMoney(currentVariant.compare_at_price)} ${currencyCode}`
        : formatMoney(currentVariant.compare_at_price);
      return;
    }

    priceEl.classList.remove("price--on-sale");
    const regWrapper = priceEl.querySelector(".price__regular");
    const regEl = regWrapper?.querySelector(".price-item--regular");
    if (!regEl) return;
    regEl.textContent = currencyCode
      ? `${formatMoney(currentVariant.price)} ${currencyCode}`
      : formatMoney(currentVariant.price);
  }

  updateUnitPrice(currentVariant) {
    const unitPriceEl = this.querySelector(".unit-price");
    if (!unitPriceEl) return;
    if (
      !currentVariant ||
      !currentVariant.unit_price ||
      !currentVariant.unit_price_measurement
    ) {
      unitPriceEl.classList.add("hidden");
      return;
    }
    const unitPriceText = unitPriceEl.querySelector("dd");
    if (!unitPriceText) return;
    unitPriceEl.classList.remove("hidden");
    const currentUnitPriceValue = formatMoney(currentVariant.unit_price);
    const currentUnitPriceMeasurement =
      currentVariant.unit_price_measurement.reference_value !== 1
        ? `${currentVariant.unit_price_measurement.reference_value}${currentVariant.unit_price_measurement.reference_unit}`
        : currentVariant.unit_price_measurement.reference_unit;
    const currentUnitPrice = `${currentUnitPriceValue}/${currentUnitPriceMeasurement}`;
    unitPriceText.textContent = currentUnitPrice;
  }

  parseData(selector) {
    const el = this.querySelector(selector);
    if (!el) return null;

    const content = el.textContent?.trim();
    if (!content) return null;

    try {
      return JSON.parse(content);
    } catch (e) {
      return null;
    }
  }

  calcInfoMaxHeight() {
    const infoBottom = this.querySelector(".product-card__information-bottom");
    if (!infoBottom) return;

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        infoBottom.style.setProperty(
          "--info-max-height",
          `${infoBottom.scrollHeight}px`
        );
      });
    });

    observer.observe(this);
  }
}

if (!customElements.get("product-card")) {
  customElements.define("product-card", ProductCard);
}

class ProductCardPlaceholder extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const hoverInfo = this.querySelector(
      ".product-card__information.product-card__information--hover"
    );
    const hoverInfoBottom = this.querySelector(
      ".product-card__information-bottom.show-on-hover"
    );
    if (!hoverInfo && hoverInfoBottom) this.calcInfoMaxHeight();
  }

  calcInfoMaxHeight() {
    const infoBottom = this.querySelector(".product-card__information-bottom");
    if (!infoBottom) return;
    infoBottom.style.setProperty(
      "--info-max-height",
      `${infoBottom.scrollHeight}px`
    );
  }
}

if (!customElements.get("product-card-placeholder")) {
  customElements.define("product-card-placeholder", ProductCardPlaceholder);
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector("input");
    this.changeEvent = new Event("change", { bubbles: true });
    this.isCartItem = Boolean(this.closest(".cart-item"));

    this.querySelectorAll("button").forEach((button) => {
      this.setMinimumDisable();

      button.addEventListener("click", this.onButtonClick.bind(this));
    });

    var eventList = ["paste", "input"];

    for (const event of eventList) {
      this.input.addEventListener(event, (e) => {
        const value = e.currentTarget.value;
        const numberRegex = this.isCartItem ? /^\d*$/ : /^0*?[1-9]\d*$/;

        if (numberRegex.test(value) || value === "") {
        } else {
          e.currentTarget.value = 1;
        }

        this.setMinimumDisable();
      });
    }

    this.input.addEventListener("focusout", (e) => {
      if (e.currentTarget.value === "") {
        e.currentTarget.value = 1;
        this.setMinimumDisable();
      }
    });
  }

  setMinimumDisable() {
    if (this.input.value == 1) {
      this.querySelector('button[name="minus"]').classList.add("disabled");
    } else {
      this.querySelector('button[name="minus"]').classList.remove("disabled");
    }
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === "plus" ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) {
      this.input.dispatchEvent(this.changeEvent);
    }

    this.setMinimumDisable();
  }
}

if (!customElements.get("quantity-input")) {
  customElements.define("quantity-input", QuantityInput);
}

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll(
      '[id^="ModalCloseBtn-"], [id^="ModalCloseOverlay-"]'
    ).forEach((el) => el.addEventListener("click", () => this.hide(false)));

    this.addEventListener("keyup", (event) => {
      if (event.code.toUpperCase() === "ESCAPE") this.hide();
    });
    if (this.classList.contains("media-modal")) {
      this.addEventListener("pointerup", (event) => {
        if (
          event.pointerType === "mouse" &&
          !event.target.closest("deferred-media, product-model")
        ) {
          this.hide();
        }
      });
    } else {
      this.addEventListener("click", (event) => {
        if (event.target === this) this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener, pauseVideo = true) {
    this.openedBy = opener;
    document.body.classList.add("overflow-hidden");
    this.setAttribute("open", "");
    this.classList.add("modal--open");
    if (pauseVideo) {
      window.pauseAllMedia();
    }
    this.addEventListener(
      "transitionend",
      () => {
        trapFocus(this, this.querySelector('[role="dialog"]'));
      },
      { once: true }
    );
  }

  hide(pauseVideo = true) {
    this.removeAttribute("open");
    this.classList.remove("modal--open");
    removeTrapFocus(this.openedBy);
    if (pauseVideo) {
      window.pauseAllMedia();
    }
    document.body.classList.remove("overflow-hidden");
  }
}

if (!customElements.get("modal-dialog")) {
  customElements.define("modal-dialog", ModalDialog);
}

class ProductModal extends ModalDialog {
  constructor() {
    super();
  }
}

if (!customElements.get("product-modal")) {
  customElements.define("product-modal", ProductModal);
}

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector("button");
    if (!button) return;

    button.addEventListener("click", () => {
      const modal = document.querySelector(this.getAttribute("data-modal"));
      if (modal) modal.show(button);
    });
  }
}

if (!customElements.get("modal-opener")) {
  customElements.define("modal-opener", ModalOpener);
}

class DeferredMedia extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (poster) {
      poster.addEventListener("click", this.loadContent.bind(this));
    }

    if (this.dataset.autoplay === "true") {
      this.loadContent();
    }
  }

  loadContent() {
    pauseAllMedia();

    if (this.getAttribute("loaded")) return;

    const template = this.querySelector("template");
    if (!template) return;

    const content = document.createElement("div");
    content.appendChild(template.content.firstElementChild.cloneNode(true));
    this.setAttribute("loaded", true);

    const media = content.querySelector("video, model-viewer, iframe");
    if (!media) return;

    const deferredElement = this.appendChild(media);

    if (["VIDEO", "IFRAME"].includes(deferredElement.nodeName)) {
      const videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            let shouldAutoplay = false;
            const parentSlide = entry.target.closest(".swiper-slide");
            if (parentSlide) {
              if (parentSlide.classList.contains("swiper-slide-active")) {
                shouldAutoplay = true;
              }
            } else {
              if (entry.intersectionRatio > 0.7) {
                shouldAutoplay = true;
              }
            }

            if (shouldAutoplay) {
              if (
                (this.dataset.autoplay === "true" &&
                  !this.closest("product-modal")) ||
                (this.dataset.autoplay === "true" &&
                  this.closest("product-modal")?.hasAttribute("open"))
              ) {
                pauseAllMedia(this);

                if (entry.target.nodeName === "VIDEO") {
                  entry.target.play()?.catch((error) => {
                    console.error("Error playing video:", error);
                  });
                } else if (
                  entry.target.nodeName === "IFRAME" &&
                  entry.target.contentWindow
                ) {
                  if (entry.target.classList.contains("js-youtube")) {
                    entry.target.contentWindow.postMessage(
                      '{"event":"command","func":"playVideo","args":""}',
                      "*"
                    );
                  } else {
                    entry.target.contentWindow.postMessage(
                      '{"method":"play"}',
                      "*"
                    );
                  }
                }
              }
            } else {
              if (entry.target.nodeName === "VIDEO") {
                entry.target.pause();
              } else if (
                entry.target.nodeName === "IFRAME" &&
                entry.target.contentWindow
              ) {
                if (entry.target.classList.contains("js-youtube")) {
                  entry.target.contentWindow.postMessage(
                    '{"event":"command","func":"pauseVideo","args":""}',
                    "*"
                  );
                } else {
                  entry.target.contentWindow.postMessage(
                    '{"method":"pause"}',
                    "*"
                  );
                }
              }
            }
          });
        },
        {
          threshold: Array.from({ length: 1000 }, (_, i) => i / 1000),
        }
      );

      videoObserver.observe(deferredElement);
    }

    const modelViewer = this.closest(".swiper-slide-active")?.querySelector(
      "model-viewer"
    );
    if (
      modelViewer &&
      !modelViewer.classList.contains("shopify-model-viewer-ui__disabled")
    ) {
      const swiper = this.closest(".swiper")?.swiper;
      if (swiper) {
        swiper.params.noSwiping = true;
        swiper.params.noSwipingClass = "swiper-slide";
      }
    }

    this.querySelectorAll(
      "video, .shopify-model-viewer-ui__controls-overlay"
    ).forEach((media) => {
      if (this.getAttribute("loaded") === "true") {
        media.addEventListener("click", (event) => {
          pauseAllMedia(this);
        });
      }
    });
  }
}

if (!customElements.get("deferred-media")) {
  customElements.define("deferred-media", DeferredMedia);
}

class ProductModel extends DeferredMedia {
  constructor() {
    super();
  }

  loadContent() {
    super.loadContent();

    Shopify.loadFeatures([
      {
        name: "model-viewer-ui",
        version: "1.0",
        onLoad: this.setupModelViewerUI.bind(this),
      },
    ]);
  }

  setupModelViewerUI(errors) {
    if (errors) return;

    this.modelViewerUI = new Shopify.ModelViewerUI(
      this.querySelector("model-viewer")
    );

    const $this = this;
    const target = $this.querySelector("model-viewer");

    const observer = new MutationObserver((records) => {
      if ($this.closest(".swiper") && $this.closest(".swiper").swiper) {
        const swiperObj = $this.closest(".swiper").swiper;
        if (!target.classList.contains("shopify-model-viewer-ui__disabled")) {
          swiperObj.params.noSwiping = true;
          swiperObj.params.noSwipingClass = "swiper-slide";
        } else {
          swiperObj.params.noSwiping = false;
        }
      }
    });

    observer.observe(target, { attributes: true });
  }
}

if (!customElements.get("product-model")) {
  customElements.define("product-model", ProductModel);
}

window.ProductModel = {
  loadShopifyXR() {
    Shopify.loadFeatures([
      {
        name: "shopify-xr",
        version: "1.0",
        onLoad: this.setupShopifyXR.bind(this),
      },
    ]);
  },

  setupShopifyXR(errors) {
    if (errors) return;

    if (!window.ShopifyXR) {
      document.addEventListener("shopify_xr_initialized", () =>
        this.setupShopifyXR()
      );
      return;
    }

    document.querySelectorAll('[id^="ProductJSON-"]').forEach((modelJSON) => {
      window.ShopifyXR.addModels(JSON.parse(modelJSON.textContent));
      modelJSON.remove();
    });
    window.ShopifyXR.setupXRElements();
  },
};

window.addEventListener("DOMContentLoaded", () => {
  window.ProductModel?.loadShopifyXR();
});

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("change", this.onVariantChange);

    this.isHighVariantNeedUpdate = false;
    this.isCombinedListingsNeedUpdate = false;
  }

  onVariantChange(event) {
    if (!this.contains(event.target)) return;

    const combinedProductURL = event.target.dataset?.productUrl;

    this.updateOptions();
    // updateMasterId method updates currentVariant from liquid <script data-all-variations-no-high>
    this.updateMasterId();
    this.toggleAddButton(true, "");

    this.isHighVariantNeedUpdate = false;
    // -----
    // checking for high-variant and combined products
    // if variant not found in liquid <script data-all-variants-no-high> and product is high-variant
    if (
      (!this.currentVariant && this.dataset.isHighVariantProduct === "true") ||
      (!this.currentVariant && combinedProductURL)
    ) {
      const selectedValuesIds = this.getSelectedValuesIds();
      this.highVariantRequestUrl = this.createRequestUrl({
        selectedValuesIds: selectedValuesIds,
        combinedProductURL: combinedProductURL,
      });
      if (this.highVariantRequestUrl) {
        this.isHighVariantNeedUpdate = true;
        if (combinedProductURL) {
          this.isCombinedListingsNeedUpdate = true;
        }
      }
    }
    // -----

    if (this.isHighVariantNeedUpdate === false) {
      this.updatePickupAvailability();
      this.updateVariantStatuses();
    }
    this.syncStickyBar();
    this.resetErrorMessage();

    if (!this.currentVariant) {
      // -----
      // for high-variant products
      if (this.isHighVariantNeedUpdate) {
        this.classList.add("high-variant-loading");
        this.renderProductInfo(this.highVariantRequestUrl);
        return;
      }
      // -----

      this.toggleAddButton(true, "");
      this.setUnavailable();
    } else {
      if (
        this.currentVariant?.featured_media &&
        this.dataset?.variantMediaDisplay === "show_all"
      ) {
        // If variant display != "show_all", the media gallery element is fully replaced inside updateElementsAfterFetch
        const mediaId = `${this.dataset.section}-${this.currentVariant.featured_media.id}`;
        this.updateMedia(mediaId);
      }
      this.updateURL();
      this.updateVariantInput();
      const requestUrl = this.createRequestUrl({
        currentVariantId: this.currentVariant.id,
      });
      this.renderProductInfo(requestUrl);
    }
  }

  updateOptions() {
    const fieldsets = Array.from(
      this.querySelectorAll(".product-form__controls--dropdown")
    );

    this.options = Array.from(
      this.querySelectorAll("select"),
      (select) => select.value
    ).concat(
      fieldsets.map((fieldset) => {
        return Array.from(fieldset.querySelectorAll("input")).find(
          (radio) => radio.checked
        ).value;
      })
    );
  }

  updateMasterId() {
    if (this.variantData || this.querySelector("[data-all-variants-no-high]")) {
      this.currentVariant = this.getVariantData().find((variant) => {
        return !variant.options
          .map((option, index) => {
            return this.options[index] === option;
          })
          .includes(false);
      });
    }
  }

  isHidden(elem) {
    const styles = window.getComputedStyle(elem);
    return styles.display === "none" || styles.visibility === "hidden";
  }

  updateMedia(mediaId) {
    if (!mediaId) return;

    const mediaEl = document.querySelector(
      `[data-section="product-media-${this.dataset.section}"]`
    );
    if (!mediaEl) return;

    // for slider and slider_previews layout
    const sliderEl = mediaEl.querySelector(".js-media-list");
    if (sliderEl && sliderEl.swiper) {
      sliderEl.querySelectorAll(".swiper-slide").forEach((slide, index) => {
        const slideMediaId = slide.dataset?.mediaId;
        if (slideMediaId === mediaId) {
          const findIndex = sliderEl.swiper.slides.findIndex((slideEl) => {
            return slideEl.dataset?.mediaId === slideMediaId;
          });
          const fallbackIndex = Number(
            slide.dataset?.swiperSlideIndex || index
          );
          const swiperSlideIndex = findIndex !== -1 ? findIndex : fallbackIndex;
          sliderEl.swiper.slideTo(swiperSlideIndex, 800);
        }
      });
    }

    // for stacked_previews layout
    const stackedEl =
      mediaEl.querySelector(
        ".product__media-list[data-desktop-type='stacked_previews']"
      ) ||
      mediaEl.querySelector(
        ".product__media-list[data-desktop-type='stacked']"
      );
    if (stackedEl && window.innerWidth >= 990) {
      stackedEl.querySelectorAll("[data-media-id]").forEach((mediaItem) => {
        const mediaItemId = mediaItem.dataset?.mediaId;
        if (mediaItemId === mediaId) {
          const offset = mediaItem.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: offset - 100, behavior: "smooth" });
        }
      });
    }
  }

  updateURL() {
    if (this.dataset.updateUrl === "false") return;
    const newUrl = this.currentVariant
      ? `${this.dataset.url}?variant=${this.currentVariant.id}`
      : this.dataset.url;

    window.history.replaceState({}, "", newUrl);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(
      `#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}, #sticky-bar-product-form-${this.dataset.section}`
    );
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    publish(PUB_SUB_EVENTS.variantChange, {
      data: {
        sectionId: this.dataset.section,
        variant: this.currentVariant,
      },
    });
  }

  updateVariantStatuses() {
    const selectedOptionOneVariants = this.variantData.filter(
      (variant) => this.querySelector(":checked").value === variant.options[0]
    );
    const inputWrappers = [...this.querySelectorAll(".product-form__controls")];
    inputWrappers.forEach((option, index) => {
      if (index === 0) return;
      const optionInputs = [
        ...option.querySelectorAll('input[type="radio"], option'),
      ];
      const previousOptionSelected =
        inputWrappers[index - 1].querySelector(":checked").value;
      const availableOptionInputsValue = selectedOptionOneVariants
        .filter(
          (variant) =>
            variant.available &&
            variant.options[index - 1] === previousOptionSelected
        )
        .map((variantOption) => variantOption.options[index]);
      this.setInputAvailability(optionInputs, availableOptionInputsValue);
    });
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute("value"))) {
        if (input.tagName === "OPTION") {
          input.innerText = input.getAttribute("value");
        } else if (input.tagName === "INPUT") {
          input.classList.remove("disabled");
        }
      } else {
        if (input.tagName === "OPTION") {
          input.innerText =
            window.variantStrings.unavailable_with_option.replace(
              "[value]",
              input.getAttribute("value")
            );
        } else if (input.tagName === "INPUT") {
          input.classList.add("disabled");
        }
      }
    });
  }

  setCheckedInputsBySelectedValues(selectedValues) {
    const inputWrappers = [...this.querySelectorAll(".product-form__controls")];

    inputWrappers.forEach((groupEl, index) => {
      const selectedValue = selectedValues[index];
      if (!selectedValue) return;

      const inputs = [...groupEl.querySelectorAll('input[type="radio"]')];

      inputs.forEach((input) => {
        const shouldBeChecked = input.value === selectedValue;
        input.checked = shouldBeChecked;
        if (shouldBeChecked) {
          input.setAttribute("checked", "");
        } else {
          input.removeAttribute("checked");
        }
      });
    });
  }

  getSelectedValues() {
    const controls = [...this.querySelectorAll(".product-form__controls")];

    controls.sort((a, b) => {
      return (
        Number(a.dataset.optionPosition) - Number(b.dataset.optionPosition)
      );
    });

    const selectedValues = controls.map((control) => {
      const checkedInput = control.querySelector('input[type="radio"]:checked');
      return checkedInput ? checkedInput.value : null;
    });

    return selectedValues;
  }

  getOtherPickerForSync() {
    let pickerForUpdate = null;

    const isThisStickyBar = this.id.includes("sticky_add_to_cart_bar");
    if (isThisStickyBar) {
      const mainPickerId = this.id.replace("-sticky_add_to_cart_bar", "");
      pickerForUpdate = document.getElementById(mainPickerId);
    } else {
      const stickyPickerId = `${this.id}-sticky_add_to_cart_bar`;
      pickerForUpdate = document.getElementById(stickyPickerId);
    }

    if (
      !pickerForUpdate ||
      (pickerForUpdate.tagName !== "VARIANT-RADIOS" &&
        pickerForUpdate.tagName !== "VARIANT-SELECTS")
    ) {
      return null;
    }

    return pickerForUpdate;
  }

  syncStickyBar() {
    try {
      if (!this.dataset.updateUrl === "false") return;

      const stickyBarEl = document.querySelector(".product-sticky-add-bar");
      if (!stickyBarEl) return;

      const pickerForUpdate = this.getOtherPickerForSync();
      if (!pickerForUpdate) return;

      const selectedValues = this.getSelectedValues();
      pickerForUpdate.setCheckedInputsBySelectedValues(selectedValues);
      pickerForUpdate.updateVariantStatuses();
      if (pickerForUpdate.tagName === "VARIANT-SELECTS") {
        pickerForUpdate
          .querySelectorAll("variant-dropdown-select")
          .forEach((dropdown) => {
            if (typeof dropdown.updateCurrentOption === "function") {
              dropdown.updateCurrentOption(selectedValues);
            }
          });
      }
    } catch (error) {}
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector("pickup-availability");
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute("available");
      pickUpAvailability.innerHTML = "";
    }
  }

  renderProductInfo(requestUrl) {
    this.abortController?.abort();
    this.abortController = new AbortController();

    fetch(requestUrl, { signal: this.abortController.signal })
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, "text/html");

        try {
          this.setCurrentVariantAfterFetch(html);
        } catch (err) {}

        // -----
        // for high-variant products
        // and if variant not found in liquid <script data-all-variants-no-high>
        // but it was found after a request with the option_values parameter
        if (this.isHighVariantNeedUpdate) {
          try {
            this.updateURL();
            this.updatePickupAvailability();
            this.updatePickerInnerHtml(html);
            if (this.currentVariant) {
              this.updateVariantInput();
              if (
                this.currentVariant.featured_media &&
                this.dataset?.variantMediaDisplay === "show_all"
              ) {
                // If variant display != "show_all", the media gallery element is fully replaced inside updateElementsAfterFetch
                const mediaId = `${this.dataset.section}-${this.currentVariant.featured_media.id}`;
                this.updateMedia(mediaId);
              }
            }
          } catch (err) {}
        }
        // -----

        this.updateElementsAfterFetch(html);

        if (!this.currentVariant) {
          this.toggleAddButton(true, "");
          this.setUnavailable();
        } else {
          this.toggleAddButton(
            !this.currentVariant.available,
            window.variantStrings.soldOut
          );
        }
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.info("Fetch aborted by user");
        } else {
          console.error(error);
        }
      })
      .finally(() => {
        this.classList.remove("high-variant-loading");
      });
  }

  toggleAddButton(disable = true, text) {
    const productForms = document.querySelectorAll(
      `#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}, #sticky-bar-product-form-${this.dataset.section}`
    );
    productForms.forEach((productForm) => {
      const addButton = productForm.querySelector('[name="add"]');
      if (!addButton) return;

      const addButtonText =
        addButton.querySelector(".button__label") ||
        addButton.querySelector("span");

      if (disable) {
        addButton.setAttribute("disabled", true);
        addButton.setAttribute("aria-disabled", true);
        if (text) {
          addButtonText.textContent = text;

          if (text === window.variantStrings.unavailable) {
            addButton.dataset.status = "unavailable";
          } else {
            addButton.dataset.status = "sold-out";
          }
        }
      } else {
        addButton.removeAttribute("disabled");
        addButton.removeAttribute("aria-disabled");
        addButtonText.textContent = window.variantStrings.addToCart;
        addButton.dataset.status = "available";
      }
    });
  }

  resetErrorMessage() {
    const productForms = document.querySelectorAll(
      `#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}, #sticky-bar-product-form-${this.dataset.section}`
    );
    productForms.forEach((productForm) => {
      const parentEl = productForm.closest("product-form");
      if (parentEl) {
        const errorWrapperEl = parentEl.querySelector(
          ".product-form__error-message-wrapper"
        );
        const errorTextEl = errorWrapperEl?.querySelector(
          ".product-form__error-message"
        );
        if (!errorWrapperEl || !errorTextEl) return;
        errorWrapperEl.setAttribute("hidden", true);
        errorTextEl.textContent = "";
      }
    });
  }

  setUnavailable() {
    const price = document.getElementById(`price-${this.dataset.section}`);
    const priceSticky = document.getElementById(
      `price-sticky-${this.dataset.section}`
    );
    const inventory = document.getElementById(
      `Inventory-${this.dataset.section}`
    );
    const pickerInventory = document.getElementById(
      `PickerInventory-${this.dataset.section}`
    );
    const sku = document.getElementById(`Sku-${this.dataset.section}`);
    const colorNameDestinations = document.querySelectorAll(
      `[id^="ColorName-${this.dataset.section}"]`
    );

    this.toggleAddButton(true, window.variantStrings.unavailable);
    if (price) price.classList.add("visibility-hidden");
    if (priceSticky) priceSticky.classList.add("visibility-hidden");
    if (inventory) inventory.classList.add("visibility-hidden");
    if (pickerInventory) pickerInventory.classList.add("visibility-hidden");
    if (sku) sku.classList.add("visibility-hidden");
    colorNameDestinations.forEach((colorNameDestination) => {
      colorNameDestination.classList.add("visibility-hidden");
    });
  }

  getVariantData() {
    this.variantData =
      this.variantData ||
      JSON.parse(this.querySelector("[data-all-variants-no-high]").textContent);
    return this.variantData;
  }

  updateElementsAfterFetch(html) {
    // attr data-original-section use for Quick view modal
    const currentSectionId = this.dataset.section;
    const sourceSectionId = this.dataset.originalSection
      ? this.dataset.originalSection
      : this.dataset.section;

    // price
    const priceDestination = document.getElementById(
      `price-${currentSectionId}`
    );
    const priceStickyDestination = document.getElementById(
      `price-sticky-${currentSectionId}`
    );
    const priceSource = html.getElementById(`price-${sourceSectionId}`);
    if (priceSource && priceDestination) {
      priceDestination.innerHTML = priceSource.innerHTML;
      priceDestination.classList.remove("visibility-hidden");
    }
    if (priceSource && priceStickyDestination) {
      priceStickyDestination.innerHTML = priceSource.innerHTML;
      const priceText = priceStickyDestination.querySelector(".price-text");
      if (priceText) priceText.className = "price-text";
    }

    // inventory
    const inventorySource = html.getElementById(`Inventory-${sourceSectionId}`);
    const inventoryDestination = document.getElementById(
      `Inventory-${currentSectionId}`
    );
    if (inventorySource && inventoryDestination) {
      inventoryDestination.innerHTML = inventorySource.innerHTML;
      inventoryDestination.classList.toggle(
        "visibility-hidden",
        inventorySource.innerText === ""
      );
    }

    const pickerInventorySource = html.getElementById(
      `PickerInventory-${sourceSectionId}`
    );
    const pickerInventoryDestination = document.getElementById(
      `PickerInventory-${currentSectionId}`
    );
    if (pickerInventorySource && pickerInventoryDestination) {
      pickerInventoryDestination.innerHTML = pickerInventorySource.innerHTML;
      pickerInventoryDestination.classList.toggle(
        "visibility-hidden",
        pickerInventorySource.innerText === ""
      );
    }

    // sku
    const skuSource = html.getElementById(`Sku-${sourceSectionId}`);
    const skuDestination = document.getElementById(`Sku-${currentSectionId}`);
    if (skuSource && skuDestination) {
      skuDestination.innerHTML = skuSource.innerHTML;
      skuDestination.classList.toggle(
        "visibility-hidden",
        skuSource.classList.contains("visibility-hidden")
      );
    }

    // color swatches label
    const colorNameSources = html.querySelectorAll(
      `[id^="ColorName-${sourceSectionId}"]`
    );
    const colorNameDestinations = document.querySelectorAll(
      `[id^="ColorName-${currentSectionId}"]`
    );
    if (colorNameSources?.length === colorNameDestinations?.length) {
      colorNameDestinations.forEach((colorNameDestination, index) => {
        colorNameDestination.classList.remove("visibility-hidden");
        colorNameDestination.innerHTML = colorNameSources[index].innerHTML;
      });
    }

    // variant image swatches
    if (this.isHighVariantNeedUpdate !== true) {
      const variantSwatchesSource = html.querySelector(
        `#variant-picker-${sourceSectionId} [data-is-variant-image-swatch="true"]`
      );
      const variantSwatchesDestination = document.querySelector(
        `#variant-picker-${currentSectionId} [data-is-variant-image-swatch="true"]`
      );
      if (variantSwatchesSource && variantSwatchesDestination) {
        const quickViewModal = this.closest("quick-view-modal");
        if (quickViewModal) {
          variantSwatchesDestination.innerHTML =
            variantSwatchesSource.innerHTML.replaceAll(
              sourceSectionId,
              `quickview-${sourceSectionId}`
            );
        } else {
          variantSwatchesDestination.innerHTML =
            variantSwatchesSource.innerHTML;
        }
      }
    }

    // product media
    if (
      this.dataset?.variantMediaDisplay !== "show_all" ||
      this.isCombinedListingsNeedUpdate
    ) {
      const mediaSource = html.querySelector(
        `[data-section="product-media-${sourceSectionId}"]`
      );
      const mediaDestination = document.querySelector(
        `[data-section="product-media-${currentSectionId}"]`
      );
      if (mediaSource && mediaDestination) {
        mediaDestination.innerHTML = mediaSource.innerHTML;

        const parentQuickView = this.closest("quick-view-modal");
        const parentFeaturedProduct = this.closest(".featured-product-section");
        if (parentQuickView) {
          if (typeof parentQuickView.removeDOMElements === "function") {
            parentQuickView.removeDOMElements(mediaDestination);
          }
          if (typeof parentQuickView.initSlider === "function") {
            parentQuickView.initSlider();
          }
        } else if (parentFeaturedProduct) {
          const section = document.getElementById(
            `shopify-section-${currentSectionId}`
          );

          if (section && typeof window.initFeaturedProduct === "function") {
            window.initFeaturedProduct(section);
          }
        } else {
          const section = document.getElementById(
            `shopify-section-${currentSectionId}`
          );

          if (section && typeof initProductPage === "function") {
            initProductPage(section);
          }
        }
      }
    }
  }

  // methods for high variant products
  getSelectedValuesIds() {
    const controls = [...this.querySelectorAll(".product-form__controls")];

    controls.sort((a, b) => {
      return (
        Number(a.dataset.optionPosition) - Number(b.dataset.optionPosition)
      );
    });

    return controls.map((control) => {
      const checkedInput = control.querySelector('input[type="radio"]:checked');
      return checkedInput?.dataset?.optionValueId
        ? checkedInput.dataset.optionValueId
        : null;
    });
  }

  createRequestUrl({
    currentVariantId = "",
    selectedValuesIds = [],
    combinedProductURL = "",
  }) {
    const productUrl = combinedProductURL || `${this.dataset.url}`;
    const sectionId = this.dataset.originalSection
      ? this.dataset.originalSection
      : this.dataset.section;

    if (currentVariantId) {
      return `${productUrl}?variant=${currentVariantId}&section_id=${sectionId}`;
    }

    // -----
    // for high-variant products
    // and if variant not found in liquid <script data-all-variants-no-high>
    if (selectedValuesIds.length) {
      const params = [];
      params.push(`section_id=${sectionId}`);
      params.push(`option_values=${selectedValuesIds.join(",")}`);
      return `${productUrl}?${params.join("&")}`;
    }
    // -----
  }

  setCurrentVariantAfterFetch(html) {
    // attr data-original-section use for Quick view modal
    const sourceSectionId = this.dataset.originalSection
      ? this.dataset.originalSection
      : this.dataset.section;

    const variantPickerSource = html.getElementById(
      `variant-picker-${sourceSectionId}`
    );
    const variantPickerDestionation = document.getElementById(
      `variant-picker-${this.dataset.section}`
    );
    if (!variantPickerSource) return;

    const newVariantDataEl = variantPickerSource.querySelector(
      "[data-selected-variant]"
    );
    if (!newVariantDataEl) return;

    const newVariantData = variantPickerSource.querySelector(
      "[data-selected-variant]"
    ).innerHTML;

    const selectedVariant = !!newVariantData
      ? JSON.parse(newVariantData)
      : null;

    this.currentVariant = selectedVariant;

    const oldEl = variantPickerDestionation.querySelector(
      "[data-selected-variant]"
    );
    if (oldEl) {
      oldEl.innerHTML = newVariantData;
    }
  }

  updatePickerInnerHtml(html) {
    // attr data-original-section use for Quick view modal
    const currentSectionId = this.dataset.section;
    const sourceSectionId = this.dataset.originalSection
      ? this.dataset.originalSection
      : this.dataset.section;

    const variantPickerSource = html.getElementById(
      `variant-picker-${sourceSectionId}`
    );
    const variantPickerDestination = document.getElementById(
      `variant-picker-${currentSectionId}`
    );

    if (variantPickerSource && variantPickerDestination) {
      const quickViewModal = this.closest("quick-view-modal");
      if (quickViewModal) {
        variantPickerDestination.innerHTML =
          variantPickerSource.innerHTML.replaceAll(
            sourceSectionId,
            `quickview-${sourceSectionId}`
          );
      } else {
        variantPickerDestination.innerHTML = variantPickerSource.innerHTML;
      }
    }
  }
}

if (!customElements.get("variant-selects")) {
  customElements.define("variant-selects", VariantSelects);
}

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute("value"))) {
        input.classList.remove("disabled");
        input.disabled = false;
      } else {
        input.classList.add("disabled");
        //input.disabled = true;
      }
    });
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll("fieldset"));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll("input")).find(
        (radio) => radio.checked
      ).value;
    });
  }
}

if (!customElements.get("variant-radios")) {
  customElements.define("variant-radios", VariantRadios);
}

class VariantDropdownSelect extends HTMLElement {
  constructor() {
    super();

    this.currentEl = this.querySelector(".dropdown-select__current");
    this.optionsWrapperEl = this.querySelector(".dropdown-select__options");
    this.hiddenInput = this.querySelector("input[type='hidden']");
    if (!this.currentEl || !this.optionsWrapperEl || !this.hiddenInput) return;

    this.optionsEls = Array.from(this.optionsWrapperEl.querySelectorAll("li"));
    this.inputs = Array.from(this.optionsWrapperEl.querySelectorAll("input"));
    this.hasColorSwatch = this.currentEl?.classList?.contains(
      "dropdown-select__current--with-color"
    );
    this.isActive = false;

    this.optionPosition = this.getOptionPosition();
    this._onCurrentClick = this.onCurrentClick.bind(this);
    this._onKeyUp = this.onKeyUp.bind(this);
    this._onOptionsClick = this.onClickOption.bind(this);
    this._onKeyUpOptions = this.onKeyUpOptions.bind(this);
    this._onOutsideClick = this.onOutsideClick.bind(this);
  }

  connectedCallback() {
    this.currentEl.addEventListener("click", this._onCurrentClick);
    this.currentEl.addEventListener("keyup", this._onKeyUp);
    this.currentEl.addEventListener("dblclick", this.preventDoubleClick);
    this.optionsWrapperEl.addEventListener("click", this._onOptionsClick);
    this.optionsWrapperEl.addEventListener("keyup", this._onKeyUpOptions);
    document.addEventListener("click", this._onOutsideClick);
  }

  disconnectedCallback() {
    this.currentEl.removeEventListener("click", this._onCurrentClick);
    this.currentEl.removeEventListener("keyup", this._onKeyUp);
    this.currentEl.removeEventListener("dblclick", this.preventDoubleClick);
    this.optionsWrapperEl.removeEventListener("click", this._onOptionsClick);
    this.optionsWrapperEl.removeEventListener("keyup", this._onKeyUpOptions);
    document.removeEventListener("click", this._onOutsideClick);
  }

  onCurrentClick(event) {
    event.stopPropagation();
    if (this.isActive) {
      this.onClose();
    } else {
      this.onOpen();
    }
  }

  onKeyUp(event) {
    if (event.code?.toUpperCase() === "ENTER") {
      event.preventDefault();
      event.stopPropagation();
      if (this.isActive) {
        this.onClose();
      } else {
        this.onOpen();
      }
    }
  }

  preventDoubleClick(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  onClickOption(event) {
    const optionEl = event.target.closest("li");
    const currentValueEl = this.currentEl.querySelector(
      "[data-dropdown-current-value]"
    );

    if (
      !optionEl ||
      !currentValueEl ||
      !this.optionsWrapperEl.contains(optionEl)
    ) {
      event.preventDefault();
      return;
    }

    const newValue = optionEl.dataset.value;

    currentValueEl.textContent = newValue;
    this.hiddenInput.value = newValue;

    if (this.hasColorSwatch) {
      const newColor = optionEl.dataset.color;
      this.hiddenInput.dataset.colorSwatch = newColor;
      this.currentEl.style.setProperty("--swatch-color", newColor);
    }

    this.hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));

    this.inputs.forEach((el) => el.removeAttribute("checked"));
    if (event.target.tagName === "INPUT") {
      event.target.setAttribute("checked", "true");
    }

    this.onClose();
    this.currentEl.focus();
  }

  onKeyUpOptions(event) {
    if (event.code === "Escape" && this.isActive) {
      event.preventDefault();
      this.onClose();
      this.currentEl.focus();
    }
  }

  onOpen() {
    document.querySelectorAll("variant-dropdown-select").forEach((dropdown) => {
      if (dropdown !== this && typeof dropdown.onClose === "function") {
        dropdown.onClose();
      }
    });

    this.optionsWrapperEl.classList.add("active");
    this.currentEl.setAttribute("aria-expanded", "true");
    this.isActive = true;

    const currentIndex = this.inputs.findIndex((inp) =>
      inp.hasAttribute("checked")
    );
    this.inputs[currentIndex >= 0 ? currentIndex : 0]?.focus();
  }

  onClose() {
    this.optionsWrapperEl.classList.remove("active");
    this.currentEl.setAttribute("aria-expanded", "false");
    this.isActive = false;
  }

  onOutsideClick(event) {
    if (!this.isActive || this.contains(event.target)) return;
    this.onClose();
  }

  getOptionPosition() {
    const parentFieldset = this.closest(".product-form__controls");
    return Number(parentFieldset?.dataset?.optionPosition || -1);
  }

  updateCurrentOption(selectedValues = []) {
    // Method is used to synchronize after changes options in sticky bar.
    if (this.optionPosition === -1) return;
    const currentValueEl = this.currentEl.querySelector(
      "[data-dropdown-current-value]"
    );

    if (!currentValueEl || !selectedValues || !selectedValues.length) return;

    const newValue = selectedValues[this.optionPosition - 1];

    currentValueEl.textContent = newValue;
    this.hiddenInput.value = newValue;

    this.optionsEls.forEach((optionEl) => {
      const liDataValue = optionEl.dataset.value;
      if (newValue === liDataValue && this.hasColorSwatch) {
        const newColor = optionEl.dataset.color;
        this.hiddenInput.dataset.colorSwatch = newColor;
        this.currentEl.style.setProperty("--swatch-color", newColor);
      }
    });
  }
}

if (!customElements.get("variant-dropdown-select")) {
  customElements.define("variant-dropdown-select", VariantDropdownSelect);
}

class ProductForm extends HTMLElement {
  constructor() {
    super();

    if (this.querySelector("form")) {
      this.form = this.querySelector("form");
      this.form.querySelector("[name=id]").disabled = false;
      this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
    } else {
      this.querySelector("[name=id]").disabled = false;
      this.querySelector("button[type=submit]").addEventListener(
        "click",
        this.onSubmitHandler.bind(this)
      );
    }

    this.cartUIElement =
      document.querySelector("cart-notification") ||
      document.querySelector("cart-drawer");
    this.submitButton = this.querySelector('[type="submit"]');
    if (this.cartUIElement) {
      this.submitButton.setAttribute("aria-haspopup", "dialog");
    }

    this.hideErrors = this.dataset.hideErrors === "true";
  }

  onSubmitHandler(event) {
    event.preventDefault();
    if (this.submitButton.getAttribute("aria-disabled") === "true") return;

    this.handleErrorMessage();

    this.submitButton.setAttribute("aria-disabled", true);
    this.submitButton.classList.add("loading");

    const btnSpinner = this.submitButton.querySelector(
      ".loading-overlay__spinner"
    );
    if (btnSpinner) btnSpinner.classList.remove("hidden");

    const config = fetchConfig("javascript");
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    delete config.headers["Content-Type"];

    const formData = new FormData(this.form);
    if (!this.form) {
      formData.append("id", this.querySelector("[name=id]").value);
    }

    if (this.cartUIElement) {
      formData.append(
        "sections",
        this.cartUIElement.getSectionsToRender().map((section) => section.id)
      );
      formData.append("sections_url", window.location.pathname);
    }
    config.body = formData;

    fetch(`${routes.cart_add_url}`, config)
      .then((response) => response.json())
      .then((response) => {
        // If there is a status in the response, then this is an error
        // https://shopify.dev/docs/api/ajax/reference/cart#error-responses
        if (response.status) {
          publish(PUB_SUB_EVENTS.cartError, {
            source: "product-form",
            productVariantId: formData.get("id"),
            errors: response.errors || response.description,
            message: response.message,
          });
          this.handleErrorMessage(response.description);
          const soldOutMessage =
            this.submitButton.querySelector(".sold-out-message");
          if (!soldOutMessage) return;
          this.submitButton.setAttribute("aria-disabled", true);
          this.submitButton.querySelector("span").classList.add("hidden");
          soldOutMessage.classList.remove("hidden");
          this.error = true;
          return;
        } else if (!this.cartUIElement) {
          window.location = window.routes.cart_url;
          return;
        }

        if (!this.error) {
          publish(PUB_SUB_EVENTS.cartUpdate, {
            source: "product-form",
            productVariantId: formData.get("id"),
          });
        }
        this.error = false;

        let activeElement = document.activeElement;

        // add to cart from quick-view modal
        const quickAddModal = this.closest("quick-view-modal");
        if (quickAddModal && typeof quickAddModal?.hide === "function") {
          activeElement = quickAddModal.openedBy;
          document.body.addEventListener(
            "quick-view-closed",
            () => {
              setTimeout(() => {
                this.cartUIElement.setActiveElement(activeElement);
                this.cartUIElement.renderContents(response);
              });
            },
            { once: true }
          );
          quickAddModal.hide(true);
          return;
        }

        // add to cart from product card
        const productCard = this.closest("product-card");
        if (productCard) {
          const link = productCard.querySelector(".product-card__link-overlay");
          if (link) activeElement = link;
        }

        // open cart drawer after add to cart
        this.cartUIElement.setActiveElement(activeElement);
        this.cartUIElement.renderContents(response);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        this.submitButton.classList.remove("loading");
        if (this.cartUIElement.closest("cart-notification")) {
          const cartDrawer = document.querySelector("cart-drawer");
          if (cartDrawer && cartDrawer.classList.contains("is-empty")) {
            cartDrawer.classList.remove("is-empty");
          }
          const drawerItems = cartDrawer?.querySelector("cart-drawer-items");
          setHasScrollClass(drawerItems);
        }
        if (!this.error) this.submitButton.removeAttribute("aria-disabled");
        if (btnSpinner) btnSpinner.classList.add("hidden");
      });
  }

  handleErrorMessage(errorMessage = "") {
    if (this.hideErrors) return;

    const errorWrapperEl =
      this.querySelector(".product-form__error-message-wrapper") ||
      this.closest("product-card")?.querySelector(".product-card__error");
    const errorTextEl =
      errorWrapperEl?.querySelector(".product-form__error-message") ||
      errorWrapperEl;
    if (!errorWrapperEl || !errorTextEl) return;

    if (errorMessage) {
      errorWrapperEl.removeAttribute("hidden", true);
      errorTextEl.textContent = errorMessage;
    } else {
      errorWrapperEl.setAttribute("hidden", true);
      errorTextEl.textContent = "";
    }
  }
}

if (!customElements.get("product-form")) {
  customElements.define("product-form", ProductForm);
}

class PasswordViewer {
  constructor() {
    const passwordField = document.querySelectorAll(".field--pass");

    passwordField.forEach((el) => {
      const input = el.querySelector("input");
      const btnWrapper = el.querySelector(".button-pass-visibility");
      const btnOpen = el.querySelector(".icon-eye-close");
      const btnClose = el.querySelector(".icon-eye");

      input.addEventListener("input", () => {
        input.value !== ""
          ? (btnWrapper.style.display = "block")
          : (btnWrapper.style.display = "none");
      });

      btnOpen.addEventListener("click", () => {
        input.type = "text";
        btnOpen.style.display = "none";
        btnClose.style.display = "block";
      });

      btnClose.addEventListener("click", () => {
        input.type = "password";
        btnOpen.style.display = "block";
        btnClose.style.display = "none";
      });
    });
  }
}

class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
    this.recommendationsSlider = null;
  }

  connectedCallback() {
    if (this._initialized) return;
    this.initProductRecommendations();
  }

  initProductRecommendations() {
    this.enableLoading();

    fetch(this.dataset.url)
      .then((response) => response.text())
      .then((text) => {
        const html = document.createElement("div");
        html.innerHTML = text;
        const recommendations = html.querySelector("product-recommendations");
        if (recommendations && recommendations.innerHTML.trim().length) {
          //this.innerHTML = recommendations.innerHTML;
          this.replaceChildren(...recommendations.children);
        }

        this.checkSlider();
        if (this.dataset?.isComplementary === "true") {
          this.initComplementarySlider();
        }
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        this.disableLoading();
        this._initialized = true;
      });
  }

  initSlider() {
    const sliderEl = this.querySelector(".js-recommendation-slider");

    if (!sliderEl) return;

    const prevBtn = this.querySelector(
      ".heading-group__navigation-button-prev"
    );
    const nextBtn = this.querySelector(
      ".heading-group__navigation-button-next"
    );
    const productsPerRow = Number(sliderEl.dataset.productsPerRow || 4);
    const productsPerRowMobile = Number(
      sliderEl.dataset.productsPerRowMobile || 1
    );
    const spaceBetween = Number(sliderEl.dataset.spaceBetween || 1);
    const slidesPerViewMobile = productsPerRowMobile;
    const slidesPerView576 = productsPerRow > 1 ? 2 : 1;
    const slidesPerView990 =
      productsPerRow > 2 ? slidesPerView576 + 1 : slidesPerView576;
    const slidesPerView1200 = productsPerRow >= 4 ? 4 : productsPerRow;
    const slidesPerView1360 = productsPerRow;

    const sliderSettings = {
      slidesPerView: slidesPerViewMobile,
      spaceBetween: spaceBetween,
      speed: 800,
      watchSlideProgress: true,
      allowTouchMove: true,
      mousewheel: {
        forceToAxis: true,
      },
      navigation: {
        nextEl: nextBtn,
        prevEl: prevBtn,
        disabledClass: "swiper-button-disabled",
      },
      breakpoints: {
        576: {
          slidesPerView: slidesPerView576,
        },
        990: {
          slidesPerView: slidesPerView990,
        },
        1200: {
          slidesPerView: slidesPerView1200,
        },
        1360: {
          slidesPerView: slidesPerView1360,
        },
      },
    };

    this.recommendationsSlider = new Swiper(sliderEl, sliderSettings);
  }

  destroySlider() {
    if (this.recommendationsSlider) {
      this.recommendationsSlider.destroy();
      this.recommendationsSlider = null;
    }
  }

  checkSlider() {
    const layout = this.dataset.layout || "grid";

    if (layout === "slider") {
      this.initSlider();
    } else {
      this.destroySlider();
    }
  }

  initComplementarySlider() {
    const sliderEl = this.querySelector(".js-complementary-slider");
    if (!sliderEl) return;

    const prevBtn = this.querySelector(
      ".heading-group__navigation-button-prev"
    );
    const nextBtn = this.querySelector(
      ".heading-group__navigation-button-next"
    );

    const sliderSettings = {
      slidesPerView: 1,
      spaceBetween: 8,
      speed: 800,
      watchSlideProgress: true,
      allowTouchMove: true,
      mousewheel: {
        forceToAxis: true,
      },
      navigation: {
        nextEl: nextBtn,
        prevEl: prevBtn,
        disabledClass: "swiper-button-disabled",
      },
    };

    new Swiper(sliderEl, sliderSettings);
  }

  enableLoading() {
    const loadingEl = this.querySelector(".product-recommendations__loading");
    if (loadingEl) {
      loadingEl.classList.add("loading");
      loadingEl.style.display = "flex";
    }
  }

  disableLoading() {
    const loadingEl = this.querySelector(".product-recommendations__loading");
    if (loadingEl) {
      loadingEl.classList.remove("loading");
      loadingEl.remove();
    }
  }
}

if (!customElements.get("product-recommendations")) {
  customElements.define("product-recommendations", ProductRecommendations);
}

class LocalizationForm extends HTMLElement {
  constructor() {
    super();
    this.elements = {
      input: this.querySelector(
        'input[name="locale_code"], input[name="country_code"]'
      ),
      langInput: this.querySelector('input[name="locale_code"]'),
      countryInput: this.querySelector('input[name="country_code"]'),
      button: this.querySelector("button"),
      panel: this.querySelector("ul"),
    };

    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.elements.button.addEventListener("click", this.togglePanel.bind(this));
    this.addEventListener("keydown", this.onEscapePress.bind(this));

    this.querySelectorAll("a").forEach((item) =>
      item.addEventListener("click", this.onItemClick.bind(this))
    );
  }

  connectedCallback() {
    document.addEventListener("click", this.handleDocumentClick);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleDocumentClick);
  }

  handleDocumentClick(event) {
    if (!this.contains(event.target)) {
      this.hidePanel();
    }
  }

  hidePanel() {
    this.elements.button.setAttribute("aria-expanded", "false");
    this.elements.panel.setAttribute("hidden", true);
  }

  showPanel() {
    this.elements.button.setAttribute("aria-expanded", "true");
    this.elements.panel.removeAttribute("hidden");
  }

  togglePanel() {
    if (this.elements.button.getAttribute("aria-expanded") === "true") {
      this.hidePanel();
    } else {
      this.showPanel();
    }
  }

  onEscapePress(event) {
    if (event.key === "Escape") {
      this.hidePanel();
    }
  }

  onItemClick(event) {
    event.preventDefault();
    this.elements.input.value = event.currentTarget.dataset.value;
    this.querySelector("form")?.submit();
    this.hidePanel();
  }
}

if (!customElements.get("localization-form")) {
  customElements.define("localization-form", LocalizationForm);
}

class ModalLocalizationForm extends LocalizationForm {
  constructor() {
    super();

    this.selectedEl = this.querySelector("button .localization-value-label");
  }

  // item click without submit
  onItemClick(event) {
    event.preventDefault();
    const newValue = event.currentTarget.dataset.value;
    if (!newValue) return;

    const newLabel = event.currentTarget.dataset.label;
    if (this.selectedEl && newLabel) {
      this.selectedEl.textContent = newLabel;
    }

    if (this.classList.contains("modal-language-form")) {
      document.querySelectorAll("modal-localization-form").forEach((el) => {
        el.elements.langInput.value = newValue;
      });
    }

    if (this.classList.contains("modal-country-form")) {
      document.querySelectorAll("modal-localization-form").forEach((el) => {
        el.elements.countryInput.value = newValue;
      });
    }

    this.hidePanel();
  }
}

if (!customElements.get("modal-localization-form")) {
  customElements.define("modal-localization-form", ModalLocalizationForm);
}

class ModalRegionSelector extends HTMLElement {
  constructor() {
    super();

    this.header = document.querySelector(".header-wrapper");
    this.toggle = this.querySelector(".modal-region-toggle");
    this.modalContainer = this.querySelector(".region-modal");
    this.closeButton =
      this.querySelector(".modal-close-button") ||
      this.querySelector(".mobile-submenu__back");
    this.overlayEl = this.querySelector(".modal__overlay");
    this.submitButton = this.querySelector(".region-modal__button");
    this.languageForm = this.querySelector(".modal-language-form form");
    this.countryForm = this.querySelector(".modal-country-form form");
    this.modalType = this.dataset?.modalType || "drawer";

    if (this.header) this.header.preventHide = false;
  }

  connectedCallback() {
    this.modalContainer?.addEventListener("keyup", this.onEscClose.bind(this));
    this.toggle?.addEventListener("click", this.onOpen.bind(this));
    this.closeButton?.addEventListener("click", this.onClose.bind(this));
    this.overlayEl?.addEventListener("click", this.onClose.bind(this));
    this.submitButton?.addEventListener("click", this.onSubmit.bind(this));
  }

  onEscClose(event) {
    if (event.code === "Escape") {
      this.onClose();
    }
  }

  onOpen() {
    this.setAttribute("open", true);
    this.modalContainer.classList.add("modal--open");
    if (this.modalType !== "mobile") {
      document.body.classList.add(`overflow-hidden-${this.modalType}`);
    }
    if (this.header) this.header.preventHide = true;

    if (this.modalContainer && this.closeButton) {
      trapFocus(this.modalContainer, this.closeButton);
    }
  }

  onClose() {
    this.removeAttribute("open");
    this.modalContainer.classList.remove("modal--open");
    if (this.modalType !== "mobile") {
      document.body.classList.remove(`overflow-hidden-${this.modalType}`);
    }
    if (this.header) this.header.preventHide = false;

    removeTrapFocus(this.toggle);
  }

  onSubmit(event) {
    event.preventDefault();

    if (this.countryForm && this.countryForm?.action) {
      this.countryForm.submit();
    }

    if (this.languageForm && this.languageForm?.action) {
      this.languageForm.submit();
    }
  }
}

if (!customElements.get("modal-region-selector")) {
  customElements.define("modal-region-selector", ModalRegionSelector);
}

class SearchForm extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input[type="search"]');
    this.resetBtn = this.querySelector(".search__button--reset");

    this.input?.form?.addEventListener("reset", this.onFormReset.bind(this));
    this.input?.addEventListener(
      "input",
      debounce((event) => {
        this.onChange(event);
      }, 300).bind(this)
    );

    this.resetBtn?.addEventListener("click", this.onFormReset.bind(this));
  }

  toggleResetBtn(value) {
    if (!this.resetBtn) return;

    if (value) {
      this.resetBtn.style.display = "flex";
    } else {
      this.resetBtn.style.display = "none";
    }
  }

  onChange(event) {
    this.toggleResetBtn(event.target.value);
  }

  shouldResetForm() {
    return !document.querySelector('[aria-selected="true"] a');
  }

  onFormReset(event) {
    // Prevent default so the form reset doesn't set the value gotten from the url on page load
    event.preventDefault();
    // Don't reset if the user has selected an element on the predictive search dropdown
    if (this.shouldResetForm() && this.input) {
      this.input.value = "";
      this.input.focus();
      this.toggleResetBtn("");
    }
  }
}

if (!customElements.get("search-form")) {
  customElements.define("search-form", SearchForm);
}

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector("details");
    this.closeBtn = this.mainDetailsToggle?.querySelector(
      ".modal__heading > .modal-close-button"
    );
    this.backBtn =
      this.mainDetailsToggle?.querySelector(
        "summary + .mobile-submenu > .mobile-submenu__back"
      ) ||
      this.mainDetailsToggle?.querySelector(
        "summary + .burger-menu__submenu > .burger-menu__submenu-back"
      );
    const summaryElements = this.querySelectorAll("summary");
    this.addAccessibilityAttributes(summaryElements);

    this.headerWrapper = document.querySelector(".header-wrapper");
    if (this.headerWrapper) this.headerWrapper.preventHide = false;

    this.addEventListener("keyup", this.onKeyUp.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll("summary").forEach((summary) =>
      summary.addEventListener("click", this.onSummaryClick.bind(this))
    );
    this.closeBtn?.addEventListener(
      "click",
      this.onCloseButtonClick.bind(this)
    );
    this.backBtn?.addEventListener("click", this.onCloseButtonClick.bind(this));
  }

  addAccessibilityAttributes(summaryElements) {
    summaryElements.forEach((element) => {
      element.setAttribute("role", "button");
      element.setAttribute("aria-expanded", false);
      element.setAttribute("aria-controls", element.nextElementSibling.id);
    });
  }

  onKeyUp(event) {
    if (event.code.toUpperCase() !== "ESCAPE") return;

    const openDetailsElement = event.target.closest("details[open]");
    if (!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle
      ? this.closeMenuDrawer(this.mainDetailsToggle.querySelector("summary"))
      : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const isOpen = detailsElement.hasAttribute("open");

    if (detailsElement === this.mainDetailsToggle) {
      if (isOpen) event.preventDefault();
      isOpen
        ? this.closeMenuDrawer(summaryElement)
        : this.openMenuDrawer(summaryElement);
    } else {
      trapFocus(
        summaryElement.nextElementSibling,
        detailsElement.querySelector("button")
      );

      setTimeout(() => {
        detailsElement.classList.add("menu-opening");
      });
    }
  }

  openMenuDrawer(summaryElement) {
    if (this.headerWrapper) this.headerWrapper.preventHide = true;
    setTimeout(() => {
      this.mainDetailsToggle.classList.add("menu-opening");
    });
    summaryElement.setAttribute("aria-expanded", true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    if (!this.closest("header-drawer") && !this.closest("burger-menu")) {
      document.body.classList.add(`overflow-hidden`);
    }
  }

  closeMenuDrawer(elementToFocus) {
    //if (!elementToFocus) return;
    this.mainDetailsToggle.classList.remove("menu-opening");

    if (!this.closest("burger-menu")) {
      // in desktop burger all <details> elements are always open
      this.mainDetailsToggle.querySelectorAll("details").forEach((details) => {
        details.removeAttribute("open");
        details.classList.remove("menu-opening");
        details.querySelector("summary").setAttribute("aria-expanded", false);
      });
    }

    this.mainDetailsToggle
      .querySelector("summary")
      .setAttribute("aria-expanded", false);

    document.body.classList.remove("overflow-hidden");
    if (elementToFocus) removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);
    if (this.headerWrapper) this.headerWrapper.preventHide = false;
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest("details");
    if (!detailsElement) return;
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    detailsElement?.classList.remove("menu-opening");
    removeTrapFocus();
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute("open");
        if (detailsElement.closest("details[open]")) {
          trapFocus(
            detailsElement.closest("details[open]"),
            detailsElement.querySelector("summary")
          );
        }
      }
    };

    window.requestAnimationFrame(handleAnimation);
  }
}

if (!customElements.get("menu-drawer")) {
  customElements.define("menu-drawer", MenuDrawer);
}

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
    this.header = document.querySelector(".shopify-section-header");
    this.headerWrapper = document.querySelector(".header-wrapper");
    if (this.headerWrapper) this.headerWrapper.preventHide = false;
    this.openBtn = this.querySelector("summary.menu-drawer-icon");
    this.closeBtn = this.querySelector("#mobile-menu-close-btn");
    this.isOpen = false;

    this.closeBtn?.addEventListener("click", () => {
      this.closeMenuDrawer(this.openBtn);
    });
  }

  openMenuDrawer(summaryElement) {
    if (this.headerWrapper) this.headerWrapper.preventHide = true;
    setTimeout(() => {
      this.mainDetailsToggle.classList.add("menu-opening");
    });
    summaryElement.setAttribute("aria-expanded", true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add("overflow-hidden-mobile-menu");
    this.isOpen = true;
    this.openScrollY = window.scrollY;

    // styles for forced disable body scroll on iOS
    this.lockScrollBodyOnIos();
  }

  closeMenuDrawer(elementToFocus) {
    if (!elementToFocus) return;
    this.mainDetailsToggle.classList.remove("menu-opening");
    this.mainDetailsToggle.querySelectorAll("details").forEach((details) => {
      details.removeAttribute("open");
      details.classList.remove("menu-opening");
    });
    this.querySelector("header-search")?.close();
    this.mainDetailsToggle
      .querySelector("summary")
      .setAttribute("aria-expanded", false);
    document.body.classList.remove("overflow-hidden-mobile-menu");
    document.body.classList.remove("overflow-hidden");
    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);

    // styles for forced disable body scroll on iOS
    this.unlockScorllBodyOnIos();

    if (this.headerWrapper) this.headerWrapper.preventHide = false;
    this.isOpen = false;
  }

  lockScrollBodyOnIos() {
    if (navigator.userAgent.indexOf("iPhone") > -1) {
      if (this.iosTimeoutId) clearTimeout(this.iosTimeoutId);
      if (
        this.headerWrapper &&
        typeof this.headerWrapper.disableScroll === "function"
      ) {
        this.headerWrapper.disableScroll();
      }
      document.documentElement.style.setProperty(
        "--current-body-scroll",
        `${-1 * this.openScrollY}px`
      );
      document.documentElement.style.setProperty("scroll-behavior", "unset");

      this.iosTimeoutId = setTimeout(function () {
        document.body.classList.add("forced-scroll-locked");
      }, 400);
    }
  }

  unlockScorllBodyOnIos() {
    if (navigator.userAgent.indexOf("iPhone") > -1) {
      document.body.classList.remove("forced-scroll-locked");
      //window.scrollTo(0, this.openScrollY);
      document.documentElement.scrollTop = this.openScrollY;
      document.documentElement.style.removeProperty("--current-body-scroll");
      document.documentElement.style.removeProperty("scroll-behavior");
      if (
        this.headerWrapper &&
        typeof this.headerWrapper.enableScroll === "function"
      ) {
        this.headerWrapper.enableScroll();
      }
    }
  }
}

if (!customElements.get("header-drawer")) {
  customElements.define("header-drawer", HeaderDrawer);
}

const links = document.links; 
  for (let i = 0, linksLength = links.length ; i < linksLength ; i++) { 
    if (links[i].hostname !== window.location.hostname) { 
      links[i].target = '_blank'; 
      links[i].rel = 'noreferrer noopener'; 
  } 
}
