(function () {
  async function handleResponse(response, section) {
    const responseText = await response.text();
    const html = document.createElement("div");
    html.innerHTML = responseText;

    const sourceGrid = html.querySelector(".products-grid--search-perfomed");
    const targetWrapper = section.querySelector(".products-grid");

    if (!sourceGrid || !targetWrapper) {
      section.classList.add("products-grid-section--empty");
      return;
    }

    targetWrapper.innerHTML = sourceGrid.innerHTML;
  }

  const initSection = async (section) => {
    if (!section || !section.classList.contains("products-grid-section")) {
      return;
    }

    const box = section.querySelector(".products-grid");
    if (!box) return;

    const isDynamicLoad = box.dataset.isDynamicLoad === "true";
    const collectionUrl = box.dataset.collectionUrl;
    const loadingEl = box.querySelector(".loading-overlay");

    if (isDynamicLoad && collectionUrl && collectionUrl !== "none") {
      box.classList.add("products-grid--loading");

      try {
        const response = await fetch(collectionUrl);
        await handleResponse(response, section);
      } catch (error) {
        console.error("Error when fetching products:", error);
        section.classList.add("products-grid-section--empty");
      } finally {
        box.classList.remove("products-grid--loading");
        if (loadingEl) loadingEl.remove();
      }
    } else {
      box.classList.remove("products-grid--loading");
      if (loadingEl) loadingEl.remove();
    }
  };

  initSection(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initSection(event.target);
  });
})();
