(function () {
  const showActiveImage = (images, activeItem) => {
    if (!images || !activeItem) return;
    const activeIndex = activeItem.dataset.indexContent;
    Array.from(images)
      .find((img) => img.dataset.indexMedia === activeIndex)
      ?.classList.add("active");
  };

  const hideUnactiveImage = (images, activeItem) => {
    if (!images || !activeItem) return;
    const activeIndex = activeItem.dataset.indexContent;
    Array.from(images)
      .find((img) => img.dataset.indexMedia === activeIndex)
      ?.classList.remove("active");
  };

  const toggleCollapsible = (event, toggles, images) => {
    const answer = event.currentTarget.querySelector(
      ".collapsible-content__answer"
    );

    if (!event.currentTarget.classList.contains("active")) {
      const activeItems = Array.from(toggles).filter((item) =>
        item.classList.contains("active")
      );

      activeItems.forEach((item) => {
        const answer = item.querySelector(".collapsible-content__answer");
        slideUp(item, answer);
        hideUnactiveImage(images, item);
      });

      slideDown(event.currentTarget, answer);
      showActiveImage(images, event.currentTarget);
    } else return;
  };

  const slideAutoplay = (
    toggles,
    images,
    speed,
    stopOnLast = false,
    stopOnHover = false
  ) => {
    let currentIndex = 0;
    let intervalId;
    let progressBars = [];
    let isPaused = false;
    let startTime = null;
    let remainingTime = speed;

    toggles.forEach((toggle) => {
      const progress = toggle.querySelector(".collapsible-content__progress");
      if (progress) {
        progress.style.transition = "none";
        progress.style.width = "0%";
        progressBars.push(progress);
      } else {
        progressBars.push(null);
      }
    });

    const goToIndex = (index) => {
      toggles.forEach((toggle, i) => {
        const answer = toggle.querySelector(".collapsible-content__answer");
        if (i === index) {
          if (!toggle.classList.contains("active")) {
            slideDown(toggle, answer);
            showActiveImage(images, toggle);
          }
          toggle.classList.add("active");
          if (progressBars[i]) {
            progressBars[i].style.transition = `width ${speed}ms linear`;
            progressBars[i].style.width = "100%";
          }
        } else {
          slideUp(toggle, answer);
          hideUnactiveImage(images, toggle);
          toggle.classList.remove("active");
          if (progressBars[i]) {
            progressBars[i].style.transition = "none";
            progressBars[i].style.width = "0%";
          }
        }
      });
    };

    const startAutoplay = () => {
      goToIndex(currentIndex);
      startTime = Date.now();
      intervalId = setInterval(() => {
        if (isPaused) return;

        if (stopOnLast && currentIndex === toggles.length - 1) {
          clearInterval(intervalId);
          return;
        }

        currentIndex = (currentIndex + 1) % toggles.length;
        goToIndex(currentIndex);
        startTime = Date.now();
      }, speed);
    };

    const resetAutoplay = (newIndex) => {
      clearInterval(intervalId);
      currentIndex = newIndex;
      goToIndex(currentIndex);
      startAutoplay();
    };

    toggles.forEach((toggle, i) => {
      toggle.addEventListener("click", () => resetAutoplay(i));
      if (stopOnHover) {
        toggle.addEventListener("mouseenter", () => {
          if (i !== currentIndex) return;

          isPaused = true;

          if (startTime !== null) {
            const elapsed = Date.now() - startTime;
            remainingTime = Math.max(speed - elapsed, 0);
          }

          const progress = progressBars[currentIndex];
          if (progress) {
            const currentWidth = getComputedStyle(progress)?.width;

            progress.style.transition = "none";
            progress.style.width = currentWidth;
          }
        });

        toggle.addEventListener("mouseleave", () => {
          if (i !== currentIndex) return;
          isPaused = false;

          const progress = progressBars[currentIndex];
          if (progress) {
            progress.style.transition = `width ${remainingTime}ms linear`;
            progress.style.width = "100%";
          }

          startTime = Date.now();
        });
      }
    });

    startAutoplay();
  };

  const initCollapsibleContent = (section) => {
    if (
      !section ||
      !section?.classList.contains("collapsible-content-section")
    ) {
      return;
    }
    const collapsibleWrapper = section.querySelector(".collapsible-content");

    const toggles = section.querySelectorAll(".collapsible-content__item");
    const images = section.querySelectorAll(
      ".collapsible-content__image-wrapper"
    );

    if (!toggles || !images) return;

    // Default initialization
    toggles.forEach((toggle) => {
      toggle.addEventListener("click", (event) => {
        toggleCollapsible(event, toggles, images);
      });

      toggle.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle.click();
        }
      });
    });

    // Autoplay initialization
    const isAutoplay = collapsibleWrapper.dataset?.enableAutoplay === "true";
    if (isAutoplay) {
      const autoplaySpeed = collapsibleWrapper.dataset?.autoplaySpeed
        ? Number(collapsibleWrapper.dataset.autoplaySpeed) * 1000
        : 15000;
      const stopOnLast = collapsibleWrapper.dataset?.enableLoop === "false";
      const stopOnHover = collapsibleWrapper.dataset?.stopOnHover === "true";
      if (autoplaySpeed) {
        slideAutoplay(toggles, images, autoplaySpeed, stopOnLast, stopOnHover);
      }
    }
  };

  document.addEventListener(
    "DOMContentLoaded",
    initCollapsibleContent(document.currentScript.parentElement)
  );

  document.addEventListener("shopify:section:load", function (event) {
    initCollapsibleContent(event.target);
  });
})();
