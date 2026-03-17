(function () {
  const initSlider = (section) => {
    const sliderEl = section.querySelector(".js-highlights-slider");

    if (!sliderEl) return;

    const nextBtn = section.querySelector(
      ".highlights__navigation-button-next"
    );
    const prevBtn = section.querySelector(
      ".highlights__navigation-button-prev"
    );
    const itemsToShow = Number(sliderEl.dataset.itemsToShow || 3);

    const breakpoints = {
      4: {
        576: {
          slidesPerView: 2,
        },
        990: {
          slidesPerView: 3,
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
      breakpoints: breakpoints[itemsToShow],
    });
  };

  const destroySlider = (section) => {
    const sliderEl = section.querySelector(".js-highlights-slider");
    const slides = section.querySelectorAll(".js-highlights-slider-item");

    if (sliderEl?.swiper) sliderEl.swiper.destroy();

    slides.forEach((slide) => {
      slide.removeAttribute("style");
    });
  };

  const initHighlightsSwiper = (section) => {
    if (!section || !section?.classList.contains("highlights-section")) {
      return;
    }
    const sliderEl = section.querySelector(".js-highlights-slider");

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (window.innerWidth >= 1160) {
          destroySlider(section);
        } else {
          if (sliderEl?.swiper) {
            destroySlider(section);
          }
          initSlider(section);
        }
      });
    });

    resizeObserver.observe(section);
  };

  initHighlightsSwiper(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initHighlightsSwiper(event.target);
  });
})();
