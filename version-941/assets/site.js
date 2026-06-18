(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var navPanel = document.querySelector("[data-nav-panel]");

    if (navToggle && navPanel) {
      navToggle.addEventListener("click", function () {
        navPanel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        window.location.href = "rankings.html?q=" + encodeURIComponent(input.value.trim());
      });
    });

    setupHero();
    setupLocalSearch();
    setupPlayers();
  });

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function setupLocalSearch() {
    var list = document.querySelector("[data-search-list]");
    var input = document.querySelector("[data-local-search]");
    var clear = document.querySelector("[data-clear-search]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var items = list ? Array.prototype.slice.call(list.querySelectorAll(".searchable-item")) : [];

    if (!list || !input || !items.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");
    var activeFilter = "all";

    if (initial) {
      input.value = initial;
    }

    function textFor(item) {
      return [
        item.getAttribute("data-title"),
        item.getAttribute("data-region"),
        item.getAttribute("data-year"),
        item.getAttribute("data-genre"),
        item.getAttribute("data-tags")
      ].join(" ").toLowerCase();
    }

    function apply() {
      var query = input.value.trim().toLowerCase();
      items.forEach(function (item) {
        var text = textFor(item);
        var okQuery = !query || text.indexOf(query) !== -1;
        var okFilter = activeFilter === "all" || text.indexOf(activeFilter.toLowerCase()) !== -1;
        item.classList.toggle("is-hidden", !(okQuery && okFilter));
      });
    }

    input.addEventListener("input", apply);

    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        activeFilter = "all";
        chips.forEach(function (chip) {
          chip.classList.toggle("active", chip.getAttribute("data-filter") === "all");
        });
        apply();
        if (window.location.search) {
          history.replaceState(null, "", window.location.pathname);
        }
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeFilter = chip.getAttribute("data-filter") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chip);
        });
        apply();
      });
    });

    apply();
  }

  function setupPlayers() {
    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".player-cover");
      var stream = shell.getAttribute("data-stream");
      var loaded = false;
      var hls = null;

      if (!video || !cover || !stream) {
        return;
      }

      function attach() {
        if (loaded) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }

        loaded = true;
      }

      function play() {
        attach();
        cover.classList.add("is-hidden");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      cover.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!loaded) {
          play();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }
})();
