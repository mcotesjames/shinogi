if (!customElements.get("pickup-availability")) {
  customElements.define(
    "pickup-availability",
    class PickupAvailability extends HTMLElement {
      constructor() {
        super();

        if (!this.hasAttribute("available")) return;

        this.errorHtml =
          this.querySelector("template").content.firstElementChild.cloneNode(
            true
          );
        this.onClickRefreshList = this.onClickRefreshList.bind(this);
        this.fetchAvailability(this.dataset.variantId);
      }

      fetchAvailability(variantId) {
        const variantSectionUrl = `${this.dataset.baseUrl}variants/${variantId}/?section_id=pickup-availability`;

        fetch(variantSectionUrl)
          .then((response) => response.text())
          .then((text) => {
            const sectionInnerHTML = new DOMParser()
              .parseFromString(text, "text/html")
              .querySelector(".shopify-section");
            this.renderPreview(sectionInnerHTML);
          })
          .catch((e) => {
            const refreshBtn = this.querySelector(
              ".pickup-availability-refresh"
            );
            refreshBtn?.removeEventListener("click", this.onClickRefreshList);
            this.renderError();
          });
      }

      onClickRefreshList(event) {
        this.fetchAvailability(this.dataset.variantId);
      }

      renderError() {
        this.innerHTML = "";
        this.appendChild(this.errorHtml);

        const refreshBtn = this.querySelector(".pickup-availability-refresh");
        refreshBtn?.addEventListener("click", this.onClickRefreshList);
      }

      renderPreview(sectionInnerHTML) {
        const drawer = document.querySelector("pickup-availability-drawer");
        if (drawer) drawer.remove();
        if (!sectionInnerHTML.querySelector("pickup-availability-preview")) {
          this.innerHTML = "";
          this.removeAttribute("available");
          return;
        }

        this.innerHTML = sectionInnerHTML.querySelector(
          "pickup-availability-preview"
        ).outerHTML;
        this.setAttribute("available", "");

        document.body.appendChild(
          sectionInnerHTML.querySelector("pickup-availability-drawer")
        );

        this.querySelector("button").addEventListener("click", (e) => {
          document.querySelector("pickup-availability-drawer").show(e.target);
        });
      }
    }
  );
}

if (!customElements.get("pickup-availability-drawer")) {
  customElements.define(
    "pickup-availability-drawer",
    class PickupAvailabilityDrawer extends HTMLElement {
      constructor() {
        super();

        const closeBtn = this.querySelector(
          ".pickup-availability-drawer-close"
        );
        closeBtn?.addEventListener("click", () => {
          this.hide();
        });

        const overlayEl = this.querySelector(".pickup-availability-overlay");
        overlayEl?.addEventListener("click", () => {
          this.hide();
        });

        this.addEventListener("keyup", (event) => {
          if (event.code.toUpperCase() === "ESCAPE") this.hide();
        });
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
    }
  );
}
