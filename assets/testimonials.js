(function () {
  let imagesSlider;
  let contentSlider;
  let isCursorInit;

  const initSliders = (section) => {
    if (!section || !section?.classList.contains("testimonials-section")) {
      return;
    }

    const slidersWrapper = section.querySelector(".testimonials__wrapper");
    if (!slidersWrapper) return;
    const hasLoop = slidersWrapper.dataset?.loop === "true";

    let contentSwiperEffect = "slide";
    let mediaSwiperEffect = "slide";

    let swiperSpeed = 1000;
    if (slidersWrapper.getAttribute("data-animation-type") === "fade") {
      contentSwiperEffect = "fade";
      mediaSwiperEffect = "fade";
    } else if (
      slidersWrapper.getAttribute("data-animation-type") === "creative"
    ) {
      contentSwiperEffect = "fade";
      mediaSwiperEffect = "slide";
      swiperSpeed = 2000;
    } else {
      contentSwiperEffect = "slide";
      mediaSwiperEffect = "slide";
    }

    const initImagesSlider = (section) => {
      const imagesSliderEl = section.querySelector(".testimonials__media");

      if (!imagesSliderEl) return;
      const prevButton = section.querySelector(".swiper-button-prev");
      const nextButton = section.querySelector(".swiper-button-next");
      const pagination = section.querySelector(".swiper-pagination");

      imagesSlider = new Swiper(imagesSliderEl, {
        autoplay: false,
        loop: hasLoop,
        normalizeSlideIndex: false,
        slidesPerView: 1,
        allowTouchMove: false,
        spaceBetween: 0,
        speed: swiperSpeed,
        effect: mediaSwiperEffect,
        allowTouchMove: true,
        mousewheel: {
          forceToAxis: true,
        },
        navigation: {
          nextEl: nextButton,
          prevEl: prevButton,
          disabledClass: "swiper-button-disabled",
        },
        pagination: {
          el: pagination,
          clickable: true,
        },
      });
    };

    const initContentSlider = (section) => {
      const contentSliderEl = section.querySelector(".js-content-slider");

      const slides = contentSliderEl.querySelectorAll(".swiper-slide");

      if (!contentSliderEl || !slides) return;

      contentSlider = new Swiper(contentSliderEl, {
        normalizeSlideIndex: false,
        autoplay: false,
        loop: hasLoop,
        slidesPerView: 1,
        allowTouchMove: true,
        spaceBetween: 0,
        speed: swiperSpeed,
        effect: contentSwiperEffect,
        mousewheel: {
          forceToAxis: true,
        },
        on: {
          init: (swiper) => {
            if (!swiper.params.loop) {
              section.classList.add("testimonials--slider-isBeggining");
            }
          },
          slideChange: (swiper) => {
            if (!swiper.params.loop) {
              if (contentSlider.isBeginning) {
                section.classList.add("testimonials--slider-isBeggining");
              } else {
                section.classList.remove("testimonials--slider-isBeggining");
              }

              if (contentSlider.isEnd) {
                section.classList.add("testimonials--slider-isEnd");
              } else {
                section.classList.remove("testimonials--slider-isEnd");
              }
            }
          },
        },
      });
    };

    initImagesSlider(section);
    initContentSlider(section);

    if (imagesSlider && contentSlider) {
      imagesSlider.controller.control = contentSlider;
      contentSlider.controller.control = imagesSlider;
    }
  };

  const initCursor = (section) => {
    if (!section || !section?.classList.contains("testimonials-section")) {
      return;
    }
    const testimonialsContainer = section.querySelector(
      ".testimonials__wrapper"
    );

    if (!testimonialsContainer) return;

    const isFlowingCursor =
      testimonialsContainer.getAttribute("data-flowing-cursor") === "true";
    if (!isFlowingCursor) return;
    const contentSection = section.querySelector(".testimonials__content");

    if (!contentSection) return;

    const arrowCursorEl = section.querySelector(".testimonials-cursor");

    if (!arrowCursorEl) return;

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    const easingFactor = 0.19;
    let isAnimating = false;

    const animateCursor = () => {
      isAnimating = true;

      currentX += (targetX - currentX) * easingFactor;
      currentY += (targetY - currentY) * easingFactor;

      arrowCursorEl.style.left = `${currentX}px`;
      arrowCursorEl.style.top = `${currentY}px`;

      if (
        Math.abs(targetX - currentX) > 0.1 ||
        Math.abs(targetY - currentY) > 0.1
      ) {
        requestAnimationFrame(() => animateCursor());
      } else {
        isAnimating = false;
      }
    };

    const handleMouseMove = (e) => {
      if (
        !e.target.closest(".testimonials__product") &&
        !e.target.closest(".testimonials__content-pagination")
      ) {
        testimonialsContainer.classList.add("cursor-active");
      } else {
        testimonialsContainer.classList.remove("cursor-active");
      }

      const contentRect = testimonialsContainer.getBoundingClientRect();
      const arrowCursorElRect = arrowCursorEl.getBoundingClientRect();
      const containerWidth = contentRect.width;
      const containerCenterX = contentRect.left + containerWidth / 2;

      if (e.clientX < containerCenterX) {
        arrowCursorEl.classList.add("prev");
        arrowCursorEl.classList.remove("next");
      } else {
        arrowCursorEl.classList.remove("prev");
        arrowCursorEl.classList.add("next");
      }

      targetX = e.clientX - contentRect.left - arrowCursorElRect.width / 2;
      targetY = e.clientY - contentRect.top - arrowCursorElRect.height / 2;

      if (!isAnimating) {
        animateCursor();
      }
    };

    const handleMouseEnter = (e) => {
      const contentRect = testimonialsContainer.getBoundingClientRect();
      const arrowCursorElRect = arrowCursorEl.getBoundingClientRect();

      targetX = currentX =
        e.clientX - contentRect.left - arrowCursorElRect.width / 2;
      targetY = currentY =
        e.clientY - contentRect.top - arrowCursorElRect.height / 2;

      arrowCursorEl.style.left = `${currentX}px`;
      arrowCursorEl.style.top = `${currentY}px`;

      testimonialsContainer.classList.add("cursor-active");
    };

    const handleMouseLeave = () => {
      testimonialsContainer.classList.remove("cursor-active");
    };

    const handleClick = (e) => {
      if (
        e.target.closest(".testimonials__product") ||
        e.target.closest(".testimonials__content-pagination")
      ) {
        return;
      }

      const contentRect = testimonialsContainer.getBoundingClientRect();
      const containerWidth = contentRect.width;
      const containerCenterX = contentRect.left + containerWidth / 2;

      const hasLoop = testimonialsContainer.dataset?.loop === "true";

      const hasPrevSlide = hasLoop ? true : !contentSlider.isBeginning;
      const hasNextSlide = hasLoop ? true : !contentSlider.isEnd;

      const isClickOnLeft = e.clientX < containerCenterX;
      const isClickOnRight = e.clientX >= containerCenterX;

      const shouldSlideNext = contentSlider.rtl
        ? isClickOnLeft && hasNextSlide
        : isClickOnRight && hasNextSlide;

      const shouldSlidePrev = contentSlider.rtl
        ? isClickOnRight && hasPrevSlide
        : isClickOnLeft && hasPrevSlide;

      if (shouldSlideNext) {
        contentSlider.slideNext();
      } else if (shouldSlidePrev) {
        contentSlider.slidePrev();
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (
          entry.contentRect.width >= 750 &&
          window.matchMedia("screen and (hover: hover) and (pointer: fine)")
            .matches
        ) {
          if (isCursorInit) return;
          testimonialsContainer.addEventListener(
            "mouseenter",
            handleMouseEnter
          );
          testimonialsContainer.addEventListener("mousemove", handleMouseMove);
          testimonialsContainer.addEventListener(
            "mouseleave",
            handleMouseLeave
          );

          testimonialsContainer.addEventListener("click", handleClick);

          isCursorInit = true;
        } else {
          if (!isCursorInit) return;
          testimonialsContainer.removeEventListener(
            "mouseenter",
            handleMouseEnter
          );
          testimonialsContainer.removeEventListener(
            "mousemove",
            handleMouseMove
          );
          testimonialsContainer.removeEventListener(
            "mouseleave",
            handleMouseLeave
          );

          testimonialsContainer.removeEventListener("click", handleClick);

          isCursorInit = false;
        }
      });
    });

    resizeObserver.observe(section);
  };

  initSliders(document.currentScript.parentElement);
  initCursor(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initSliders(event.target);
    initCursor(event.target);
  });
})();
