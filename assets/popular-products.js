(function () {
  const sliders = [];

  const initSliders = (section) => {
    const sliderEls = section.querySelectorAll(".js-popular-products-slider");

    sliderEls.forEach((sliderEl) => {
      const swiperWrapper = sliderEl.querySelector(
        ".popular-products__list--slider"
      );
      const slides = sliderEl.querySelectorAll(".popular-products__item");

      if (!swiperWrapper || !slides || !slides.length) return;

      const tabId = sliderEl.dataset.productsTabId;
      const productsPerRow = Number(sliderEl.dataset.productsPerRow || 4);
      const productsPerRowMobile = Number(
        sliderEl.dataset.productsPerRowMobile || 1
      );
      const spaceBetween = Number(sliderEl.dataset.spaceBetween || 1);

      const prevBtn = section.querySelector(
        `.popular-products__navigation[data-products-tab-id="${tabId}"] .heading-group__navigation-button-prev`
      );
      const nextBtn = section.querySelector(
        `.popular-products__navigation[data-products-tab-id="${tabId}"] .heading-group__navigation-button-next`
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

      const slider = new Swiper(sliderEl, sliderSettings);
      sliders.push(slider);
    });
  };

  const destroySliders = () => {
    sliders.forEach((slider) => {
      if (typeof slider.destroy === "function") {
        slider.destroy();
      }
    });
  };

  const toggleTab = (section) => {
    const tabsEls = section.querySelectorAll(".popular-products__tab");
    const productsEls = section.querySelectorAll(".popular-products__layout");
    const navigationEls = section.querySelectorAll(
      ".popular-products__navigation"
    );

    const onToggleTab = (event, tab) => {
      event.preventDefault();
      if (tab.classList.contains("active")) return;
      const tabId = tab.dataset.productsTabId;

      tabsEls.forEach((el) => {
        el.classList.remove("active", "button--tertiary");
        el.classList.add("button--simple");
      });

      productsEls.forEach((el) => {
        el.classList.remove("active");
      });

      navigationEls.forEach((el) => {
        el.classList.remove("active");
      });

      const productsActiveEl = section.querySelector(
        `.popular-products__layout[data-products-tab-id="${tabId}"]`
      );
      const navigationActiveEl = section.querySelector(
        `.popular-products__navigation[data-products-tab-id="${tabId}"]`
      );
      tab.classList.remove("button--simple");
      tab.classList.add("active", "button--tertiary");
      productsActiveEl.classList.add("active");
      navigationActiveEl.classList.add("active");
    };

    tabsEls.forEach((tab) => {
      tab.addEventListener("click", (event) => onToggleTab(event, tab));

      tab.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          onToggleTab(event, tab);
        }
      });
    });
  };

  const initProductsTabs = (section) => {
    if (!section || !section?.classList.contains("popular-products-section")) {
      return;
    }

    const box = section.querySelector(".popular-products");
    if (!box) return;

    const layout = box.dataset.layout || "grid";
    if (layout === "slider") {
      initSliders(box);
    } else {
      destroySliders();
    }

    toggleTab(box);
  };

  initProductsTabs(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initProductsTabs(event.target);
  });
})();
