(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function showMessage(node, text) {
    if (!node) {
      return;
    }
    node.textContent = text;
    node.hidden = false;
  }

  function setupPlayer(wrapper) {
    var video = wrapper.querySelector('video');
    var button = wrapper.querySelector('[data-play-button]');
    var message = wrapper.querySelector('[data-player-message]');
    var source = wrapper.getAttribute('data-m3u8');
    var hls = null;
    var loaded = false;

    if (!video || !button || !source) {
      return;
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          showMessage(message, '请再次点击播放器开始播放');
        });
      }
    }

    function attachSource() {
      if (loaded) {
        playVideo();
        return;
      }

      loaded = true;
      video.controls = true;
      button.classList.add('is-hidden');
      showMessage(message, '正在加载播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (message) {
            message.hidden = true;
          }
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage(message, '播放源加载失败，请刷新页面重试');
            if (hls) {
              hls.destroy();
              hls = null;
            }
          }
        });
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          if (message) {
            message.hidden = true;
          }
          playVideo();
        }, { once: true });
        return;
      }

      video.src = source;
      showMessage(message, '浏览器正在尝试使用原生方式播放');
      playVideo();
    }

    button.addEventListener('click', attachSource);
    video.addEventListener('click', function () {
      if (!loaded) {
        attachSource();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();
