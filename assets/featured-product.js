(function () {
  const initMainSlider = (section) => {
    if (!section || !section.classList.contains("featured-product-section")) {
      return;
    }

    const sliderEl = section.querySelector(".js-media-list");
    if (!sliderEl) return;

    const navPrev = sliderEl.querySelector(".swiper-button-prev");
    const navNext = sliderEl.querySelector(".swiper-button-next");
    const spaceBetween = sliderEl.classList.contains(
      "product__media-list--with-borders"
    )
      ? 1
      : 0;

    const initSwiper = () => {
      const isLoop = sliderEl.querySelectorAll(".swiper-slide").length > 3;

      new Swiper(sliderEl, {
        slidesPerView: "auto",
        spaceBetween: spaceBetween,
        autoHeight: false,
        loop: isLoop,
        direction: "horizontal",
        speed: 800,
        allowTouchMove: true,
        watchSlidesProgress: true,
        mousewheel: {
          forceToAxis: true,
        },
        navigation: {
          nextEl: navNext,
          prevEl: navPrev,
        },
        on: {
          slideChange: function () {
            //window.pauseAllMedia();
            window.pauseAllModels();
            this.params.noSwiping = false;
          },
          slideChangeTransitionEnd: function () {
            const activeIndex = isLoop ? this.realIndex : this.activeIndex;
            const model3D =
              this.slides[activeIndex]?.querySelector("model-viewer");
            const posterBtn3D = this.slides[activeIndex]?.querySelector(
              ".shopify-model-viewer-ui__button--poster"
            );
            if (model3D && posterBtn3D) {
              posterBtn3D.removeAttribute("hidden");
            }
          },
          touchStart: function () {
            const activeIndex = isLoop ? this.realIndex : this.activeIndex;
            const model3D =
              this.slides[activeIndex]?.querySelector("model-viewer");
            if (model3D) {
              if (
                !model3D.classList.contains("shopify-model-viewer-ui__disabled")
              ) {
                this.params.noSwiping = true;
                this.params.noSwipingClass = "swiper-slide";
              } else {
                this.params.noSwiping = false;
              }
            }
          },
        },
      });
    };

    initSwiper();
  };

  const initProductAccordion = (section) => {
    if (!section || !section.classList.contains("featured-product-section")) {
      return;
    }

    const accordions = section.querySelectorAll(".dropdown-accordion");

    accordions.forEach((accordion) => {
      accordion.addEventListener("click", (event) => {
        const toggleEl = event.target.closest(".dropdown-accordion__toggle");
        if (!toggleEl) return;

        const contentEl = toggleEl.nextElementSibling;
        if (
          !contentEl ||
          !contentEl.classList.contains("dropdown-accordion__content")
        ) {
          return;
        }

        const isActive = toggleEl.classList.contains("active");
        if (!isActive) {
          slideDown(toggleEl, contentEl, 300); // func in global.js
        } else {
          slideUp(toggleEl, contentEl, 300); // func in global.js
        }
      });
    });
  };

  initMainSlider(document.currentScript.parentElement);
  initProductAccordion(document.currentScript.parentElement);

  window.initFeaturedProduct = window.initFeaturedProduct || initMainSlider;

  document.addEventListener("shopify:section:load", (event) => {
    initMainSlider(event.target);
    if (!window.Shopify.designMode) {
      initProductAccordion(event.target);
    }
  });
})();
