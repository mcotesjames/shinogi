function loadItems(button) {
  const totalPages = parseInt(
    document.querySelector("[data-total-pages]").value,
    10
  );
  let currentPage = parseInt(
    document.querySelector("[data-current-page]").value,
    10
  );
  let currentPageScroll = currentPage + 1;

  currentPage = currentPage + 1;

  const rawValue = document.querySelector("[data-next-url]").value;

  const getUrlWithoutPhcursor = (value, pageValue) => {
    const url = new URL(value, window.location.origin);
    url.searchParams.set("page", pageValue);
    url.searchParams.delete("phcursor");
    return url.pathname + "?" + url.searchParams.toString();
  };

  const nextUrl = getUrlWithoutPhcursor(rawValue, currentPage);
  const nextUrlScroll = getUrlWithoutPhcursor(rawValue, currentPageScroll);

  document.querySelector("[data-current-page]").value = currentPage;

  button.setAttribute("disabled", "");
  button.classList.add("loading");

  fetch(nextUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((responseHTML) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(responseHTML, "text/html");
      const newGrid = doc.querySelector(".load-more-grid");
      const wrapper = document.querySelector(".load-more-grid");
      if (!newGrid || !wrapper) {
        throw new Error("Grid element not found");
      }
      const newItems = newGrid.innerHTML;
      wrapper.insertAdjacentHTML("beforeend", newItems);

      if (doc.getElementById("LoadMoreProgress")) {
        updateProgressLabel(responseHTML);
        updateProgressbar(currentPage, totalPages);
      }
    })
    .catch((error) => {
      console.error("Error loading items:", error);
      button.removeAttribute("disabled");
      button.classList.remove("loading");
    })
    .finally(() => {
      if (currentPage <= totalPages) {
        const scrollData = document.querySelector(".infinite-scroll__data");
        if (scrollData && currentPage !== totalPages) {
          const nextUrlInput = scrollData.querySelector("input[data-next-url]");
          const currentPageInput = scrollData.querySelector(
            "input[data-current-page]"
          );

          if (nextUrlInput) {
            nextUrlInput.dataset.nextUrl = nextUrlScroll;
            nextUrlInput.value = nextUrlScroll;
          }

          if (currentPageInput) {
            currentPageInput.dataset.currentPage = currentPage;
            currentPageInput.value = currentPage;
          }

          checkVisibility();
        }

        button.removeAttribute("disabled");
        button.classList.remove("loading");

        if (currentPage === totalPages) {
          button.remove();
        }
      }
    });
}

function checkVisibility() {
  const spinnerList = document.querySelectorAll(".js-infinite-scroll");
  spinnerList.forEach((spinner) => {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadItems(spinner);
          sectionObserver.unobserve(entry.target);
        }
      });
    });

    sectionObserver.observe(spinner);
  });
}

function updateProgressLabel(html) {
  const count =
    new DOMParser()
      .parseFromString(html, "text/html")
      .getElementById("LoadMoreProgress")?.innerHTML || "";
  const container = document.getElementById("LoadMoreProgress");
  if (container) {
    container.innerHTML = count;
  }
}

function updateProgressbar(current, total) {
  const progressbar = document.getElementById("LoadMoreProgressBar");
  if (progressbar) {
    progressbar.style.width = `${(current / total) * 100}%`;
  }
}

function initLoadMore() {
  document.querySelectorAll(".js-load-more").forEach((button) => {
    button.onclick = () => {
      loadItems(button);
    };
  });

  checkVisibility();
}

(function () {
  initLoadMore();
})();
