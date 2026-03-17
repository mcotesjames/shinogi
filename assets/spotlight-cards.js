(function () {
  const initSlider = (section) => {
    const sliderEl = section.querySelector(".swiper--spotlight-cards");

    if (!sliderEl) return;

    const nextBtn = section.querySelector(
      ".heading-group__navigation-button-next"
    );
    const prevBtn = section.querySelector(
      ".heading-group__navigation-button-prev"
    );
    const itemsPerRow = Number(sliderEl.dataset.itemsPerRow || 2);

    const breakpoints = {
      4: {
        576: {
          slidesPerView: 2,
        },
        990: {
          slidesPerView: 3,
        },
        1200: {
          slidesPerView: 4,
        },
      },
      3: {
        576: {
          slidesPerView: 2,
        },
        990: {
          slidesPerView: 3,
        },
      },
      2: {
        576: {
          slidesPerView: 2,
        },
      },
      1: {
        576: {
          slidesPerView: 1,
        },
      },
    };

    new Swiper(sliderEl, {
      loop: false,
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 800,
      mousewheel: {
        forceToAxis: true,
      },
      watchSlidesProgress: true,
      navigation: {
        nextEl: nextBtn,
        prevEl: prevBtn,
        disabledClass: "swiper-button-disabled",
      },
      breakpoints: breakpoints[itemsPerRow],
    });
  };

  const destroySlider = (section) => {
    const sliderEl = section.querySelector(".swiper--spotlight-cards");
    const slides = section.querySelectorAll(".spotlight-cards__item");

    if (sliderEl?.swiper) sliderEl.swiper.destroy();

    slides.forEach((slide) => {
      slide.removeAttribute("style");
    });
  };

  const initCollectionsGridSwiper = (section) => {
    if (!section || !section?.classList.contains("spotlight-cards-section")) {
      return;
    }

    const box = section.querySelector(".spotlight-cards");
    if (!box) return;

    const layout = box.dataset.layoutType || "grid";

    if (layout === "slider") {
      initSlider(box);
    } else {
      destroySlider(box);
    }
  };

  initCollectionsGridSwiper(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initCollectionsGridSwiper(event.target);
  });
})();
