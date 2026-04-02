(function () {
  const removeHighlight = (blocks, isButton = false) => {
    blocks.forEach((block) => {
      if (!isButton) {
        block.classList.remove("highlight--item");
      } else {
        block.classList.remove("button--primary");
        block.classList.add("button--secondary");
      }
    });
  };

  const returnActiveItem = (target, wrapper, isButton = false) => {
    if (!target || !wrapper) return;
    const blockType = isButton
      ? ".store-locations__tab"
      : ".store-locations__image";
    return wrapper.querySelector(
      `${blockType}[data-block-identifier="${target}"]`
    );
  };

  const highlightTab = (tab) => {
    if (!tab) return;

    if (tab?.classList.contains("button--primary")) return;
    tab?.classList.remove("button--secondary");
    tab?.classList.add("button--primary");
  };

  const addHighlight = (target, wrapper, isButton = false) => {
    if (!isButton) {
      const activeItem = returnActiveItem(target, wrapper);
      if (!activeItem) return;
      activeItem.classList.add("highlight--item");
    } else {
      const activeItem = returnActiveItem(target, wrapper, isButton);
      if (!activeItem) return;
      highlightTab(activeItem);
    }
  };

  const highlightElementsOnClick = (target, wrapper, section) => {
    if (!section || !target || !wrapper) return;
    const locationsList = wrapper.querySelector(
      ".store-locations__locations-outer"
    );
    const tabsPanel = wrapper.querySelector(".store-locations__tabs");
    if (!locationsList) return;

    const locationNameToShow = wrapper.querySelector(
      `.store-locations__group[data-group-name="${target}"]`
    );
    if (locationNameToShow) {
      const pageHeader = document.querySelector("sticky-header.header-wrapper");
      let headerRevealTimeout = null;

      const locationsObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const tabsPanelHeight = tabsPanel?.clientHeight ?? 0;

          if (document.documentElement.clientWidth >= 990) {
            const offset = tabsPanelHeight
              ? locationNameToShow.offsetTop - tabsPanelHeight
              : locationNameToShow.offsetTop;
            locationsList.scrollTo({
              top: offset,
              behavior: "instant",
            });
          } else {
            if (pageHeader) {
              if (headerRevealTimeout) clearTimeout(headerRevealTimeout);
              pageHeader.preventReveal = true;
            }

            const elementRect = locationNameToShow.getBoundingClientRect();
            const absoluteElementTop = window.scrollY + elementRect.top;
            const offset = absoluteElementTop - tabsPanelHeight;
            window.scrollTo({
              top: offset,
              behavior: "instant",
            });

            if (pageHeader) {
              headerRevealTimeout = setTimeout(() => {
                pageHeader.preventReveal = false;
              }, 3000);
            }
          }
        });
      });

      locationsObserver.observe(section);
    }

    const locationsToShow = wrapper.querySelectorAll(
      `.store-locations__location[data-group-name="${target}"]`
    );
    if (!locationsToShow?.length > 0) return;
    const firstLocation = locationsToShow[0];
    const mediaIdentifier = firstLocation.dataset.blockId;

    firstLocation.classList.add("highlight--item");
    addHighlight(mediaIdentifier, wrapper);
  };
  const setActiveTabOnScroll = (wrapper, tabs) => {
    if (!wrapper || !tabs) return;

    const groupWrappers = wrapper.querySelectorAll(
      ".store-locations__group-wrapper"
    );
    if (!groupWrappers.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length) {
          const topMost = visible[0];
          const groupName = topMost.target.dataset.groupName;

          removeHighlight(tabs, true);

          const activeTab = wrapper.querySelector(
            `.store-locations__tab[data-block-identifier="${groupName}"]`
          );
          if (activeTab) highlightTab(activeTab);
        }
      },
      {
        root: null,
        threshold: 0.1,
        rootMargin: "-20% 0px -70% 0px",
      }
    );

    groupWrappers.forEach((el) => observer.observe(el));
  };

  const initScrollStyles = (section) => {
    if (!section || !section.classList.contains("store-locations-section"))
      return;
    const locationsWrapper = section.querySelector(".store-locations__wrapper");
    if (!locationsWrapper) return;
    const tabsPanel = section.querySelector(".store-locations__tabs");
    const locationsListWrapper = section.querySelector(
      ".store-locations__locations-outer"
    );
    const locationsList = section.querySelector(".store-locations__list");

    if (!tabsPanel) return;
    section.style.setProperty("--tabs-height", `${tabsPanel.offsetHeight}px`);
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (window.innerWidth < 990) {
          locationsListWrapper.style.height = "unset";
          locationsList.style.paddingTop = `0px`;
        } else {
          const tabsPanelHeight = tabsPanel.offsetHeight;
          const wrapperHeight = locationsWrapper.offsetHeight - tabsPanelHeight;
          locationsListWrapper.style.height = `${wrapperHeight}px`;
          locationsList.style.paddingTop = `${tabsPanelHeight}px`;
        }
      });
    });

    observer.observe(section);
  };

  const initStoreLocations = (section) => {
    if (!section || !section.classList.contains("store-locations-section")) {
      return;
    }
    const locationsWrapper = section.querySelector(".store-locations__wrapper");
    if (!locationsWrapper) return;
    const blocksCollection = locationsWrapper.querySelectorAll(
      ".store-locations__location"
    );
    const tabsCollection = locationsWrapper.querySelectorAll(
      ".store-locations__tab"
    );
    const mediaCollection = locationsWrapper.querySelectorAll(
      ".store-locations__image"
    );
    if (!blocksCollection?.length > 0 || !mediaCollection?.length > 0) return;

    blocksCollection.forEach((block) => {
      block.addEventListener("mouseenter", (e) => {
        removeHighlight(blocksCollection);
        removeHighlight(mediaCollection);
        tabsCollection?.length > 0 && removeHighlight(tabsCollection, true);

        const target = e.target.closest(".store-locations__location");
        target.classList.add("highlight--item");

        const targetBlockId = target.dataset.blockId;
        const targetGroupName = target.dataset.groupName;
        // Finds media by block id and tab by group name
        addHighlight(targetBlockId, locationsWrapper);
        tabsCollection?.length > 0 &&
          addHighlight(targetGroupName, locationsWrapper, true);
      });
    });

    if (!tabsCollection?.length > 0) return;
    tabsCollection.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        removeHighlight(blocksCollection);
        removeHighlight(mediaCollection);
        removeHighlight(tabsCollection, true);
        const target = e.target.closest(".store-locations__tab");
        const targetGroupName = target.dataset.blockIdentifier;
        highlightTab(target);
        highlightElementsOnClick(targetGroupName, locationsWrapper, section);
      });
    });

    const mobileObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (document.documentElement.clientWidth < 990) {
          removeHighlight(blocksCollection);
          setActiveTabOnScroll(locationsWrapper, tabsCollection);
        } else {
          mobileObserver.disconnect();
        }
      });
    });

    mobileObserver.observe(section);
  };

  initScrollStyles(document.currentScript.parentElement);
  initStoreLocations(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (event) {
    initScrollStyles(event.target);
    initStoreLocations(event.target);
  });
})();
