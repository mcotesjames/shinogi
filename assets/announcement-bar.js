(function () {
  const initAnnBar = () => {
    const annBar = document.querySelector(".section-announcement");

    let intersectionObserver;
    let resizeObserver;
    let lastRatio = 1;

    const updateHeight = (intersectionRatio = 1) => {
      const annBarHeight = annBar?.getBoundingClientRect().height || 0;
      const effectiveHeight = (annBarHeight * intersectionRatio).toFixed(2);
      document.documentElement.style.setProperty(
        "--ann-height",
        `${effectiveHeight}px`
      );
    };

    const createObservers = () => {
      if (intersectionObserver) intersectionObserver.disconnect();
      if (resizeObserver) resizeObserver.disconnect();

      intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              updateHeight(entry.intersectionRatio);
              lastRatio = entry.intersectionRatio;
            } else {
              document.documentElement.style.setProperty("--ann-height", "0px");
              lastRatio = 0;
            }
          });
        },
        {
          threshold: Array.from({ length: 1000 }, (_, i) => i / 1000),
        }
      );

      resizeObserver = new ResizeObserver(() => {
        updateHeight(lastRatio);
      });

      if (annBar) intersectionObserver.observe(annBar);
      if (annBar) resizeObserver.observe(annBar);
    };

    createObservers();
  };

  document.addEventListener("shopify:section:load", initAnnBar);
  document.addEventListener("shopify:section:unload", initAnnBar);
  document.addEventListener("shopify:section:reorder", initAnnBar);

  initAnnBar();
})();
