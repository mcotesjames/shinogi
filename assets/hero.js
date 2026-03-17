(function () {
  const initHero = (section) => {
    if (!section || !section?.classList.contains("hero-section")) {
      return;
    }

    const slider = section.querySelector(".hero__media--slider");

    if (!slider) return;

    const sliderWrapper = slider.querySelector(".hero__media-wrapper");
    const sliderSpeed = Number(slider.dataset?.sliderSpeed || 15000);
    const sliderSpeedMob = sliderSpeed * 0.8;
    const sliderDirection = slider.dataset?.sliderDirection || "right_to_left";
    const reverseDirection = sliderDirection === "left_to_right" ? true : false;
    const pageDir = document.documentElement.getAttribute("dir") || "ltr";
    let initialOffset = pageDir === "ltr" ? "-40%" : "40%";
    if (reverseDirection) {
      initialOffset = 0;
    }

    new Swiper(slider, {
      loop: true,
      allowTouchMove: false,
      spaceBetween: 0,
      speed: sliderSpeedMob,
      slidesPerView: "auto",
      resizeObserver: false,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
        reverseDirection: reverseDirection,
      },
      spaceBetween: 0,
      breakpoints: {
        576: {
          speed: sliderSpeed,
        },
      },
      on: {
        init: function () {
          if (!sliderWrapper) return;
          sliderWrapper.style.transform = `translate3d(${initialOffset}, 0, 0)`;
        },
      },
    });
  };

  initHero(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initHero(event.target);
  });
})();
