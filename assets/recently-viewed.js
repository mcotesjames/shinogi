(function () {
  const initSlider = (section) => {
    const sliderEl = section.querySelector(".js-recently-viewed-slider");
    if (!sliderEl) return;

    const productsPerRow = Number(sliderEl.dataset.productsPerRow || 4);
    const productsPerRowMobile = Number(
      sliderEl.dataset.productsPerRowMobile || 1
    );
    const spaceBetween = Number(sliderEl.dataset.spaceBetween || 1);
    const nextBtn = section.querySelector(
      ".heading-group__navigation-button-next"
    );
    const prevBtn = section.querySelector(
      ".heading-group__navigation-button-prev"
    );
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

    new Swiper(sliderEl, sliderSettings);
  };

  const destroySlider = (section) => {
    const sliderEl = section.querySelector(".js-recently-viewed-slider");
    if (!sliderEl) return;

    if (sliderEl.swiper) sliderEl.swiper.destroy();
    sliderEl.querySelector(".swiper-wrapper")?.removeAttribute("style");
    sliderEl.querySelectorAll(".swiper-slide").forEach((slide) => {
      slide.removeAttribute("style");
    });
  };

  const initSectionLayout = (section) => {
    if (!section || !section?.classList.contains("recently-viewed-section")) {
      return;
    }

    const box = section.querySelector(".popular-products");
    if (!box) return;

    const layout = box.dataset.layout || "grid";
    if (layout === "slider") {
      initSlider(box);
    } else {
      destroySlider(box);
    }
  };

  const initSection = async (section) => {
    if (!section || !section?.classList.contains("recently-viewed-section")) {
      return;
    }

    const box = section.querySelector(".recently-viewed");
    if (!box) return;

    const STORAGE_KEY = "__theme__recently_products";
    const EXPIRATION_DAYS = box.dataset.expirationDays
      ? Number(box.dataset.expirationDays)
      : 30;
    const dateNow = Date.now();

    const baseUrl = box.dataset.baseUrl;
    const productsLimit = Number(box.dataset.productsLimit) || 6;
    const currentPageProductId = box.dataset.currentPageProductId;

    // get recent products from local storage
    let recentProducts = [];
    try {
      recentProducts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      console.error(`Incorrect value in local storage for "${STORAGE_KEY}"`);
    }

    if (currentPageProductId) {
      recentProducts = recentProducts.filter(
        (item) => item.productId !== currentPageProductId
      );
    }

    if (recentProducts.length === 0) {
      box.classList.remove("recently-viewed--loading");
      box.classList.add("recently-viewed--empty");
      return;
    }

    // filter by expiration time
    const expirationTime = EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
    const validProducts = recentProducts.filter(
      (item) => dateNow - item.timestamp < expirationTime
    );

    // limit by section setting
    const limitedProducts = validProducts.slice(0, productsLimit);

    // get url with query
    const query = limitedProducts
      .filter((item) => item.productId)
      .map((item) => `id:${item.productId}`)
      .join("%20OR%20");
    const url = `${baseUrl}&q=${query}`;

    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const sourceBox = doc?.querySelector(".recently-viewed");
      if (!sourceBox?.classList.contains("recently-viewed--search-perfomed")) {
        box.classList.add("recently-viewed--empty");
        return;
      }
      box.innerHTML = sourceBox.innerHTML;

      initSectionLayout(section);
    } catch (error) {
      console.error("Failed to fetch recently viewed products:", error);
      box.classList.add("recently-viewed--empty");
    } finally {
      box.classList.remove("recently-viewed--loading");
    }
  };

  initSection(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initSection(event.target);
  });
})();
