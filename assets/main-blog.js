class BlogTagFilter extends HTMLElement {
  constructor() {
    super();

    this.selectorPostsContainer = ".main-blog-posts-container";
    this.selectorTagsContainer = ".main-blog__tag-filter-items";
    this.selectorBreadcrumbs = "#breadcrumbs";

    this.postsContainer = document.querySelector(this.selectorPostsContainer);
    this.tagsContainer = document.querySelector(this.selectorTagsContainer);
    this.breadcrumbs = document.querySelector(this.selectorBreadcrumbs);
    this.cachedData = {};

    this.onTagClick = this.onTagClick.bind(this);

    this.addEventListeners(
      this.querySelectorAll(".main-blog__tag-filter-link")
    );
  }

  addEventListeners(tags) {
    tags.forEach((tag) => tag.addEventListener("click", this.onTagClick));
  }

  onTagClick(event) {
    event.preventDefault();
    const tag = event.currentTarget;
    if (!tag.classList.contains("main-blog__tag-filter-link")) return;
    const url = tag.getAttribute("data-url");

    if (tag.classList.contains("clear-filters")) {
      this.querySelectorAll(".main-blog__tag-filter-link")?.forEach((link) => {
        link?.classList.remove("active");
      });
      this.updateBrowserUrl(url, true);
    } else {
      const clearFilters = this.querySelector(
        ".main-blog__tag-filter-link.clear-filters"
      );
      if (clearFilters && clearFilters.classList.contains("active")) {
        clearFilters.classList.remove("active");
      }
    }
    this.renderPage(url);
  }

  renderPage(url) {
    if (this.cachedData[url]) {
      this.renderSectionFromCache(url);
      return;
    }

    this.renderSectionFromFetch(url);
  }

  renderSectionFromFetch(url) {
    this.postsContainer?.classList.add("loading");
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error. Status: ${response.status}`);
        }
        return response.text();
      })
      .then((responseText) => {
        const html = responseText;
        this.cachedData = {
          ...this.cachedData,
          [url]: html,
        };
        this.renderBreadcrumbs(html);
        this.renderFilters(html);
        this.renderBlogContainer(html);
        this.updateArticlesCount(html);
        this.updateBrowserUrl(url);
      })
      .catch((error) => {
        console.error("Error loading blog posts:", error);
      })
      .finally(() => {
        this.postsContainer.classList.remove("loading");
      });
  }

  renderSectionFromCache(url) {
    const html = this.cachedData[url];
    this.renderBreadcrumbs(html);
    this.renderFilters(html);
    this.renderBlogContainer(html);
    this.updateArticlesCount(html);
    this.updateBrowserUrl(url);
  }

  renderBreadcrumbs(html) {
    if (!this.breadcrumbs) return;
    this.breadcrumbs.innerHTML = new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(this.selectorBreadcrumbs).innerHTML;
  }

  renderFilters(html) {
    if (!this.tagsContainer) return;
    this.tagsContainer.innerHTML = new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(this.selectorTagsContainer).innerHTML;

    this.addEventListeners(
      this.querySelectorAll(".main-blog__tag-filter-link")
    );
  }

  updateArticlesCount(html) {
    const count =
      new DOMParser()
        .parseFromString(html, "text/html")
        .getElementById("ArticleCount")?.innerHTML || "";
    const container = document.getElementById("ArticleCount");

    if (container) {
      container.innerHTML = count;
      container.classList.remove("loading");
    }
  }

  renderBlogContainer(html) {
    if (!this.postsContainer) return;
    const parsedDOM = new DOMParser().parseFromString(html, "text/html");
    if (!parsedDOM) return;
    this.postsContainer.innerHTML = parsedDOM.querySelector(
      this.selectorPostsContainer
    )?.innerHTML;

    if (
      document.querySelector(".js-load-more") ||
      document.querySelector(".js-infinite-scroll")
    ) {
      initLoadMore();
    }
  }

  updateBrowserUrl(path, clearFilters = false) {
    window.history[clearFilters ? "replaceState" : "pushState"]({}, "", path);
  }
}

if (!customElements.get("blog-tag-filter")) {
  customElements.define("blog-tag-filter", BlogTagFilter);
}
