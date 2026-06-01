function setupPlayer() {
  const video = document.querySelector('[data-hls-src]');
  const startButton = document.querySelector('[data-player-start]');

  if (!video) {
    return;
  }

  const source = video.dataset.hlsSrc;
  let initialized = false;
  let hls = null;

  function initialize() {
    if (initialized || !source) {
      return;
    }

    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  async function play() {
    initialize();

    if (startButton) {
      startButton.classList.add('hidden');
    }

    try {
      await video.play();
    } catch (error) {
      if (startButton) {
        startButton.classList.remove('hidden');
      }
      console.warn('播放器需要用户再次点击或当前浏览器不支持该播放源。', error);
    }
  }

  if (startButton) {
    startButton.addEventListener('click', play);
  }

  video.addEventListener('play', initialize, { once: true });
  video.addEventListener('loadedmetadata', function () {
    if (startButton) {
      startButton.classList.add('hidden');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', setupPlayer);
