(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHeaderSearch() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = Number(dot.getAttribute("data-hero-dot"));
        show(next);
        play();
      });
    });

    root.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    root.addEventListener("mouseleave", play);
    play();
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function setupFiltering() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var search = document.querySelector("[data-site-search]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    if (!cards.length) {
      return;
    }
    var activeFilter = "all";

    function apply() {
      var term = normalize(search ? search.value : "");
      cards.forEach(function (card) {
        var title = normalize(card.getAttribute("data-title"));
        var meta = normalize(card.getAttribute("data-meta"));
        var type = normalize(card.getAttribute("data-type"));
        var region = normalize(card.getAttribute("data-region"));
        var content = title + " " + meta + " " + type + " " + region;
        var matchesTerm = !term || content.indexOf(term) !== -1;
        var filter = normalize(activeFilter);
        var matchesFilter = filter === "all" || content.indexOf(filter) !== -1;
        card.classList.toggle("is-filtered-out", !(matchesTerm && matchesFilter));
      });
    }

    if (search) {
      var query = getQuery();
      if (query) {
        search.value = query;
      }
      search.addEventListener("input", apply);
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

  ready(function () {
    setupMenu();
    setupHeaderSearch();
    setupHero();
    setupFiltering();
  });
})();
