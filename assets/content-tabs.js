(() => {
  const setActiveContent = (section, activeId) => {
    const contentEls = section.querySelectorAll(".content-tabs__content");

    contentEls.forEach((el) => el.classList.remove("active"));

    const activeContent = section.querySelector(
      `[data-block-id="${activeId}"].content-tabs__content`
    );

    if (activeContent) {
      activeContent.classList.add("active");
    }
  };

  const toggleTab = (section) => {
    const tabs = section.querySelectorAll(".content-tabs__tab");

    tabs.forEach((tab) => {
      const currentId = tab.dataset.blockId;

      tab.addEventListener("click", (event) => {
        if (!event.currentTarget.classList.contains("active")) {
          tabs.forEach((el) => el.classList.remove("active"));
          tab.classList.add("active");
          setActiveContent(section, currentId);
        }
      });

      tab.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          if (!event.currentTarget.classList.contains("active")) {
            tabs.forEach((el) => el.classList.remove("active"));
            tab.classList.add("active");
            setActiveContent(section, currentId);
          }
        }
      });
    });
  };

  const initCollapsibleBlock = (section) => {
    if (!section || !section.classList.contains("content-tabs-section")) return;
    const blocks = section.querySelectorAll(".content-tabs__collapsible");

    blocks.forEach((block) => {
      block.addEventListener("click", (event) => {
        const toggleEl = event.target.closest(
          ".content-tabs__collapsible-toggle"
        );
        if (!toggleEl) return;

        const contentEl = toggleEl.nextElementSibling;
        if (
          !contentEl ||
          !contentEl.classList.contains("content-tabs__collapsible-content")
        ) {
          return;
        }

        const isActive = toggleEl.classList.contains("active");
        if (!isActive) {
          slideDown(toggleEl, contentEl, 300); // func in global.js
        } else {
          slideUp(toggleEl, contentEl, 300); // func in global.js
        }
      });
    });
  };

  const initSection = (section) => {
    if (!section || !section.classList.contains("content-tabs-section")) return;

    toggleTab(section);
  };

  initSection(document.currentScript.parentElement);
  initCollapsibleBlock(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initSection(event.target);
  });
})();
