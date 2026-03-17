(function () {
  let isCursorInit;
  const initCursor = (section) => {
    if (!section || !section?.classList.contains("text-banner-section")) return;

    const contentSection = section.querySelector(".text-banner__wrapper");

    if (!contentSection) return;

    const isCursorExist = JSON.parse(contentSection.dataset.cursor);

    if (!isCursorExist) return;

    const imgCursorEl = section.querySelector(".text-banner__image-wrapper");

    if (!imgCursorEl) return;

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

      imgCursorEl.style.left = `${currentX}px`;
      imgCursorEl.style.top = `${currentY}px`;

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
      const contentRect = contentSection.getBoundingClientRect();
      const imgCursorElRect = imgCursorEl.getBoundingClientRect();
      const sectionBtn = contentSection.querySelector(".text-banner__btn");
      const sectionTextLinks = contentSection.querySelectorAll(
        ".text-banner__heading a, .text-banner__description a"
      );

      let isOverLink = false;
      sectionTextLinks.forEach((link) => {
        if (
          e.clientX > link.getBoundingClientRect().left - 12 &&
          e.clientX < link.getBoundingClientRect().right + 12 &&
          e.clientY > link.getBoundingClientRect().top - 12 &&
          e.clientY < link.getBoundingClientRect().bottom + 12
        ) {
          isOverLink = true;
          return;
        }
      });

      const isOverButton = sectionBtn
        ? e.clientX > sectionBtn.getBoundingClientRect().left - 12 &&
          e.clientX < sectionBtn.getBoundingClientRect().right + 12 &&
          e.clientY > sectionBtn.getBoundingClientRect().top - 12 &&
          e.clientY < sectionBtn.getBoundingClientRect().bottom + 12
        : false;

      targetX = e.clientX - contentRect.left - imgCursorElRect.width / 2;
      targetY = e.clientY - contentRect.top - imgCursorElRect.height / 2;

      const isOutOfBounds =
        targetY > contentRect.height - imgCursorElRect.height / 2 ||
        targetY < 0 - imgCursorElRect.height / 2;

      if (isOverButton || isOutOfBounds || isOverLink) {
        imgCursorEl.classList.remove("cursor-active");
      } else {
        imgCursorEl.classList.add("cursor-active");
      }

      if (!isAnimating) {
        animateCursor();
      }
    };

    const handleMouseEnter = (e) => {
      const contentRect = contentSection.getBoundingClientRect();
      const imgCursorElRect = imgCursorEl.getBoundingClientRect();

      targetX = currentX =
        e.clientX - contentRect.left - imgCursorElRect.width / 2;
      targetY = currentY =
        e.clientY - contentRect.top - imgCursorElRect.height / 2;

      imgCursorEl.style.left = `${currentX}px`;
      imgCursorEl.style.top = `${currentY}px`;

      imgCursorEl.classList.add("cursor-active");
    };

    const handleMouseLeave = () => {
      imgCursorEl.classList.remove("cursor-active");
    };

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (
          window.innerWidth >= 750 &&
          window.matchMedia("(pointer:fine)").matches
        ) {
          if (!isCursorInit) {
            contentSection.addEventListener("mouseenter", handleMouseEnter);
            contentSection.addEventListener("mousemove", handleMouseMove);
            contentSection.addEventListener("mouseleave", handleMouseLeave);

            isCursorInit = true;
          }
        } else {
          if (isCursorInit) {
            contentSection.removeEventListener("mouseenter", handleMouseEnter);
            contentSection.removeEventListener("mousemove", handleMouseMove);
            contentSection.removeEventListener("mouseleave", handleMouseLeave);

            isCursorInit = false;
          }
        }
      });
    });

    observer.observe(section);
  };

  document.addEventListener(
    "DOMContentLoaded",
    initCursor(document.currentScript.parentElement)
  );

  document.addEventListener("shopify:section:load", function (event) {
    initCursor(event.target);
  });
})();
