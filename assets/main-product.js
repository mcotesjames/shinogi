function initProductPage(section) {
  if (!section || !section.classList.contains("product-section")) {
    return;
  }

  const initMainSlider = (section) => {
    if (!section || !section.classList.contains("product-section")) {
      return;
    }

    const sliderEl = section.querySelector(".js-media-list");
    if (!sliderEl) return;

    const desktopType = sliderEl.dataset?.desktopType || "slider";
    const mobileType = sliderEl.dataset?.mobileType || "slider";
    const hasDesktopZoom = sliderEl.dataset?.hasDesktopZoom === "true";
    const navPrev = sliderEl.querySelector(".swiper-button-prev");
    const navNext = sliderEl.querySelector(".swiper-button-next");
    const mediaBox = sliderEl.closest(".product__media");
    const thumbsSlider = mediaBox?.querySelector(".js-media-sublist");

    const isLoop = sliderEl.querySelectorAll(".swiper-slide").length > 2;

    const initSwiper = () => {
      new Swiper(sliderEl, {
        slidesPerView: mobileType === "slider" ? "auto" : 1,
        spaceBetween: 0,
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
        breakpoints: {
          990: {
            slidesPerView: desktopType === "slider" ? "auto" : 1,
            allowTouchMove: !hasDesktopZoom,
          },
        },
        thumbs: {
          swiper: thumbsSlider?.swiper ? thumbsSlider.swiper : "",
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

    const destroySwiper = () => {
      if (sliderEl.swiper) {
        sliderEl.swiper.destroy();
      }
      sliderEl.querySelectorAll(".swiper-wrapper").forEach((wrapper) => {
        wrapper.removeAttribute("style");
      });
      sliderEl.querySelectorAll(".swiper-slide").forEach((slide) => {
        slide.removeAttribute("style");
      });
    };

    const hasDesktopSwiper =
      desktopType === "slider" || desktopType == "slider_previews";
    const hasMobileSwiper =
      mobileType === "slider" || mobileType == "slider_previews";

    if (hasDesktopSwiper && hasMobileSwiper) {
      initSwiper();
    } else {
      const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          if (window.innerWidth >= 990 && hasDesktopSwiper) {
            initSwiper();
            return;
          }

          if (window.innerWidth < 990 && hasMobileSwiper) {
            initSwiper();
            return;
          }

          destroySwiper();
        });
      });

      resizeObserver.observe(section);
    }
  };

  const initSubSlider = (section) => {
    if (!section || !section.classList.contains("product-section")) {
      return;
    }

    const sliderEl = section.querySelector(".js-media-sublist");
    if (!sliderEl) return;

    const desktopType = sliderEl.dataset?.desktopType || "slider";
    const mobileType = sliderEl.dataset?.mobileType || "slider";
    const hasDesktopSwiper = desktopType === "slider_previews";
    const hasMobileSwiper = mobileType === "slider_previews";

    const isLoop = sliderEl.querySelectorAll(".swiper-slide").length > 3;

    const initSwiper = () => {
      const thumbSlider = new Swiper(sliderEl, {
        spaceBetween: 8,
        slidesPerView: 4,
        loop: isLoop,
        direction: "horizontal",
        allowTouchMove: true,
        watchSlidesProgress: true,
        watchOverflow: true,
        observer: true,
        observeParents: true,
        autoHeight: false,
        slideToClickedSlide: true,
        on: {
          touchEnd: function (swiper) {
            let range = 5;
            let diff = (swiper.touches.diff = swiper.isHorizontal()
              ? swiper.touches.currentX - swiper.touches.startX
              : swiper.touches.currentY - swiper.touches.startY);
            if (diff < range || diff > -range) swiper.allowClick = true;
          },
        },
        breakpoints: {
          576: {
            slidesPerView: 6,
          },
          990: {
            slidesPerView: "auto",
            direction: "vertical",
          },
        },
      });

      return thumbSlider;
    };

    if (hasDesktopSwiper || hasMobileSwiper) {
      initSwiper();

      const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          if (sliderEl.swiper) {
            if (window.innerWidth >= 990 && hasDesktopSwiper) {
              sliderEl.swiper.enable();
              sliderEl.swiper.changeDirection("vertical", true);
            }

            if (
              window.innerWidth >= 990 &&
              desktopType === "stacked_previews"
            ) {
              sliderEl.swiper.disable();
            }

            if (window.innerWidth < 990 && hasMobileSwiper) {
              sliderEl.swiper.enable();
              sliderEl.swiper.changeDirection("horizontal", true);
            }
          }
        });
      });

      resizeObserver.observe(section);
    }
  };

  const initZoomSlider = (section) => {
    if (!section || !section.classList.contains("product-section")) {
      return;
    }

    const sectionBox = section.querySelector('[id^="MainProduct-"]');
    const sectionId = sectionBox?.dataset?.section;
    const sliderEl = document.querySelector(
      `[data-section-id='${sectionId}'].js-popup-slider`
    );
    if (!sliderEl) return;

    const buttonPrev = sliderEl.querySelector(".swiper-button-prev");
    const buttonNext = sliderEl.querySelector(".swiper-button-next");

    const isLoop = sliderEl.querySelectorAll(".swiper-slide").length > 3;

    const onMainSliderToggleClick = (event) => {
      if (!sliderEl.swiper) return;
      const zoomToggle = event.target.closest(".product__media-toggle");
      if (!zoomToggle) return;
      const mediaId = zoomToggle.dataset?.mediaId;
      if (!mediaId) return;
      sliderEl
        .querySelectorAll(".product-media-modal__item.swiper-slide")
        .forEach((slide, index) => {
          const zoomImageEl = slide.querySelector(
            `[data-media-id="${mediaId}"]`
          );
          if (zoomImageEl) {
            const findIndex = sliderEl.swiper.slides.findIndex(
              (slideEl) => slideEl.dataset?.mediaId === mediaId
            );
            const fallbackIndex = Number(
              slide.dataset?.swiperSlideIndex || index
            );
            const slideIndex = findIndex !== -1 ? findIndex : fallbackIndex;
            sliderEl.swiper.slideTo(slideIndex, 0);
            sliderEl.swiper.update();
          }
        });
    };

    new Swiper(sliderEl, {
      slidesPerView: 1,
      speed: 800,
      loop: isLoop,
      zoom: {
        maxRatio: 2,
      },
      mousewheel: {
        forceToAxis: true,
      },
      navigation: {
        nextEl: buttonNext,
        prevEl: buttonPrev,
      },
      on: {
        afterInit: function () {
          section
            .querySelectorAll(".product__media-list .product__media-toggle")
            .forEach((elem) => {
              elem.addEventListener("click", onMainSliderToggleClick);
            });
        },
        slideChange: function () {
          //window.pauseAllMedia();
          window.pauseAllModels();
          this.params.noSwiping = false;
          sliderEl.classList.remove("zoom");
        },
        touchMove: function () {
          sliderEl.classList.remove("zoom");
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

  const initStackedPreviews = (section) => {
    if (!section || !section.classList.contains("product-section")) {
      return;
    }

    const mediaList = section.querySelector(
      ".product__media-list[data-desktop-type='stacked_previews']"
    );
    const thumbs = section.querySelector(
      ".product__media-sublist[data-desktop-type='stacked_previews']"
    );
    if (!mediaList || !thumbs) return;

    const mediaEls = Array.from(mediaList.querySelectorAll("[data-media-id]"));
    const thumbEls = Array.from(thumbs.querySelectorAll("[data-media-sub-id]"));

    const setActiveThumb = (mediaId) => {
      thumbEls.forEach((thumb) => {
        thumb.classList.toggle("active", thumb.dataset.mediaSubId === mediaId);
      });

      const activeThumb = thumbs.querySelector(
        `[data-media-sub-id="${mediaId}"]`
      );
      if (!activeThumb) return;
      const thumbHeight = activeThumb.offsetHeight;
      const activeIndex = thumbEls.findIndex(
        (el) => el.dataset.mediaSubId === mediaId
      );

      const nextIndex = Math.min(activeIndex + 1, thumbEls.length - 1);

      const scrollTarget =
        thumbEls[nextIndex].offsetTop - thumbs.clientHeight / 2 + thumbHeight;

      thumbs.scrollTo({
        top: scrollTarget,
        behavior: "smooth",
      });
    };

    const onScroll = () => {
      if (window.innerWidth < 990) return;
      const viewportMiddle = window.scrollY + window.innerHeight / 2;

      let closestMedia = null;
      let closestDistance = Infinity;

      for (const mediaEl of mediaEls) {
        const rect = mediaEl.getBoundingClientRect();
        const mediaTop = window.scrollY + rect.top;
        const distance = Math.abs(mediaTop - viewportMiddle);

        if (mediaTop < viewportMiddle && distance < closestDistance) {
          closestDistance = distance;
          closestMedia = mediaEl;
        }
      }

      if (closestMedia) {
        setActiveThumb(closestMedia.dataset.mediaId);
      }
    };

    requestAnimationFrame(() => {
      onScroll();
    });

    window.addEventListener("scroll", onScroll, { passive: true });

    thumbEls.forEach((thumb) => {
      thumb.addEventListener("click", (e) => {
        if (window.innerWidth < 990) return;
        const mediaId = thumb.dataset.mediaSubId;
        const targetMedia = mediaList.querySelector(
          `[data-media-id="${mediaId}"]`
        );
        if (targetMedia) {
          const offset =
            targetMedia.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: offset - 100, behavior: "smooth" });
          setActiveThumb(mediaId);
        }
      });
    });
  };

  const initProductAccordion = (section) => {
    if (!section || !section.classList.contains("product-section")) {
      return;
    }

    const enableTransition =
      section.dataset.enableAccordionTransition !== "false";
    const accordions = section.querySelectorAll(".product-accordion");

    accordions.forEach((accordion) => {
      accordion.addEventListener("click", (event) => {
        const toggleEl = event.target.closest(".product-accordion__toggle");
        if (!toggleEl) return;

        const contentEl = toggleEl.nextElementSibling;
        if (
          !contentEl ||
          !contentEl.classList.contains("product-accordion__content")
        ) {
          return;
        }

        const isActive = toggleEl.classList.contains("active");
        if (enableTransition) {
          if (!isActive) {
            slideDown(toggleEl, contentEl, 300); // func in global.js
          } else {
            slideUp(toggleEl, contentEl, 300); // func in global.js
          }
        } else {
          toggleEl.classList.toggle("active");
          contentEl.classList.toggle("active");
        }
      });
    });
  };

  const initStickyAddBar = (section) => {
    if (!section || !section.classList.contains("product-section")) return;

    const buyButtons = section.querySelector(
      ".product__buy-buttons > product-form"
    );
    const stickyBar = section.querySelector(".product-sticky-add-bar");
    const footerBottom = document.querySelector(
      ".shopify-section-group-footer-group .footer-bottom"
    );

    if (!stickyBar) return;

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.01,
    };

    const isElementBelowScroll = (element) => {
      return element ? element.getBoundingClientRect().top > 0 : false;
    };

    const toggleStickyBar = (isVisible) => {
      if (isVisible || isElementBelowScroll(buyButtons)) {
        stickyBar.classList.remove("active");
      } else {
        stickyBar.classList.add("active");
      }
    };

    const handleIntersect = (entries) => {
      const isVisible = entries.some((entry) => entry.isIntersecting);
      toggleStickyBar(isVisible);
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    if (buyButtons) observer.observe(buyButtons);
    if (footerBottom) observer.observe(footerBottom);
  };

  let isZoomCursorInit = false;
  const initZoomCursor = (section) => {
    if (!section || !section.classList.contains("product-section")) {
      return;
    }

    const mediaWrapper = section.querySelector(".product__media-list");
    const hasZoom =
      mediaWrapper.getAttribute("data-has-desktop-zoom") === "true";
    if (!hasZoom) return;

    const cursorEl = section.querySelector(".product__media-cursor");
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
      if (!e.target.closest(".product__media-toggle")) {
        mediaWrapper.classList.remove("cursor-active");
      } else {
        mediaWrapper.classList.add("cursor-active");
      }

      const wrapperRect = mediaWrapper.getBoundingClientRect();
      const cursorRect = cursorEl.getBoundingClientRect();

      targetX = e.clientX - wrapperRect.left - cursorRect.width / 2;
      targetY = e.clientY - wrapperRect.top - cursorRect.height / 2;

      if (!isAnimating) {
        animateCursor();
      }
    };

    const handleMouseEnter = (e) => {
      const wrapperRect = mediaWrapper.getBoundingClientRect();
      const cursorRect = cursorEl.getBoundingClientRect();

      targetX = currentX = e.clientX - wrapperRect.left - cursorRect.width / 2;
      targetY = currentY = e.clientY - wrapperRect.top - cursorRect.height / 2;

      cursorEl.style.left = `${currentX}px`;
      cursorEl.style.top = `${currentY}px`;

      mediaWrapper.classList.add("cursor-active");
    };

    const handleMouseLeave = () => {
      mediaWrapper.classList.remove("cursor-active");
    };

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (
          entry.contentRect.width >= 990 &&
          window.matchMedia("screen and (hover: hover) and (pointer: fine)")
            .matches
        ) {
          if (isZoomCursorInit) return;
          mediaWrapper.addEventListener("mouseenter", handleMouseEnter);
          mediaWrapper.addEventListener("mousemove", handleMouseMove);
          mediaWrapper.addEventListener("mouseleave", handleMouseLeave);

          isZoomCursorInit = true;
        } else {
          if (!isZoomCursorInit) return;
          mediaWrapper.removeEventListener("mouseenter", handleMouseEnter);
          mediaWrapper.removeEventListener("mousemove", handleMouseMove);
          mediaWrapper.removeEventListener("mouseleave", handleMouseLeave);

          isZoomCursorInit = false;
        }
      });
    });

    resizeObserver.observe(section);
  };

  initSubSlider(section);
  initMainSlider(section);
  initZoomSlider(section);
  initStackedPreviews(section);

  initStickyAddBar(section);
  initZoomCursor(section);
  initProductAccordion(section);

  document.addEventListener("shopify:section:load", (event) => {
    initSubSlider(event.target);
    initMainSlider(event.target);
    initZoomSlider(event.target);
    initStackedPreviews(event.target);

    initStickyAddBar(event.target);
    initZoomCursor(event.target);
    if (!window.Shopify.designMode) {
      initProductAccordion(event.target);
    }
  });
}

initProductPage(document.currentScript.parentElement);
