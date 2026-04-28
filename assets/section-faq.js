(function () {
  const initFaqAccordion = (section) => {
    if (!section || !section.classList.contains("faq-section")) {
      return;
    }

    const accordions = section.querySelectorAll(".product-accordion");

    accordions.forEach((accordion) => {
      accordion.addEventListener("click", (event) => {
        const toggleEl = event.target.closest(".product-accordion__toggle");
        if (!toggleEl) return;

        // Prevent nested accordion events from firing on parent accordions
        if (toggleEl.closest(".product-accordion") !== accordion) return;

        // Group-level accordion only operates on mobile
        if (toggleEl.classList.contains("faq__group-toggle") && window.innerWidth >= 990) {
          return;
        }

        const contentEl = toggleEl.nextElementSibling;
        if (
          !contentEl ||
          !contentEl.classList.contains("product-accordion__content")
        ) {
          return;
        }

        const isActive = toggleEl.classList.contains("active");
        if (!isActive) {
          slideDown(toggleEl, contentEl, 300);
        } else {
          slideUp(toggleEl, contentEl, 300);
        }
      });
    });
  };

  const initAll = () => {
    document.querySelectorAll(".faq-section").forEach(initFaqAccordion);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  document.addEventListener("shopify:section:load", function (event) {
    initFaqAccordion(event.target);
  });
})();
