(function () {
  function containerUpdate(container, cardSize) {
    let timeoutId;
    container.setAttribute("data-catalog-card-size", cardSize);

    container.setAttribute("data-switching", true);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      container.removeAttribute("data-switching");
    }, 300);
  }

  function switchCardSize() {
    const buttons = document.querySelectorAll(".js-switch-card-size");
    const pageHeader = document.querySelector("sticky-header.header-wrapper");
    let headerRevealTimeout = null;
    let currentAbortController = null;
    const handleButtonEvent = (button) => {
      const cardSize = button.dataset.cardSize;

      buttons.forEach((btn) => btn.classList.remove("active-layout"));
      button.classList.add("active-layout");

      document.querySelectorAll("[data-catalog-card-size]").forEach((el) => {
        containerUpdate(el, cardSize);
      });

      if (pageHeader) {
        if (headerRevealTimeout) clearTimeout(headerRevealTimeout);
        pageHeader.preventReveal = true;
      }

      if (currentAbortController) currentAbortController.abort();
      currentAbortController = new AbortController();

      fetch(window.Shopify.routes.root + "cart/update.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attributes: {
            "catalog-card-size": cardSize,
          },
        }),
        signal: currentAbortController.signal,
      })
        .then((response) => {
          if (response.ok) {
            console.info(`Catalog card size "${cardSize}" saved successfully.`);
          }
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            console.error("Request error:", error);
          }
        })
        .finally(() => {
          if (pageHeader) {
            headerRevealTimeout = setTimeout(() => {
              pageHeader.preventReveal = false;
            }, 400);
          }
        });
    };
    buttons.forEach((button) => {
      button.addEventListener("click", () => handleButtonEvent(button));
      button.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") handleButtonEvent(button);
      });
    });
  }

  switchCardSize();

  document.addEventListener("shopify:section:load", function () {
    switchCardSize();
  });
})();
