(function () {
  const calcHeightInfoBottom = (section) => {
    const cards = section.querySelectorAll(".lookbook__item");

    cards.forEach((card) => {
      const bottomEl = card.querySelector(".lookbook__info-bottom");
      if (bottomEl) {
        const height = bottomEl.scrollHeight;
        bottomEl.style.setProperty("--bottom-max-height", `${height}px`);
      }
    });
  };

  const initSlider = (section) => {
    const sliderEl = section.querySelector(".swiper--lookbook");
    if (!sliderEl) return;

    const nextBtn = section.querySelector(
      ".heading-group__navigation-button-next"
    );
    const prevBtn = section.querySelector(
      ".heading-group__navigation-button-prev"
    );
    const itemsPerRow = Number(sliderEl.dataset.itemsPerRow || 3);

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
    const sliderEl = section.querySelector(".swiper--lookbook");
    if (!sliderEl) return;

    const slides = sliderEl.querySelectorAll(".lookbook__item");

    if (sliderEl.swiper) sliderEl.swiper.destroy();

    slides.forEach((slide) => {
      slide.removeAttribute("style");
    });
  };

  const initLookbook = (section) => {
    if (!section || !section?.classList.contains("lookbook-section")) {
      return;
    }

    const sliderEl = section.querySelector(".swiper--lookbook");
    const box = section.querySelector(".lookbook");
    const infoType = box.dataset?.infoType;

    if (sliderEl?.swiper) {
      destroySlider(section);
    } else {
      initSlider(section);
    }

    if (infoType === "dropdown") {
      const observer = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          calcHeightInfoBottom(section);
        });
      });

      observer.observe(section);
    }
  };

  initLookbook(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initLookbook(event.target);
  });
})();
