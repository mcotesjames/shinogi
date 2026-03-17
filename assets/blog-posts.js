(function () {
  let postsSwiper;

  const initSlider = (section) => {
    const sliderEl = section.querySelector(".swiper--blog-posts");
    if (!sliderEl) return;

    const nextBtn = section.querySelector(
      ".heading-group__navigation-button-next"
    );
    const prevBtn = section.querySelector(
      ".heading-group__navigation-button-prev"
    );
    const cardsPerRow = Number(sliderEl.dataset.cardsPerRow || 4);

    const breakpoints = {
      4: {
        576: {
          slidesPerView: 2,
        },
        990: {
          slidesPerView: 3,
        },
        1200: {
          slidesPerView: 4,
        },
      },
      3: {
        576: {
          slidesPerView: 2,
        },
        990: {
          slidesPerView: 3,
        },
      },
      2: {
        576: {
          slidesPerView: 2,
        },
      },
      1: {
        576: {
          slidesPerView: 1,
        },
      },
    };

    postsSwiper = new Swiper(sliderEl, {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 800,
      watchSlideProgress: true,
      allowTouchMove: true,
      mousewheel: {
        forceToAxis: true,
      },
      navigation: {
        nextEl: nextBtn,
        prevEl: prevBtn,
        disabledClass: "swiper-button-disabled",
      },
      breakpoints: breakpoints[cardsPerRow],
    });
  };

  const destroySlider = (section) => {
    const slides = section.querySelectorAll(".blog-posts-card");
    const sliderEl = section.querySelector(".blog-posts-layout");

    if (sliderEl?.swiper) sliderEl.swiper.destroy();
    //if (postsSwiper) postsSwiper.destroy();

    slides.forEach((slide) => {
      slide.removeAttribute("style");
    });
  };

  const initBlogPosts = (section) => {
    if (!section || !section?.classList.contains("section-blog-posts")) {
      return;
    }

    const box = section.querySelector(".blog-posts");
    if (!box) return;

    const layout = box.dataset.layout || "grid";

    if (layout === "slider") {
      initSlider(box);
    } else {
      destroySlider(box);
    }
  };

  initBlogPosts(document.currentScript.parentElement);

  document.addEventListener("shopify:section:load", function (e) {
    initBlogPosts(e.target);
  });
})();
