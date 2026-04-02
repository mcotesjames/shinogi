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
