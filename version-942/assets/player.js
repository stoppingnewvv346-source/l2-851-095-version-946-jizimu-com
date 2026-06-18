(function () {
  var hlsPromise = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (!hlsPromise) {
      hlsPromise = new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
        script.async = true;
        script.onload = function () {
          resolve(window.Hls);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    return hlsPromise;
  }

  function startNative(video, playlistUrl) {
    if (video.src !== playlistUrl) {
      video.src = playlistUrl;
      video.load();
    }
    return video.play();
  }

  function startWithHls(video, playlistUrl) {
    return loadHls().then(function (Hls) {
      if (!Hls || !Hls.isSupported()) {
        return startNative(video, playlistUrl);
      }
      if (!video.__hlsInstance) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(playlistUrl);
        hls.attachMedia(video);
        video.__hlsInstance = hls;
      }
      return video.play();
    });
  }

  window.initMoviePlayer = function (playlistUrl) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    if (!video || !playlistUrl) {
      return;
    }
    var started = false;

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function start() {
      hideOverlay();
      if (started && !video.paused) {
        return;
      }
      started = true;
      var canNative = video.canPlayType("application/vnd.apple.mpegurl");
      var action = canNative ? startNative(video, playlistUrl) : startWithHls(video, playlistUrl);
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!started || video.paused) {
        start();
      }
    });
    video.addEventListener("play", hideOverlay);
  };
})();
