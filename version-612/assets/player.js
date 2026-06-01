document.querySelectorAll('.player-shell').forEach(function (shell) {
  var video = shell.querySelector('video');
  var overlay = shell.querySelector('.player-overlay');
  var stream = shell.getAttribute('data-stream');
  var prepared = false;
  var hls = null;

  function prepare() {
    if (prepared || !video || !stream) {
      return;
    }
    prepared = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
  }

  function begin() {
    prepare();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var play = video.play();
    if (play && typeof play.catch === 'function') {
      play.then(function () {
        shell.classList.add('is-playing');
      }).catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    } else {
      shell.classList.add('is-playing');
    }
  }

  if (overlay) {
    overlay.addEventListener('click', begin);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      begin();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    shell.classList.remove('is-playing');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
});
