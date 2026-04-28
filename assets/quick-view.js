if (!customElements.get("quick-view-modal")) {
  customElements.define(
    "quick-view-modal",
    class QuickViewModal extends ModalDialog {
      constructor() {
        super();
        this.modalContent = this.querySelector('[id^="QuickViewInfo-"]');
        this.pauseVideo = this.modalContent.dataset.pauseVideo == 'false' ? false : true;
        if (!this.modalContent) return;
      }

      hide(preventFocus = false) {
        this.modalContent.innerHTML = "";

        if (preventFocus) this.openedBy = null;

        super.hide(this.pauseVideo);

        document.body.dispatchEvent(new CustomEvent("quick-view-closed"));
      }

      show(opener) {
        if (!opener || !opener?.dataset?.productUrl) return;

        opener.setAttribute("aria-disabled", true);
        opener.classList.add("loading");
        const btnSpinner = opener.querySelector(".loading-overlay__spinner");
        if (btnSpinner) btnSpinner.classList.remove("hidden");

        fetch(opener.dataset.productUrl)
          .then((response) => response.text())
          .then((responseText) => {
            const responseHTML = new DOMParser().parseFromString(
              responseText,
              "text/html"
            );
            this.productElement = responseHTML.querySelector(
              '[id^="MainProduct-"]'
            );
            if (!this.productElement) return;

            this.prepareProductHTML();
            this.setModalHTML(opener);
            this.initSlider();
            this.initShopifyElements();
            super.show(opener, this.pauseVideo);
            this.setFocusElement(opener);
          })
          .finally(() => {
            opener.removeAttribute("aria-disabled");
            opener.classList.remove("loading");
            if (btnSpinner) btnSpinner.classList.add("hidden");
          });
      }

      prepareProductHTML() {
        this.preventDuplicatedIDs();
        this.removeDOMElements(this.productElement);
      }

      removeDOMElements(mainProductElement) {
        const selectors = [
          ".product-popup",
          ".product__description",
          ".product__share",
          ".product__breadcrumbs",
          ".product__badges",
          ".product__tags",
          ".product__tax",
          ".product__installment",
          ".product-sticky-add-bar",
          "product-modal",
          ".pickup-availability",
          ".avaliability-notification",
          "avaliability-notification-drawer",
          ".complementary-products",
          ".product__divider",
          ".product__media-toggle",
          ".product__media-mobile-icon",
          ".product__media-cursor",
          ".product__media-info",
          "[data-avaliability-notification-script]",
          ".custom-liquid",
          ".dropdown-accordion",
          ".product-app",
        ];
        const removingElements = mainProductElement.querySelectorAll(
          selectors.join(", ")
        );
        removingElements.forEach((el) => el.remove());
      }

      preventDuplicatedIDs() {
        const sectionId = this.productElement.dataset.section;
        this.productElement.innerHTML =
          this.productElement.innerHTML.replaceAll(
            sectionId,
            `quickview-${sectionId}`
          );
        this.productElement
          .querySelectorAll("variant-selects, variant-radios")
          .forEach((variantSelect) => {
            variantSelect.dataset.originalSection = sectionId;
          });
      }

      setModalHTML(opener) {
        this.modalContent.innerHTML = this.productElement.innerHTML;

        this.reinjectScriptTags();
        this.createFullDetailsButton(opener);
        this.preventScrollBody();
        this.preventVariantURLSwitching();
        this.clearMediaClasses();
        this.reorderBlocks();
        if (this.classList.contains("quick-view-modal--drawer")) {
          this.updateImageSizesDrawer();
        }
      }

      reinjectScriptTags() {
        // Reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
        this.modalContent.querySelectorAll("script").forEach((oldScriptTag) => {
          const newScriptTag = document.createElement("script");
          Array.from(oldScriptTag.attributes).forEach((attribute) => {
            newScriptTag.setAttribute(attribute.name, attribute.value);
          });
          newScriptTag.appendChild(
            document.createTextNode(oldScriptTag.innerHTML)
          );
          oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
        });
      }

      preventVariantURLSwitching() {
        const variantPickerEl = this.modalContent.querySelector(
          "variant-radios,variant-selects"
        );
        if (variantPickerEl) {
          variantPickerEl.setAttribute("data-update-url", "false");
        }
      }

      preventScrollBody() {
        this.modalContent
          .querySelectorAll(".product-form__controls-group input[type=radio]")
          .forEach((input) => {
            input.addEventListener("focus", (e) => {
              const scrollTop =
                document.body.scrollTop || document.documentElement.scrollTop;
              setTimeout(() => {
                window.scrollTo(0, scrollTop);
              }, 0);
            });
          });
      }

      initShopifyElements() {
        if (window.Shopify && Shopify.PaymentButton) {
          Shopify.PaymentButton.init();
        }

        if (window.ProductModel) {
          window.ProductModel.loadShopifyXR();
        }
      }

      initSlider() {
        const sliderEl = this.modalContent.querySelector(
          ".product__media-list[data-quick-view-type]"
        );
        if (!sliderEl) return;

        const sliderWrapper = sliderEl.querySelector(
          ".product__media-list-container"
        );
        const slides = sliderEl.querySelectorAll(".product__media-item");
        const buttonPrev = sliderEl.querySelector(".swiper-button-prev");
        const buttonNext = sliderEl.querySelector(".swiper-button-next");
        if (!sliderWrapper || slides.length < 2) {
          if (buttonPrev) buttonPrev.remove();
          if (buttonNext) buttonNext.remove();
          return;
        }

        const quickViewType = sliderEl.dataset.quickViewType;

        sliderWrapper.classList.add("swiper-wrapper");
        slides.forEach((slide) => slide.classList.add("swiper-slide"));

        let slideCountEl = null;
        if (quickViewType === "popup") {
          slideCountEl = this.createSlideCountElement();
          if (slideCountEl) sliderEl.appendChild(slideCountEl);
        }

        new Swiper(sliderEl, {
          slidesPerView: quickViewType === "drawer" ? "auto" : 1,
          spaceBetween: 8,
          speed: 800,
          loop: false,
          watchSlideProgress: true,
          allowTouchMove: true,
          mousewheel: {
            forceToAxis: true,
          },
          grabCursor: quickViewType === "drawer" ? true : false,
          navigation: {
            nextEl: buttonNext,
            prevEl: buttonPrev,
            disabledClass: "swiper-button-disabled",
          },
          on: {
            init: function () {
              if (slideCountEl) {
                const totalSlides = this.slides.length;
                slideCountEl.textContent = `1/${totalSlides}`;
              }
            },
            slideChange: function () {
              if (slideCountEl) {
                const activeSlide = this.activeIndex + 1;
                const totalSlides = this.slides.length;
                slideCountEl.textContent = `${activeSlide}/${totalSlides}`;
              }
            },
          },
        });
      }

      createFullDetailsButton(opener) {
        const buttonsWrapper = this.modalContent.querySelector(
          ".product-form__buttons"
        );
        if (!buttonsWrapper || !opener?.dataset?.productUrl) return;

        const moreBtn = document.createElement("a");
        moreBtn.innerHTML = `<span>${theme.quickviewMore}</span>`;
        moreBtn.setAttribute("href", opener.dataset.productUrl);
        moreBtn.setAttribute(
          "class",
          "product__full-details button button--tertiary focus-inset"
        );

        buttonsWrapper.appendChild(moreBtn);
      }

      createDescriptionElement() {
        const hiddenEl = this.querySelector("[data-qv-product-description]");
        if (!hiddenEl) return;

        const content = hiddenEl.textContent?.trim();
        if (!content) return;

        const clone = hiddenEl.cloneNode(true);
        clone.removeAttribute("data-qv-product-description");
        clone.removeAttribute("style");
        clone.removeAttribute("aria-disabled");

        return clone;
      }

      clearMediaClasses() {
        const mediaWrapper = this.modalContent.querySelector(".product__media");
        if (!mediaWrapper) return;

        const keepClasses = ["product__media", "product__media--no-media"];
        const filteredClasses = [...mediaWrapper.classList].filter((cssClass) =>
          keepClasses.includes(cssClass)
        );

        mediaWrapper.className = filteredClasses.join(" ");

        if (this.classList.contains("quick-view-modal--drawer")) {
          mediaWrapper.querySelectorAll("deferred-media").forEach((el) => {
            el.remove();
          });
        }
      }

      reorderBlocks() {
        const infoContainer = this.modalContent.querySelector(
          ".product__info-container"
        );
        if (!infoContainer) return;

        const needOrder = [
          ".product__text",
          ".product__title",
          ".product__price",
          ".product__sku",
          ".product__description",
          ".product__media", // product__media reordered only for drawer type
          ".product-icon-with-text",
          ".product__inventory",
          ".product-parameters",
          ".product-extra-option",
          ".product__buy-buttons",
        ];

        const multipleBlockSelectors = [
          ".product__text",
          ".product-icon-with-text",
          ".product-extra-option",
        ];

        const orderedElements = [];

        needOrder.forEach((selector) => {
          // skip .product__media for popup type
          if (
            this.classList.contains("quick-view-modal--popup") &&
            selector === ".product__media"
          ) {
            return;
          }

          // special handling for .product__description
          if (selector === ".product__description") {
            const description = this.createDescriptionElement();
            if (description) orderedElements.push(description);
            return;
          }

          // for multiple elements (block limit != 1)
          if (multipleBlockSelectors.includes(selector)) {
            const elements = this.modalContent.querySelectorAll(selector);
            elements.forEach((el) => orderedElements.push(el));
            return;
          }

          // for single element
          const element = this.modalContent.querySelector(selector);
          if (element) orderedElements.push(element);
        });

        orderedElements.forEach((el) => {
          infoContainer.appendChild(el);
        });
      }

      updateImageSizesDrawer() {
        const mediaImages = this.modalContent.querySelectorAll(
          ".product__media-img img"
        );
        if (!mediaImages.length) return;

        let mediaImageSizes = "282px"; // image width 94px * 3 DPR
        mediaImages.forEach((img) =>
          img.setAttribute("sizes", mediaImageSizes)
        );
      }

      createSlideCountElement() {
        const element = document.createElement("div");
        element.classList.add("product__media-list-count", "body-small");
        return element;
      }

      setFocusElement(opener) {
        const productCard = opener.closest("product-card");
        const productCardLink = productCard?.querySelector(
          ".product-card__link-overlay"
        );
        if (productCardLink) this.openedBy = productCardLink;
      }
    }
  );
}
