(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.nav-toggle');

    if (header && toggle) {
        toggle.addEventListener('click', function () {
            header.classList.toggle('open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('image-missing');
        }, { once: true });
    });

    var hero = document.querySelector('.hero');
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function setHero(index) {
        if (!slides.length || !hero) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });

        var active = slides[current];
        var image = active.getAttribute('data-bg');

        if (image) {
            hero.style.setProperty('--hero-image', "url('" + image + "')");
        }
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            setHero(current + 1);
        }, 5200);
    }

    function stopHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    if (slides.length) {
        setHero(0);
        startHero();

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                stopHero();
                setHero(index);
                startHero();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                stopHero();
                setHero(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                stopHero();
                setHero(current + 1);
                startHero();
            });
        }
    }

    var homeSearch = document.querySelector('[data-home-search]');

    if (homeSearch) {
        homeSearch.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = homeSearch.querySelector('input');
            var value = input ? input.value.trim() : '';
            var url = 'search.html';

            if (value) {
                url += '?q=' + encodeURIComponent(value);
            }

            window.location.href = url;
        });
    }

    var filterInput = document.querySelector('[data-filter-keyword]');
    var filterRegion = document.querySelector('[data-filter-region]');
    var filterYear = document.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-title]'));
    var empty = document.querySelector('.empty-state');

    function readQuery() {
        try {
            return new URLSearchParams(window.location.search).get('q') || '';
        } catch (error) {
            return '';
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function runFilter() {
        if (!cards.length) {
            return;
        }

        var keyword = normalize(filterInput && filterInput.value);
        var region = normalize(filterRegion && filterRegion.value);
        var year = normalize(filterYear && filterYear.value);
        var shown = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre')
            ].join(' '));

            var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var okRegion = !region || normalize(card.getAttribute('data-region')) === region;
            var okYear = !year || normalize(card.getAttribute('data-year')) === year;
            var visible = okKeyword && okRegion && okYear;

            card.style.display = visible ? '' : 'none';

            if (visible) {
                shown += 1;
            }
        });

        if (empty) {
            empty.style.display = shown ? 'none' : 'block';
        }
    }

    if (filterInput) {
        var query = readQuery();

        if (query) {
            filterInput.value = query;
        }

        filterInput.addEventListener('input', runFilter);
    }

    if (filterRegion) {
        filterRegion.addEventListener('change', runFilter);
    }

    if (filterYear) {
        filterYear.addEventListener('change', runFilter);
    }

    runFilter();
})();
