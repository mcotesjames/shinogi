(() => {
  const toggleCard = (card, itemId, cards, images, detailedButton, url) => {
    const removeAllActiveClasses = () => {
      cards.forEach((item) => {
        item.classList.remove("featured-products__item--active");
        item.setAttribute("aria-disabled", true);
      });
      images.forEach((item) => {
        item.classList.remove("featured-products__image--active");
      });
      if (detailedButton) {
        detailedButton.setAttribute("aria-disabled", true);
        detailedButton.setAttribute("href", "");
      }
    };

    const setActiveClassesOnImage = () => {
      images.forEach((item) => {
        const imageItemId = item.dataset.itemId;
        if (imageItemId === itemId) {
          item.classList.add("featured-products__image--active");
        }
      });
    };

    const setActiveAttrOnBtn = () => {
      if (!detailedButton || !url) return;

      detailedButton.removeAttribute("aria-disabled");
      detailedButton.setAttribute("href", url);
    };

    removeAllActiveClasses();
    card.classList.add("featured-products__item--active");
    card.removeAttribute("aria-disabled");
    setActiveClassesOnImage();
    setActiveAttrOnBtn();
  };

  const initMobileSlider = (wrapper) => {
    const sliderEl = wrapper.querySelector(
      ".js-featured-products-mobile-slider"
    );
    if (!sliderEl) return;

    const cards = wrapper.querySelectorAll(".featured-products__item");
    const images = wrapper.querySelectorAll(".featured-products__image");
    const detailedButton = wrapper.querySelector(".featured-products__button");

    const prevBtn = sliderEl.querySelector(
      ".featured-products__navigation-button-prev"
    );
    const nextBtn = sliderEl.querySelector(
      ".featured-products__navigation-button-next"
    );

    const isLoop = cards.length > 2 ? true : false;

    new Swiper(sliderEl, {
      slidesPerView: "auto",
      spaceBetween: 0,
      speed: 800,
      loop: isLoop,
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
          slidesPerView: 1,
        },
      },
      on: {
        slideChange: function () {
          const activeSlide = this.slides[this.activeIndex];
          if (!activeSlide) return;
          const itemId = activeSlide.dataset.itemId;
          const url = activeSlide.dataset.productUrl;

          toggleCard(activeSlide, itemId, cards, images, detailedButton, url);
        },
      },
    });
  };

  const destroyMobileSlider = (sliderEl) => {
    if (!sliderEl) return;
    const sliderWrapper = sliderEl.querySelector(".swiper-wrapper");
    const slides = sliderEl.querySelectorAll(".swiper-slide");

    if (sliderEl?.swiper) sliderEl.swiper.destroy();
    if (sliderWrapper) sliderWrapper.removeAttribute("style");

    slides.forEach((slide) => {
      slide.removeAttribute("style");
    });
  };

  const initMouseToggle = (wrapper) => {
    const cards = wrapper.querySelectorAll(".featured-products__item");
    const images = wrapper.querySelectorAll(".featured-products__image");
    const detailedButton = wrapper.querySelector(".featured-products__button");

    const onSelectCard = (event) => {
      if (
        event.target.closest(".featured-products__item-btn") ||
        event.target.closest(".featured-products__item-title a") ||
        window.innerWidth < 990
      ) {
        return;
      }

      const card = event.target.closest(".featured-products__item");
      if (!card || card.classList.contains("featured-products__item--active")) {
        return;
      }

      const itemId = card.dataset.itemId;
      const productUrl = card.dataset.productUrl;

      toggleCard(card, itemId, cards, images, detailedButton, productUrl);
    };

    cards.forEach((card) => {
      card.addEventListener("mouseenter", (event) => {
        onSelectCard(event);
      });
      card.addEventListener("click", onSelectCard);
    });
  };

  const initSection = (section) => {
    if (!section || !section?.classList.contains("featured-products-section")) {
      return;
    }

    const wrapper = section.querySelector(".featured-products");
    if (!wrapper) return;

    // init toggle cards on desktop
    initMouseToggle(wrapper);

    // init mobile slider
    const sliderEl = wrapper.querySelector(
      ".js-featured-products-mobile-slider"
    );
    if (sliderEl) {
      const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          if (window.innerWidth >= 990) {
            destroyMobileSlider(sliderEl);
          } else {
            if (sliderEl?.swiper) return;
            initMobileSlider(wrapper);
          }
        });
      });
      resizeObserver.observe(section);
    }
  };

  initSection(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initSection(event.target);
  });
})();
