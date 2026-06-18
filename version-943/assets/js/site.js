(function () {
    var hlsLoader = null;

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (!hlsLoader) {
            hlsLoader = new Promise(function (resolve, reject) {
                var script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
                script.onload = function () {
                    resolve(window.Hls);
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        return hlsLoader;
    }

    window.initMoviePlayer = function (src) {
        var wrap = document.querySelector("[data-player]");
        if (!wrap) {
            return;
        }
        var video = wrap.querySelector("video");
        var shade = wrap.querySelector(".player-shade");
        var button = wrap.querySelector("[data-play-button]");
        var started = false;
        var hlsInstance = null;

        function start() {
            if (!video) {
                return;
            }
            if (shade) {
                shade.classList.add("is-hidden");
            }
            if (started) {
                video.play().catch(function () {});
                return;
            }
            started = true;
            video.setAttribute("playsinline", "playsinline");
            video.setAttribute("webkit-playsinline", "webkit-playsinline");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
                video.play().catch(function () {});
                return;
            }
            loadHls().then(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        } else {
                            hlsInstance.destroy();
                        }
                    });
                } else {
                    video.src = src;
                    video.play().catch(function () {});
                }
            }).catch(function () {
                video.src = src;
                video.play().catch(function () {});
            });
        }

        if (button) {
            button.addEventListener("click", start);
        }
        if (shade) {
            shade.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!started && video.paused) {
                    start();
                }
            });
        }
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function setupFilters() {
        var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
        areas.forEach(function (area) {
            var input = area.querySelector("[data-search-input]");
            var year = area.querySelector("[data-year-filter]");
            var type = area.querySelector("[data-type-filter]");
            var scope = area.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector("[data-filter-empty]");

            function match(card) {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                var selectedType = type ? type.value : "";
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-category")
                ].join(" ").toLowerCase();
                var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                var okYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                var typeValue = card.getAttribute("data-type") || "";
                var okType = !selectedType || typeValue.indexOf(selectedType) !== -1;
                return okKeyword && okYear && okType;
            }

            function apply() {
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = match(card);
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q && input) {
                input.value = q;
            }
            apply();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
