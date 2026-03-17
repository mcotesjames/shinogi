if (!customElements.get("avaliability-notification-drawer")) {
  customElements.define(
    "avaliability-notification-drawer",
    class AvaliabilityNotificationDrawer extends HTMLElement {
      constructor() {
        super();

        const closeElementsSelectors = [
          ".avaliability-notification-drawer-close",
          ".avaliability-notification-overlay",
        ];

        this.querySelectorAll(closeElementsSelectors).forEach((closeEl) => {
          closeEl.addEventListener("click", () => {
            this.hide();
          });
        });

        this.openBtn = document.querySelector(
          ".avaliability-notification-open-btn"
        );

        this.openBtn?.addEventListener("click", (e) => {
          this.show(e.target);
        });

        this.variantChangeUnsubscriber = undefined;
      }

      connectedCallback() {
        if (this.moved) return;
        this.moved = true;
        document.body.appendChild(this);
        this.setOpenBtnStatus();

        this.variantChangeUnsubscriber = subscribe(
          PUB_SUB_EVENTS.variantChange,
          (event) => {
            const currentVariant = event.data.variant;
            this.resetStatus();
            this.updateInfo(currentVariant);
          }
        );
      }

      disconnectedCallback() {
        if (this.variantChangeUnsubscriber) {
          this.variantChangeUnsubscriber();
        }
      }

      hide() {
        this.removeAttribute("open");
        this.classList.remove("modal--open");
        document.body.classList.remove("overflow-hidden");
        removeTrapFocus(this.focusElement);
      }

      show(focusElement) {
        this.focusElement = focusElement;
        this.setAttribute("open", "");
        this.classList.add("modal--open");
        document.body.classList.add("overflow-hidden");

        this.addEventListener(
          "transitionend",
          () => {
            trapFocus(this, this.querySelector('[role="dialog"]'));
          },
          { once: true }
        );
      }

      setOpenBtnStatus() {
        const params = new URLSearchParams(window.location.search);
        const hash = window.location.hash;

        if (
          params.get("contact_posted") === "true" &&
          hash.includes("#AvaliabilityNotificationForm-")
        ) {
          const match = hash.match(/#(AvaliabilityNotificationForm-[\w\-]+)/);
          if (match && match[1]) {
            const form_id = match[1];
            const buttonId = `Button-${form_id}`;
            const button = document.getElementById(buttonId);

            if (button) {
              button.dataset.status = "success";
            }
          }
        }
      }

      updateInfo(currentVariant) {
        const formattedOptions =
          currentVariant.options.length > 1
            ? currentVariant.options.join(" / ")
            : currentVariant.options[0] || "";

        const optionsEl = this.querySelector(
          ".avaliability-notification-product-options"
        );
        const inputOptions = this.querySelector(
          "#AvaliabilityNotification-options"
        );

        if (optionsEl) optionsEl.textContent = formattedOptions;
        if (inputOptions) inputOptions.value = formattedOptions;

        const inputReturn = this.querySelector(
          "#AvaliabilityNotification-return"
        );

        if (inputReturn && inputReturn.value.includes("variant=")) {
          const newUrl = inputReturn.value.replace(
            /variant=\d+/,
            `variant=${currentVariant.id}`
          );
          inputReturn.value = newUrl;
        }
      }

      resetStatus() {
        const messages = this.querySelectorAll(".form__message");
        messages.forEach((el) => el.remove());

        if (this.openBtn) {
          this.openBtn.dataset.status = "false";
        }
      }
    }
  );
}
