(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function setHeroSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startHeroTimer() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      setHeroSlide(current + 1);
    }, 5600);
  }

  function restartHeroTimer() {
    if (timer) {
      window.clearInterval(timer);
    }

    startHeroTimer();
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setHeroSlide(index);
      restartHeroTimer();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      setHeroSlide(current - 1);
      restartHeroTimer();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      setHeroSlide(current + 1);
      restartHeroTimer();
    });
  }

  setHeroSlide(0);
  startHeroTimer();

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  filterForms.forEach(function (panel) {
    var scope = panel.getAttribute('data-filter-panel');
    var grid = document.querySelector('[data-filter-grid="' + scope + '"]');
    var empty = document.querySelector('[data-empty-state="' + scope + '"]');

    if (!grid) {
      return;
    }

    var input = panel.querySelector('[data-filter-text]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

    function normalized(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var q = normalized(input && input.value);
      var regionValue = normalized(region && region.value);
      var typeValue = normalized(type && type.value);
      var yearValue = normalized(year && year.value);
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalized([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var match = true;

        if (q && haystack.indexOf(q) === -1) {
          match = false;
        }

        if (regionValue && normalized(card.getAttribute('data-region')).indexOf(regionValue) === -1) {
          match = false;
        }

        if (typeValue && normalized(card.getAttribute('data-type')).indexOf(typeValue) === -1) {
          match = false;
        }

        if (yearValue && normalized(card.getAttribute('data-year')) !== yearValue) {
          match = false;
        }

        card.classList.toggle('hidden-by-filter', !match);

        if (match) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (input) {
      var query = new URLSearchParams(window.location.search).get('q');

      if (query) {
        input.value = query;
      }
    }

    applyFilters();
  });

  function beginPlayback(video, overlay) {
    var source = video.getAttribute('data-stream');

    if (!source) {
      return;
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    video.controls = true;

    if (video.getAttribute('data-ready') === '1') {
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      }

      video._hls = hls;
    } else {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
    }

    video.setAttribute('data-ready', '1');
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play]');

    if (!video) {
      return;
    }

    if (overlay) {
      overlay.addEventListener('click', function () {
        beginPlayback(video, overlay);
      });
    }

    video.addEventListener('click', function () {
      if (video.getAttribute('data-ready') !== '1') {
        beginPlayback(video, overlay);
      }
    });
  });
})();
