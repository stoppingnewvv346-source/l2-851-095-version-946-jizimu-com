(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function setSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function collectText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-category'),
      card.textContent
    ].join(' '));
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
  var cardList = document.querySelector('[data-card-list]') || document;
  var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-card]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var activeToken = 'all';

  function applyFilter() {
    var inputValue = normalize(filterInputs.map(function (input) {
      return input.value;
    }).join(' '));
    var token = normalize(activeToken === 'all' ? '' : activeToken);

    cards.forEach(function (card) {
      var haystack = collectText(card);
      var matchedInput = !inputValue || haystack.indexOf(inputValue) !== -1;
      var matchedToken = !token || haystack.indexOf(token) !== -1;
      card.classList.toggle('is-hidden', !(matchedInput && matchedToken));
    });
  }

  filterInputs.forEach(function (input) {
    input.addEventListener('input', applyFilter);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeToken = button.getAttribute('data-filter') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilter();
    });
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');

  if (query && filterInputs.length) {
    filterInputs.forEach(function (input) {
      input.value = query;
    });
    applyFilter();
  }

  var configNode = document.getElementById('play-config');
  var video = document.querySelector('[data-player-video]');
  var cover = document.querySelector('[data-player-cover]');

  if (configNode && video) {
    var playerConfig = {};

    try {
      playerConfig = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
      playerConfig = {};
    }

    var source = playerConfig.src;
    var hlsInstance = null;
    var prepared = false;

    function prepareVideo() {
      if (!source || prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      video.controls = true;
    }

    function startVideo() {
      prepareVideo();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', startVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      } else {
        video.pause();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
