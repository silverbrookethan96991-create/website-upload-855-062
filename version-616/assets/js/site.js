(function () {
  var searchToggle = document.querySelector('.nav-search-toggle');
  var searchBox = document.querySelector('.header-search');
  var mobileToggle = document.querySelector('.mobile-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (searchToggle && searchBox) {
    searchToggle.addEventListener('click', function () {
      searchBox.hidden = !searchBox.hidden;
      if (!searchBox.hidden) {
        var input = searchBox.querySelector('input');
        if (input) {
          input.focus();
        }
      }
    });
  }

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.hidden = !mobilePanel.hidden;
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  });

  document.querySelectorAll('[data-rail]').forEach(function (rail) {
    var section = rail.closest('.section-block');
    var prev = section ? section.querySelector('[data-rail-prev]') : null;
    var next = section ? section.querySelector('[data-rail-next]') : null;
    var amount = 320;

    if (prev) {
      prev.addEventListener('click', function () {
        rail.scrollBy({ left: -amount, behavior: 'smooth' });
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        rail.scrollBy({ left: amount, behavior: 'smooth' });
      });
    }
  });

  document.querySelectorAll('.filter-input').forEach(function (input) {
    var area = document.querySelector('[data-filter-area]');
    if (!area) {
      return;
    }
    var cards = Array.prototype.slice.call(area.querySelectorAll('[data-card]'));
    input.addEventListener('input', function () {
      var term = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('hidden', term && haystack.indexOf(term) === -1);
      });
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var button = wrap.querySelector('[data-play]');
    var stream = wrap.getAttribute('data-stream');
    var hlsInstance = null;
    var loaded = false;

    function load() {
      if (!video || !stream || loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      load();
      if (button) {
        button.classList.add('hidden');
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });

  var results = document.getElementById('searchResults');
  var searchInput = document.getElementById('searchInput');
  if (results && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (searchInput) {
      searchInput.value = initial;
      searchInput.addEventListener('input', function () {
        renderSearch(searchInput.value);
      });
    }
    renderSearch(initial);
  }

  function renderSearch(term) {
    var value = (term || '').trim().toLowerCase();
    if (!results) {
      return;
    }
    if (!value) {
      results.innerHTML = '';
      return;
    }
    var matches = window.SEARCH_MOVIES.filter(function (movie) {
      return movie.text.indexOf(value) !== -1;
    }).slice(0, 120);

    if (!matches.length) {
      results.innerHTML = '<div class="prose-card">没有找到匹配内容</div>';
      return;
    }

    results.innerHTML = matches.map(function (movie) {
      return [
        '<article class="movie-card">',
        '<a class="card-cover" href="' + movie.url + '">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="score-pill">' + movie.score + '</span>',
        '</a>',
        '<div class="card-body">',
        '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
        '</div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }
})();
