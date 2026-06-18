(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }

      current = (next + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === current);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  var filterScope = document.querySelector('[data-filter-scope]');

  if (filterScope) {
    var root = filterScope.parentElement;
    var keyword = filterScope.querySelector('[data-filter-keyword]');
    var type = filterScope.querySelector('[data-filter-type]');
    var year = filterScope.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && keyword) {
      keyword.value = q;
    }

    function normalized(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var term = normalized(keyword && keyword.value);
      var selectedType = normalized(type && type.value);
      var selectedYear = normalized(year && year.value);

      cards.forEach(function (card) {
        var haystack = normalized([
          card.getAttribute('data-title'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));
        var cardType = normalized(card.getAttribute('data-type'));
        var cardYear = normalized(card.getAttribute('data-year'));
        var matchedTerm = !term || haystack.indexOf(term) !== -1;
        var matchedType = !selectedType || cardType.indexOf(selectedType) !== -1;
        var matchedYear = !selectedYear || cardYear === selectedYear;

        card.hidden = !(matchedTerm && matchedType && matchedYear);
      });
    }

    [keyword, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-play-button]');
    var url = player.getAttribute('data-video');
    var started = false;
    var hlsInstance = null;

    function startVideo() {
      if (!video || !url) {
        return;
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(function () {});
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = url;
        video.play().catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', startVideo);
    }

    player.addEventListener('click', function (event) {
      if (!started && event.target === video) {
        startVideo();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
