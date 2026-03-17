(() => {
  const animateChars = (lines, delay) => {
    if (!lines || lines.length === 0) return;

    let coeff = lines.length <= 3 ? 0.2 : 0.1;

    lines.forEach((line, lineIndex) => {
      line.querySelectorAll(".word").forEach((word) => {
        word.classList.add("animated");
        word.style.animationDelay = `${delay + lineIndex * coeff}s`;
      });
    });
  };

  const runSlideAnimation = (activeSlide, delay = 0) => {
    if (!activeSlide) return;

    const lines = activeSlide.querySelectorAll(".line");
    const fadeItems = activeSlide.querySelectorAll(".js-fade");
    if (!lines.length) return;

    animateChars(lines, delay);
    const baseDelay = delay * 1000 + lines.length * 150 + 200;

    fadeItems.forEach((item) => {
      const itemDelay = item.classList.contains("js-fade-after")
        ? baseDelay + 150
        : baseDelay;

      setTimeout(() => {
        item.classList.add("visible");
      }, itemDelay);
    });
  };

  const hideElements = (swiper) => {
    if (!swiper?.slides?.length) return;

    swiper.slides.forEach((slide) => {
      if (slide.classList.contains("swiper-slide-active")) return;

      slide.querySelectorAll(".word").forEach((word) => {
        word.classList.remove("animated");
        word.style.opacity = "0";
        word.style.transform = "translate3d(0,100%,0)";
      });

      slide.querySelectorAll(".js-fade").forEach((item) => {
        item.classList.remove("visible");
      });
    });
  };

  const initTextAnimation = (section) => {
    if (!section?.querySelector('[data-animation-type="creative"]')) return;

    // .js-content-slider - swiper class in Testimonials section
    const targetSliderEl = section.querySelector(
      ".js-content-slider, .slideshow__swiper--overlay, .slideshow__swiper--text"
    );
    if (!targetSliderEl || !targetSliderEl.swiper) return;

    const targetSwiper = targetSliderEl.swiper;

    // Clean up existing instances if they exist
    if (section._splitInstances) {
      section._splitInstances.forEach((instance) => {
        if (instance && instance.revert) {
          instance.revert();
        }
      });
      section._splitInstances = [];
    }

    let splitInstances = [];
    let resizeTimeout;

    const buildSplits = () => {
      const headings = targetSliderEl.querySelectorAll(".js-split-text");
      if (headings.length === 0) return;

      // Clean up old instances
      if (splitInstances.length > 0) {
        splitInstances.forEach((instance) => {
          if (instance && instance.revert) {
            instance.revert();
          }
        });
        splitInstances = [];
      }

      // Remove any leftover split classes manually
      headings.forEach((heading) => {
        heading.classList.remove("visible");
        const words = heading.querySelectorAll(".word");
        const lines = heading.querySelectorAll(".line");

        // If splits already exist, remove them manually
        if (words.length > 0 || lines.length > 0) {
          const text = heading.textContent;
          heading.innerHTML = text;
        }
      });

      headings.forEach((heading) => {
        const split = new SplitType(heading, { types: "lines, words" });
        splitInstances.push(split);
        heading.classList.add("visible");
      });

      section._splitInstances = splitInstances;
    };

    if (window.SplitType?.clearData) {
      window.SplitType.clearData();
    }

    hideElements(targetSwiper);
    buildSplits();
    requestAnimationFrame(() => {
      runSlideAnimation(targetSliderEl.querySelector(".swiper-slide-active"));
    });

    let lastWidth = window.innerWidth;
    window.addEventListener("resize", () => {
      const currentWidth = window.innerWidth;
      if (currentWidth !== lastWidth) {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          const activeSlide = targetSliderEl.querySelector(
            ".swiper-slide-active"
          );
          if (!activeSlide) return;

          hideElements(targetSwiper);
          buildSplits();
          requestAnimationFrame(() => {
            runSlideAnimation(activeSlide);
          });
        }, 300);
        lastWidth = currentWidth;
      }
    });

    targetSwiper.on("slideChangeTransitionStart", () => {
      targetSwiper.allowSlideNext = false;
      targetSwiper.allowSlidePrev = false;
      targetSwiper.allowTouchMove = false;

      hideElements(targetSwiper);
      const activeSlide = targetSliderEl.querySelector(".swiper-slide-active");
      runSlideAnimation(activeSlide, 0.5);
    });

    targetSwiper.on("slideChangeTransitionEnd", () => {
      targetSwiper.allowSlideNext = true;
      targetSwiper.allowSlidePrev = true;
      targetSwiper.allowTouchMove = true;
    });

    const siblingSliderEl = section.querySelector(
      ".slideshow__swiper--media, .js-media-slider"
    );
    if (siblingSliderEl && siblingSliderEl.swiper) {
      const siblingSwiper = siblingSliderEl.swiper;

      siblingSwiper.on("slideChangeTransitionStart", () => {
        targetSwiper.allowSlideNext = false;
        targetSwiper.allowSlidePrev = false;
        targetSwiper.allowTouchMove = false;

        hideElements(targetSwiper);
        const activeSlide = targetSliderEl.querySelector(
          ".swiper-slide-active"
        );
        runSlideAnimation(activeSlide, 0.5);
      });

      siblingSwiper.on("slideChangeTransitionEnd", () => {
        targetSwiper.allowSlideNext = true;
        targetSwiper.allowSlidePrev = true;
        targetSwiper.allowTouchMove = true;
      });
    }
  };

  initTextAnimation(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initTextAnimation(event.target);
  });
})();
