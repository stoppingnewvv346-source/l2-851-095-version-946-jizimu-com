(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const open = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    function showHero(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const next = Number(dot.getAttribute('data-hero-dot')) || 0;
        showHero(next);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showHero(index + 1);
      }, 5200);
    }
  }

  const panels = document.querySelectorAll('[data-filter-panel]');
  panels.forEach(function (panel) {
    const keywordInput = panel.querySelector('[data-filter-keyword]');
    const regionSelect = panel.querySelector('[data-filter-region]');
    const yearSelect = panel.querySelector('[data-filter-year]');
    const typeSelect = panel.querySelector('[data-filter-type]');
    const categorySelect = panel.querySelector('[data-filter-category]');
    const grid = document.querySelector('[data-filter-grid]');
    const cards = grid ? Array.from(grid.querySelectorAll('.movie-card')) : [];
    const params = new URLSearchParams(window.location.search);

    if (keywordInput && params.get('q')) {
      keywordInput.value = params.get('q');
    }

    function filterCards() {
      const keyword = (keywordInput ? keywordInput.value : '').trim().toLowerCase();
      const region = regionSelect ? regionSelect.value : '';
      const year = yearSelect ? yearSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      const category = categorySelect ? categorySelect.value : '';

      cards.forEach(function (card) {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const matched = (!keyword || text.indexOf(keyword) !== -1) &&
          (!region || card.getAttribute('data-region') === region) &&
          (!year || card.getAttribute('data-year') === year) &&
          (!type || card.getAttribute('data-type') === type) &&
          (!category || card.getAttribute('data-category') === category);
        card.classList.toggle('is-hidden', !matched);
      });
    }

    [keywordInput, regionSelect, yearSelect, typeSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    filterCards();
  });

  const sortGrid = document.querySelector('[data-sort-grid]');
  if (sortGrid) {
    const buttons = Array.from(document.querySelectorAll('[data-sort-button]'));
    const original = Array.from(sortGrid.querySelectorAll('.movie-card'));

    function sortCards(mode) {
      const cards = Array.from(sortGrid.querySelectorAll('.movie-card'));
      let sorted = cards;

      if (mode === 'year') {
        sorted = cards.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }

      if (mode === 'views') {
        sorted = cards.sort(function (a, b) {
          return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
        });
      }

      if (mode === 'default') {
        sorted = original;
      }

      sorted.forEach(function (card) {
        sortGrid.appendChild(card);
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        sortCards(button.getAttribute('data-sort-button'));
      });
    });
  }

  const players = Array.from(document.querySelectorAll('[data-player]'));
  players.forEach(function (frame) {
    const video = frame.querySelector('video');
    const overlay = frame.querySelector('.play-overlay');
    const source = frame.getAttribute('data-src');
    let ready = false;
    let hls = null;

    function loadVideo() {
      if (!video || !source || ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        ready = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        ready = true;
      }
    }

    function playVideo() {
      loadVideo();
      if (!video) {
        return;
      }
      frame.classList.add('is-playing');
      const action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          frame.classList.remove('is-playing');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }

    frame.addEventListener('click', function (event) {
      if (event.target === video && ready) {
        return;
      }
      if (!frame.classList.contains('is-playing')) {
        playVideo();
      }
    });

    if (video) {
      video.addEventListener('play', function () {
        frame.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          frame.classList.remove('is-playing');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
