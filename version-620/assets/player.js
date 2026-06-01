(function () {
    function loadScript(src, callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector('script[src="' + src + '"]');
        if (existing) {
            existing.addEventListener("load", callback, { once: true });
            return;
        }
        var script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = callback;
        document.head.appendChild(script);
    }

    function initPlayer(player) {
        var video = player.querySelector("video");
        var button = player.querySelector(".play-overlay");
        var status = player.querySelector(".player-status");
        var streamUrl = player.getAttribute("data-m3u8");
        var started = false;
        var hlsInstance = null;

        function showStatus(text) {
            if (!status) {
                return;
            }
            status.textContent = text;
            status.classList.add("show");
        }

        function start() {
            if (started || !video || !streamUrl) {
                return;
            }
            started = true;
            player.classList.add("is-playing");
            video.setAttribute("controls", "controls");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.play().catch(function () {
                    started = false;
                    player.classList.remove("is-playing");
                });
                return;
            }

            loadScript("https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js", function () {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {
                            started = false;
                            player.classList.remove("is-playing");
                        });
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showStatus("播放暂不可用");
                            if (hlsInstance) {
                                hlsInstance.destroy();
                                hlsInstance = null;
                            }
                        }
                    });
                } else {
                    showStatus("播放暂不可用");
                }
            });
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                start();
            });
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!started) {
                    start();
                }
            });
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        Array.prototype.forEach.call(document.querySelectorAll(".movie-player"), initPlayer);
    });
})();
