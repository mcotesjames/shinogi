class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 800);

    this.facetButton = document.querySelector(".facets-button-show");
    this.productGrid = document.getElementById("ProductGridContainer");
    this.facetForm = this.querySelector("form");
    this.facetSubmitButton = this.querySelector(".facets__submit");

    this.facetsOverlay = this.querySelector(".facets__overlay");
    this.facetWrapper = this.querySelector("#FacetsWrapperDesktop");

    this.facetForm?.addEventListener(
      "input",
      this.debouncedOnSubmit.bind(this)
    );
    this.facetSubmitButton?.addEventListener(
      "click",
      this.debouncedOnSubmit.bind(this)
    );

    if (this.classList.contains("facets--desktop")) {
      this.facetWrapper?.addEventListener(
        "keydown",
        this.onHandleKeyDown.bind(this)
      );
      this.facetButton?.addEventListener(
        "click",
        this.handleFacetButtonClick.bind(this)
      );

      this.addEventListener("click", (event) => {
        const btn = event.target.closest(".facets-modal__close");
        if (btn) {
          event.preventDefault();
          this.closeFacets(event);

          if (btn.classList.contains("modal-close-button")) {
            document.querySelector(".js-switch-card-size")?.focus();
          }
        }
      });

      this.facetsOverlay?.addEventListener(
        "click",
        this.closeFacets.bind(this)
      );
    }

    if (this.dataset?.facetsDesktopType === "horizontal") {
      this.preventCloseSummaryForHorizontal();
    }

    if (this.querySelector(".facet-sort-select")) {
      this.initCustomSortSelect();
    }

    FacetFiltersForm.initAccessibleFacetCheckboxes();
    FacetFiltersForm.handleHeroFilters();
  }

  static initAccessibleFacetCheckboxes() {
    document.addEventListener("keydown", (e) => {
      if (e.target.closest("label.facet-checkbox")) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          const input = document.getElementById(e.target.getAttribute("for"));
          if (!input || input.disabled) return;

          input.checked = !input.checked;
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    });
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state
        ? event.state.searchParams
        : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    window.addEventListener("popstate", onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll(".js-facet-remove").forEach((element) => {
      element.classList.toggle("disabled", disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const countContainer = document.getElementById("ProductCount");
    const countContainerDesktop = document.getElementById(
      "ProductCountDesktop"
    );

    document
      .getElementById("ProductGridContainer")
      .querySelector(".collection")
      .classList.add("loading");
    if (countContainer) {
      countContainer.classList.add("loading");
    }
    if (countContainerDesktop) {
      countContainerDesktop.classList.add("loading");
    }

    document.querySelectorAll(".facets__reset").forEach((btn) => {
      btn.classList.add("disabled");
    });

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl)
        ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
        : FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [
          ...FacetFiltersForm.filterData,
          { html, url },
        ];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
        FacetFiltersForm.renderActiveFilterCount(html);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
    FacetFiltersForm.renderActiveFilterCount(html);
  }

  static renderProductGridContainer(html) {
    document.getElementById("ProductGridContainer").innerHTML = new DOMParser()
      .parseFromString(html, "text/html")
      .getElementById("ProductGridContainer").innerHTML;
    if (
      document.querySelector(".js-load-more") ||
      document.querySelector(".js-infinite-scroll")
    ) {
      initLoadMore();
    }
  }

  static renderProductCount(html) {
    const count =
      new DOMParser()
        .parseFromString(html, "text/html")
        .getElementById("ProductCount")?.innerHTML || "";

    const container = document.getElementById("ProductCount");
    const containerDesktop = document.getElementById("ProductCountDesktop");

    container.innerHTML = count;
    container.classList.remove("loading");

    if (containerDesktop) {
      containerDesktop.innerHTML = count;
      containerDesktop.classList.remove("loading");
    }
  }

  static renderActiveFilterCount(html) {
    const parsedHTML = new DOMParser().parseFromString(html, "text/html");
    const facetButtonSource = parsedHTML.querySelector(".facets-button-show");
    const facetButtonTarget = document.querySelector(".facets-button-show");

    if (!facetButtonSource || !facetButtonTarget) return;

    const sourceCounter = facetButtonSource.querySelector(
      ".facets-button-show__counter"
    );
    const targetCounter = facetButtonTarget.querySelector(
      ".facets-button-show__counter"
    );

    if (sourceCounter) {
      if (targetCounter) {
        targetCounter.innerHTML = sourceCounter.innerHTML;
      } else {
        const label = facetButtonTarget.querySelector(".button__label");
        if (label)
          label.insertAdjacentElement(
            "afterend",
            sourceCounter.cloneNode(true)
          );
      }
    } else {
      if (targetCounter) targetCounter.remove();
    }
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, "text/html");

    const facetDetailsElements = parsedHTML.querySelectorAll(
      "#FacetFiltersForm .js-filter"
    );
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest(".js-filter") : undefined;
      return jsFilter
        ? element.dataset.index === jsFilter.dataset.index
        : false;
    };
    const facetsToRender = Array.from(facetDetailsElements).filter(
      (element) => !matchesIndex(element)
    );
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

    facetsToRender.forEach((element) => {
      document.querySelector(
        `.js-filter[data-index="${element.dataset.index}"]`
      ).innerHTML = element.innerHTML;
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);

    if (countsToRender) {
      FacetFiltersForm.renderCounts(
        countsToRender,
        event.target.closest(".js-filter")
      );
    }

    FacetFiltersForm.handleHeroFilters();

    document.querySelectorAll(".facets__reset").forEach((btn) => {
      btn.classList.remove("disabled");
    });
  }

  static renderActiveFacets(html) {
    const activeFacetsElement = html.querySelector(".active-facets-desktop");
    if (!activeFacetsElement) return;
    document.querySelector(".active-facets-desktop").innerHTML =
      activeFacetsElement.innerHTML;

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderCounts(source, target) {
    const targetElement = target.querySelector(".facets__selected");
    const sourceElement = source.querySelector(".facets__selected");

    const targetElementAccessibility = target.querySelector(".facets__summary");
    const sourceElementAccessibility = source.querySelector(".facets__summary");

    if (sourceElement && targetElement) {
      target.querySelector(".facets__selected").outerHTML =
        source.querySelector(".facets__selected").outerHTML;
    }

    if (targetElementAccessibility && sourceElementAccessibility) {
      target.querySelector(".facets__summary").outerHTML =
        source.querySelector(".facets__summary").outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState(
      { searchParams },
      "",
      `${window.location.pathname}${searchParams && "?".concat(searchParams)}`
    );
  }

  static getSections() {
    return [
      {
        section: document.getElementById("product-grid").dataset.id,
      },
    ];
  }

  static handleHeroFilters() {
    const checkboxes = document.querySelectorAll(
      '#FacetFiltersByProductTypeForm .js-filter input[type="checkbox"]'
    );

    const tags = document.querySelectorAll(".tag-filters .js-hero-filter");

    const removebtn = document.querySelector(
      "#FacetFiltersByProductTypeForm .js-hero-filter-clear, .collection-hero__filters .js-hero-filter-clear"
    );

    if (!removebtn) return;

    let someSelected = false;

    if (checkboxes?.length) {
      someSelected = Array.from(checkboxes).some(
        (checkbox) => checkbox.checked
      );
    }
    if (tags?.length) {
      const parts = decodeURIComponent(location.pathname)
        .split("/")
        .filter(Boolean);

      const last = parts.at(-1) || "";
      const active = new Set(
        last
          .split("+")
          .filter(Boolean)
          .map((s) => s.toLowerCase())
      );

      tags.forEach((tag) => {
        const handle = (tag.dataset.tagHandle || tag.id || "").toLowerCase();
        tag.classList.toggle("active", active.has(handle));
      });

      Array.from(tags).some(
        (tag) => tag.classList.contains("active") && (someSelected = true)
      );
    }

    if (!removebtn) return;
    if (someSelected) {
      removebtn.classList.remove("disabled");
      removebtn.classList.remove("button--secondary");
      removebtn.classList.add("button--primary");
    } else {
      removebtn.classList.add("disabled");
      removebtn.classList.remove("button--primary");
      removebtn.classList.add("button--secondary");
    }

    removebtn.addEventListener("click", () => {
      Array.from(checkboxes).forEach((checkbox) => {
        checkbox.checked = false;
      });
      Array.from(tags).forEach((tag) => {
        tag.classList.remove("active");
      });
      removebtn.classList.add("disabled");
    });
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const sortFilterForms = document.querySelectorAll(
      "facet-filters-form form"
    );

    const forms = [];
    const currentForm = event.target.closest("form");
    sortFilterForms.forEach((form) => {
      if (
        form.id === "FacetSortForm" ||
        form.id === "FacetFiltersForm" ||
        form.id === "FacetSortDrawerForm" ||
        form.id === "FacetFiltersByProductTypeForm"
      ) {
        const noJsElements = document.querySelectorAll(".no-js-list");
        noJsElements.forEach((el) => el.remove());
        if (currentForm === form) {
          forms.push(this.createSearchParams(form));
        } else {
          const searchParamsWithoutProductType =
            this.createSearchParams(form)
              ?.split("&")
              ?.filter(
                (element) => !element.startsWith("filter.p.product_type")
              )
              ?.join("&") || "";

          forms.push(searchParamsWithoutProductType);
        }
      }
    });
    this.onSubmitForm(forms.join("&"), event);
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();

    const url =
      event.currentTarget.href.indexOf("?") == -1
        ? ""
        : event.currentTarget.href.slice(
            event.currentTarget.href.indexOf("?") + 1
          );
    FacetFiltersForm.renderPage(url);

    const removebtn = document.querySelector(
      "#FacetFiltersByProductTypeForm .facets-tag-wrapper"
    );
    removebtn?.classList.add("active");
  }

  handleFacetButtonClick(event) {
    event.preventDefault();

    if (!this.facetButton || !this.facetForm) return;

    let labelHide = this.facetButton.querySelector(".hide-label");
    let labelShow = this.facetButton.querySelector(".show-label");
    let container = this.facetForm.querySelector(".facets__container");

    this.facetButton.classList.add("active");
    labelHide?.classList.remove("hidden");
    labelShow?.classList.add("hidden");
    container?.classList.add("active");
    document.body.classList.add("overflow-hidden");

    this.addEventListener(
      "transitionend",
      () => {
        trapFocus(this, this.querySelector('[role="dialog"]'));
      },
      { once: true }
    );
  }

  closeFacets(event) {
    event.preventDefault();

    if (!this.facetButton || !this.facetForm) return;

    let labelHide = this.facetButton.querySelector(".hide-label");
    let labelShow = this.facetButton.querySelector(".show-label");
    let container = this.facetForm.querySelector(".facets__container");

    this.facetButton?.classList.remove("active");
    labelHide?.classList.add("hidden");
    labelShow?.classList.remove("hidden");
    container?.classList.remove("active");

    removeTrapFocus(this.focusElement);
    setTimeout(() => document.body.classList.remove("overflow-hidden"), 300);
  }

  onHandleKeyDown(event) {
    if (
      event.key === "Escape" &&
      this.facetWrapper?.closest(".facets__container.active")
    ) {
      this.closeFacets(event);
    }
  }

  initCustomSortSelect() {
    const selectWrapper = this.querySelector(".facet-sort-select");
    const customSelect = this.querySelector(".facet-sort-select__select");
    const currentValue = this.querySelector(".facet-sort-select__current");
    const customOptions = this.querySelectorAll(".facet-sort-select__option");
    const hiddenInput = this.querySelector(".facet-sort-select__input");

    customSelect.addEventListener("click", () => {
      selectWrapper.classList.toggle("open");
    });

    customSelect.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        selectWrapper.classList.toggle("open");
      }
    });

    const onSelectOption = (event) => {
      event.preventDefault();

      if (event.target.matches("[data-value]")) {
        const option = event.target;
        const value = event.target.dataset.value;
        const text = event.target.textContent;

        hiddenInput.value = value;
        this.facetForm?.dispatchEvent(new Event("input"));
        currentValue.textContent = text;
        customOptions.forEach((option) => {
          option.classList.remove("facet-sort-select__option--selected");
        });
        option.classList.add("facet-sort-select__option--selected");
        selectWrapper.classList.remove("open");
      }
    };

    customOptions.forEach((option) => {
      option.addEventListener("click", (event) => onSelectOption(event));

      option.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          onSelectOption(event);
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (!selectWrapper.contains(event.target)) {
        selectWrapper.classList.remove("open");
      }
    });
  }

  preventCloseSummaryForHorizontal() {
    if (!this.facetWrapper) return;

    const allDetails = this.facetWrapper.querySelectorAll(
      "#FacetFiltersForm.facets__form--horizontal .js-filter"
    );
    if (!allDetails.length) return;

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (window.innerWidth >= 990) {
          allDetails.forEach((details) => {
            details.setAttribute("open", true);
          });
        }
      });
    });

    observer.observe(this.facetWrapper);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define("facet-filters-form", FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll("input").forEach((element) =>
      element.addEventListener("change", this.onRangeChange.bind(this))
    );
    this.setMinAndMaxValues();
    this.controlSlider();
    this.controlInput();
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll(".field__input");
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute("max", maxInput.value);
    if (minInput.value) maxInput.setAttribute("min", minInput.value);
    if (minInput.value === "") {
      maxInput.setAttribute("min", 0);
    }
    if (maxInput.value === "") {
      minInput.setAttribute("max", maxInput.getAttribute("max"));
    }
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute("min"));
    const max = Number(input.getAttribute("max"));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }

  fillSlider() {
    const inputRangeWrappers = document.querySelectorAll(
      ".facets__price .facets__range"
    );
    inputRangeWrappers.forEach((inputWrapper) => {
      const inputsRange = inputWrapper.querySelectorAll(".field__range");
      const inputRangeFrom = inputsRange[0];
      const inputRangeTo = inputsRange[1];

      const range = Number(inputRangeTo.max) - Number(inputRangeTo.min);
      const fromCurrent =
        Number(inputRangeFrom.value) - Number(inputRangeTo.min);
      const toCurrent = Number(inputRangeTo.value) - Number(inputRangeTo.min);
      const minRange = (fromCurrent / range) * 100;
      const maxRange = (toCurrent / range) * 100;

      inputWrapper.setAttribute(
        "style",
        `--range-min: ${minRange}%; --range-max: ${maxRange}%`
      );
    });
  }

  controlSlider() {
    const inputRangeWrappers = document.querySelectorAll(
      ".facets__price .facets__range"
    );
    const inputNumberWrappers = document.querySelectorAll(
      ".facets__price .facets__price-wrapper"
    );

    inputRangeWrappers.forEach((inputWrapper, index) => {
      const inputsRange = inputWrapper.querySelectorAll(".field__range");
      const inputRangeFrom = inputsRange[0];
      const inputRangeTo = inputsRange[1];
      const inputNumberFrom =
        inputNumberWrappers[index].querySelectorAll(".field__input")[0];
      const inputNumberTo =
        inputNumberWrappers[index].querySelectorAll(".field__input")[1];

      inputRangeFrom.oninput = () => {
        const from = Number(inputRangeFrom.value);
        const to = Number(inputRangeTo.value);
        if (from > to) {
          inputRangeFrom.value = to;
          inputNumberFrom.value = to;
        } else {
          inputNumberFrom.value = from;
        }

        this.fillSlider();
      };

      if (Number(inputRangeTo.value) <= 0) {
        inputRangeTo.style.zIndex = 2;
      } else {
        inputRangeTo.style.zIndex = 0;
      }

      inputRangeTo.oninput = () => {
        const from = Number(inputRangeFrom.value);
        const to = Number(inputRangeTo.value);
        if (from <= to) {
          inputRangeTo.value = to;
          inputNumberTo.value = to;
        } else {
          inputNumberTo.value = from;
          inputRangeTo.value = from;
        }

        if (Number(inputRangeTo.value) <= 0) {
          inputRangeTo.style.zIndex = 2;
        } else {
          inputRangeTo.style.zIndex = 0;
        }

        this.fillSlider();
      };
    });
  }

  controlInput() {
    const inputRangeWrappers = document.querySelectorAll(
      ".facets__price .facets__range"
    );
    const inputNumberWrappers = document.querySelectorAll(
      ".facets__price .facets__price-wrapper"
    );

    inputNumberWrappers.forEach((inputWrapper, index) => {
      const inputsNumber = inputWrapper.querySelectorAll(".field__input");
      const inputNumberFrom = inputsNumber[0];
      const inputNumberTo = inputsNumber[1];
      const inputRangeFrom =
        inputRangeWrappers[index].querySelectorAll(".field__range")[0];
      const inputRangeTo =
        inputRangeWrappers[index].querySelectorAll(".field__range")[1];

      inputNumberFrom.oninput = () => {
        const from = Number(inputNumberFrom.value);
        const to = Number(inputNumberTo.value);

        if (to && from > to) {
          inputRangeFrom.value = to;
        } else {
          inputRangeFrom.value = from;
        }

        this.fillSlider();
      };

      inputNumberTo.oninput = () => {
        const from = Number(inputNumberFrom.value);
        const to = Number(inputNumberTo.value);

        if (to >= from) {
          inputRangeTo.value = to;
        } else {
          inputRangeTo.value = from;
        }

        this.fillSlider();
      };

      inputNumberFrom.onblur = () => {
        const from = Number(inputNumberFrom.value);
        const min = Number(inputNumberFrom.getAttribute("min"));
        const max = Number(inputNumberFrom.getAttribute("max"));

        if (from < min) {
          inputRangeFrom.value = min;
          inputNumberFrom.value = min;
        } else {
          inputRangeFrom.value = from;
        }

        this.fillSlider();
      };

      inputNumberTo.onblur = () => {
        const to = Number(inputNumberTo.value);
        const min = Number(inputNumberTo.getAttribute("min"));
        const max = Number(inputNumberTo.getAttribute("max"));

        if (to > max) {
          inputRangeTo.value = max;
          inputNumberTo.value = max;
        } else {
          inputRangeTo.value = to;
        }

        this.fillSlider();
      };
    });
  }
}

customElements.define("price-range", PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector("a");
    facetLink.setAttribute("role", "button");
    facetLink.addEventListener("click", this.closeFilter.bind(this));
    facetLink.addEventListener("keyup", (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === "SPACE") this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form =
      this.closest("facet-filters-form") ||
      document.querySelector("facet-filters-form");
    form.onActiveFilterClick(event);
  }
}

customElements.define("facet-remove", FacetRemove);
