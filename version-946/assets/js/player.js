(function () {
    function initBox(box) {
        var video = box.querySelector('video');
        var button = box.querySelector('.play-cover');

        if (!video || !button) {
            return;
        }

        var streamUrl = video.getAttribute('data-stream');
        var started = false;
        var hlsInstance = null;

        function playVideo() {
            if (!streamUrl) {
                return;
            }

            box.classList.add('is-playing');

            if (started) {
                video.play().catch(function () {});
                return;
            }

            started = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.addEventListener('loadedmetadata', function () {
                    video.play().catch(function () {});
                }, { once: true });
                video.load();
            } else {
                video.src = streamUrl;
                video.play().catch(function () {});
            }
        }

        button.addEventListener('click', playVideo);

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
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

    document.querySelectorAll('.video-box').forEach(initBox);
})();
