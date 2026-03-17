(function () {
  const initSlider = (section) => {
    if (!section || !section?.classList.contains("social-media-section")) {
      return;
    }

    const slider = section.querySelector(".social-media-slider");

    if (!slider) return;

    const defaultSpeed = 15000;
    const speed = Number(slider.dataset?.speed ?? defaultSpeed);
    const slidesPerViewDesktop = slider.dataset.slidesPerViewDesktop;
    const slidesPerViewMobile = slider.dataset.slidesPerViewMobile;
    const stopAutoplaySlider =
      slider.dataset.stopOnHover === "true" ? true : false;

    const mediaSwiper = new Swiper(slider, {
      loop: true,
      allowTouchMove: false,
      speed: speed,
      slidesPerView: +slidesPerViewMobile,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
      },
      spaceBetween: 2,
      breakpoints: {
        576: {
          slidesPerView: +slidesPerViewDesktop,
        },
      },
    });

    if (stopAutoplaySlider) {
      let duration;
      let distanceRatio;
      let startTimer;

      const stopAutoplay = () => {
        if (startTimer) clearTimeout(startTimer);

        mediaSwiper.setTranslate(mediaSwiper.getTranslate());

        const currentSlideWidth =
          mediaSwiper.slides[mediaSwiper.activeIndex].offsetWidth;
        distanceRatio = Math.abs(
          (currentSlideWidth * mediaSwiper.activeIndex +
            mediaSwiper.getTranslate()) /
            currentSlideWidth
        );

        duration = mediaSwiper.params.speed * distanceRatio;
        mediaSwiper.autoplay.stop();
      };

      const startAutoplay = (delay = duration) => {
        startTimer = setTimeout(() => {
          mediaSwiper.autoplay.start();
        }, delay);
      };

      startAutoplay();

      slider.addEventListener("mouseenter", function () {
        stopAutoplay();
      });

      slider.addEventListener("mouseleave", function () {
        const distance =
          mediaSwiper.width * mediaSwiper.activeIndex +
          mediaSwiper.getTranslate();

        duration = distance !== 0 ? duration : 0;
        mediaSwiper.slideTo(mediaSwiper.activeIndex, duration);
        startAutoplay();
      });
    }
  };

  initSlider(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initSlider(event.target);
  });
})();
