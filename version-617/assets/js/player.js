(function () {
    var video = document.getElementById('movieVideo');
    var button = document.getElementById('moviePlayButton');
    var message = document.getElementById('moviePlayerMessage');
    var hlsInstance = null;
    var sourceReady = false;

    if (!video || !button) {
        return;
    }

    function setMessage(text) {
        if (message) {
            message.textContent = text || '';
        }
    }

    function loadSource() {
        if (sourceReady) {
            return Promise.resolve();
        }

        var source = video.getAttribute('data-m3u8') || '';
        if (!source) {
            setMessage('播放暂时不可用');
            return Promise.reject(new Error('empty source'));
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            sourceReady = true;
            return new Promise(function (resolve) {
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                window.setTimeout(resolve, 1200);
            });
        }

        video.src = source;
        sourceReady = true;
        return Promise.resolve();
    }

    function playMovie() {
        button.classList.add('hidden');
        setMessage('');
        loadSource().then(function () {
            return video.play();
        }).catch(function () {
            button.classList.remove('hidden');
            setMessage('播放未能开始，请再次点击');
        });
    }

    button.addEventListener('click', playMovie);
    video.addEventListener('click', function () {
        if (video.paused) {
            playMovie();
        }
    });
    video.addEventListener('play', function () {
        button.classList.add('hidden');
    });
    video.addEventListener('pause', function () {
        if (!video.ended) {
            button.classList.remove('hidden');
        }
    });
    video.addEventListener('ended', function () {
        button.classList.remove('hidden');
    });
})();
