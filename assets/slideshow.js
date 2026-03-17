(() => {
  const playVideo = (swiper) => {
    if (!swiper?.enabled) return;
    const prevSlide = swiper.slides[swiper.previousIndex];
    const activeSlide = swiper.slides[swiper.activeIndex];

    if (activeSlide) {
      const videoActive = activeSlide.querySelector(".slideshow__video");
      if (videoActive) {
        videoActive.play().catch((error) => {
          console.error("Error playing video:", error);
        });
      }
    }

    if (prevSlide && prevSlide !== activeSlide) {
      const videoPrev = prevSlide.querySelector(".slideshow__video");
      if (videoPrev) videoPrev.pause();
    }
  };

  const stopVideo = (swiper) => {
    if (!swiper?.enabled) return;
    const activeSlide = swiper.slides[swiper.activeIndex];

    if (activeSlide) {
      const videoActive = activeSlide.querySelector(".slideshow__video");
      if (videoActive) videoActive.pause();
    }
  };

  const changeColorScheme = (swiper, box) => {
    if (!swiper?.enabled) return;
    const activeIndex = swiper.activeIndex;
    const activeSlide = swiper.slides[activeIndex];
    const colorScheme = activeSlide.dataset.colorScheme;
    const cursor = box?.querySelector(".slideshow__cursor");

    let changeItems = [
      swiper.navigation.nextEl,
      swiper.navigation.prevEl,
      swiper.pagination.el,
      cursor,
    ];

    if (box.getAttribute("data-layout") === "split_screen") {
      const isTextSlider = activeSlide.closest(".slideshow__swiper--text");
      const isMediaSlider = activeSlide.closest(".slideshow__swiper--media");

      if (isTextSlider && box.querySelector(".slideshow__swiper--media")) {
        changeItems = [cursor];
      }
      if (isMediaSlider) {
        changeItems = [swiper.pagination.el];
      }
    }

    changeItems.forEach((item) => {
      if (item) {
        let classNames = item.getAttribute("class");
        classNames = classNames.replace(/color-background-\d+/g, "");
        item.setAttribute("class", classNames);
        item.classList.add(colorScheme);
      }
    });
  };

  const getSwiperParams = (box) => {
    const swiperParams = {
      speed: 1000,
      autoHeight: false,
      allowTouchMove: true,
      watchSlidesProgress: true,
      preventInteractionOnTransition: true,
      mousewheel: {
        forceToAxis: true,
      },
      on: {
        slideChange: function () {
          changeColorScheme(this, box);
          if (box.getAttribute("data-layout") === "overlay") {
            playVideo(this);
          }
        },
      },
    };

    if (box.getAttribute("data-autoplay") === "true") {
      swiperParams.autoplay = {
        disableOnInteraction: false,
        pauseOnMouseEnter: box.getAttribute("data-stop-autoplay") === "true",
      };
    }

    if (box.getAttribute("data-loop") === "true") {
      swiperParams.loop = true;
      swiperParams.loopPreventsSliding = false;
    }

    if (box.getAttribute("data-pagination") === "true") {
      const paginationEl = box.querySelector(".swiper-pagination");

      swiperParams.pagination = {
        el: paginationEl,
        type: "bullets",
        clickable: true,
      };
    }

    if (box.getAttribute("data-parallax") === "true") {
      swiperParams.parallax = true;
    }

    if (box.getAttribute("data-animation-type") === "fade") {
      swiperParams.effect = "fade";
    } else if (box.getAttribute("data-animation-type") === "creative") {
      swiperParams.effect = "slide";
      swiperParams.speed = 2000;
      if (box.getAttribute("data-layout") === "split_screen") {
        swiperParams.effect = "fade";
      }
    } else {
      swiperParams.effect = "slide";
    }

    if (
      box.getAttribute("data-flowing-cursor") === "true" &&
      box.getAttribute("data-loop") !== "true"
    ) {
      swiperParams.on = {
        init: function () {
          box.classList.add("slideshow--is-beggining");
        },
        slideChange: function () {
          box.classList.toggle("slideshow--is-beggining", this.isBeginning);
          box.classList.toggle("slideshow--is-end", this.isEnd);
          changeColorScheme(this, box);
          if (box.getAttribute("data-layout") === "overlay") {
            playVideo(this);
          }
        },
      };
    }

    return swiperParams;
  };

  const getSliderElements = (box) => {
    let mainSlider;
    let mediaSlider;
    if (box.getAttribute("data-layout") === "overlay") {
      mainSlider = box.querySelector(".slideshow__swiper--overlay");
      mediaSlider = box.querySelector(".slideshow__swiper--overlay");
    } else if (box.getAttribute("data-layout") === "split_screen") {
      mainSlider = box.querySelector(".slideshow__swiper--text");
      mediaSlider = box.querySelector(".slideshow__swiper--media");
    }
    return { mainSlider, mediaSlider };
  };

  const initSlider = (box) => {
    if (!box) return;

    const { mainSlider, mediaSlider } = getSliderElements(box);
    if (!mainSlider) return;

    const slides = mainSlider.querySelectorAll(".swiper-slide");
    if (slides.length < 2) return;

    const swiperParams = getSwiperParams(box);

    const mainSwiper = new Swiper(mainSlider, swiperParams);
    changeColorScheme(mainSwiper, box);

    if (mediaSlider && mediaSlider !== mainSlider) {
      const mediaEffect =
        box.getAttribute("data-animation-type") === "creative"
          ? "slide"
          : box.getAttribute("data-animation-type") === "fade"
          ? "fade"
          : "slide";

      const mediaSwiper = new Swiper(mediaSlider, {
        ...swiperParams,
        effect: mediaEffect,
        autoplay: false,
        navigation: false,
        parallax: false,
        on: {
          slideChange: function () {
            playVideo(this);
            changeColorScheme(this, box);
          },
        },
      });

      mainSwiper.controller.control = mediaSwiper;
      mediaSwiper.controller.control = mainSwiper;
    }
  };

  const initAutoplayObserver = (box) => {
    if (!box) return;

    const { mainSlider, mediaSlider } = getSliderElements(box);
    if (!mainSlider || !mainSlider.swiper) return;

    const hasAutoplay = box.getAttribute("data-autoplay") === "true";

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (hasAutoplay) mainSlider.swiper.autoplay.resume();
          if (mediaSlider && mediaSlider.swiper) playVideo(mediaSlider.swiper);
        } else {
          if (hasAutoplay) mainSlider.swiper.autoplay.pause();
          if (mediaSlider && mediaSlider.swiper) stopVideo(mediaSlider.swiper);
        }
      });
    });

    sectionObserver.observe(box);
  };

  let isCursorInit = false;
  const initCursor = (box) => {
    if (!box || box.dataset.flowingCursor !== "true") return;

    const { mainSlider } = getSliderElements(box);
    if (!mainSlider || !mainSlider.swiper) return;

    const cursorEl = box.querySelector(".slideshow__cursor");
    if (!cursorEl) return;

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    const easingFactor = 0.2;
    let isAnimating = false;

    const animateCursor = () => {
      isAnimating = true;

      currentX += (targetX - currentX) * easingFactor;
      currentY += (targetY - currentY) * easingFactor;

      cursorEl.style.left = `${currentX}px`;
      cursorEl.style.top = `${currentY}px`;

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
        !e.target.closest(".slideshow__content-title a") &&
        !e.target.closest(".slideshow__content-description a") &&
        !e.target.closest(".slideshow__content-button") &&
        !e.target.closest(".slideshow__pagination")
      ) {
        box.classList.add("cursor-active");
      } else {
        box.classList.remove("cursor-active");
      }

      const contentRect = box.getBoundingClientRect();
      const cursorRect = cursorEl.getBoundingClientRect();
      const containerWidth = contentRect.width;
      const containerCenterX = contentRect.left + containerWidth / 2;

      if (e.clientX < containerCenterX) {
        cursorEl.classList.add("prev");
        cursorEl.classList.remove("next");
      } else {
        cursorEl.classList.remove("prev");
        cursorEl.classList.add("next");
      }

      targetX = e.clientX - contentRect.left - cursorRect.width / 2;
      targetY = e.clientY - contentRect.top - cursorRect.height / 2;

      if (!isAnimating) {
        animateCursor();
      }
    };

    const handleMouseEnter = (e) => {
      const contentRect = box.getBoundingClientRect();
      const cursorRect = cursorEl.getBoundingClientRect();

      targetX = currentX = e.clientX - contentRect.left - cursorRect.width / 2;
      targetY = currentY = e.clientY - contentRect.top - cursorRect.height / 2;

      cursorEl.style.left = `${currentX}px`;
      cursorEl.style.top = `${currentY}px`;

      box.classList.add("cursor-active");
    };

    const handleMouseLeave = () => {
      box.classList.remove("cursor-active");
    };

    const handleClick = (e) => {
      if (
        e.target.closest(".slideshow__content-description a") ||
        e.target.closest(".slideshow__content-button") ||
        e.target.closest(".slideshow__pagination")
      ) {
        return;
      }

      const contentRect = box.getBoundingClientRect();
      const containerWidth = contentRect.width;
      const containerCenterX = contentRect.left + containerWidth / 2;

      const mainSwiper = mainSlider.swiper;
      const isLoop = box.getAttribute("data-loop") === "true";

      const hasPrevSlide = isLoop ? true : !mainSwiper.isBeginning;
      const hasNextSlide = isLoop ? true : !mainSwiper.isEnd;

      if (!mainSwiper.animating) {
        const isClickOnLeft = e.clientX < containerCenterX;
        const isClickOnRight = e.clientX >= containerCenterX;

        const shouldSlideNext = mainSwiper.rtl
          ? isClickOnLeft && hasNextSlide
          : isClickOnRight && hasNextSlide;

        const shouldSlidePrev = mainSwiper.rtl
          ? isClickOnRight && hasPrevSlide
          : isClickOnLeft && hasPrevSlide;

        if (shouldSlideNext) {
          mainSwiper.slideNext();
        } else if (shouldSlidePrev) {
          mainSwiper.slidePrev();
        }
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.contentRect.width >= 750) {
          if (isCursorInit) return;
          box.addEventListener("mouseenter", handleMouseEnter);
          box.addEventListener("mousemove", handleMouseMove);
          box.addEventListener("mouseleave", handleMouseLeave);
          box.addEventListener("click", handleClick);

          isCursorInit = true;
        } else {
          if (!isCursorInit) return;
          box.removeEventListener("mouseenter", handleMouseEnter);
          box.removeEventListener("mousemove", handleMouseMove);
          box.removeEventListener("mouseleave", handleMouseLeave);
          box.removeEventListener("click", handleClick);

          isCursorInit = false;
        }
      });
    });

    resizeObserver.observe(box);
  };

  const calcMobilePaddingBottom = (box) => {
    if (
      !box ||
      !box.classList.contains("slideshow--with-pagination") ||
      (box.dataset.layout === "split_screen" &&
        !box.classList.contains("slideshow--no-media"))
    ) {
      return;
    }

    const pagination = box.querySelector(".slideshow__pagination");
    if (!pagination) return;

    const { mainSlider } = getSliderElements(box);
    if (!mainSlider || !mainSlider.swiper) return;

    const slideCount = mainSlider.swiper.slides.length;
    if (slideCount < 20) return;

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.contentRect.width < 750) {
          const paginationHeight = pagination.getBoundingClientRect().height;
          if (paginationHeight > 12) {
            const padding = (paginationHeight + 40).toFixed(2);
            box.style.setProperty("--js-mobile-padding-bottom", `${padding}px`);
          }
        } else {
          box.removeAttribute("style");
        }
      });
    });

    resizeObserver.observe(box);
  };

  const stopAutoplayOnHoverSplitScreen = (box) => {
    if (
      !box ||
      box.getAttribute("data-autoplay") !== "true" ||
      box.getAttribute("data-stop-autoplay") !== "true" ||
      box.dataset.layout !== "split_screen"
    ) {
      return;
    }

    const { mainSlider, mediaSlider } = getSliderElements(box);
    if (!mainSlider || !mediaSlider || !mainSlider.swiper) return;

    mediaSlider.addEventListener("mouseenter", () => {
      mainSlider.swiper.autoplay.pause();
    });

    box.addEventListener("mouseleave", (event) => {
      const related = event.relatedTarget;
      if (!mediaSlider.contains(related) && !mainSlider.contains(related)) {
        mainSlider.swiper.autoplay.resume();
      }
    });
  };

  const initSection = (section) => {
    if (!section || !section?.classList.contains("slideshow-section")) return;

    const box = section.querySelector(".slideshow");
    if (!box) return;

    initSlider(box);
    initAutoplayObserver(box);
    initCursor(box);
    calcMobilePaddingBottom(box);
    stopAutoplayOnHoverSplitScreen(box);
  };

  initSection(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initSection(event.target);
  });
})();
