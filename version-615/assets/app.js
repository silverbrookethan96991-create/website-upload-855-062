(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    var search = document.querySelector('.nav-search');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      if (search) {
        search.classList.toggle('is-open');
      }
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initScrollRows() {
    document.querySelectorAll('[data-scroll-row]').forEach(function (row) {
      var section = row.closest('section');
      if (!section) {
        return;
      }
      var prev = section.querySelector('[data-scroll-prev]');
      var next = section.querySelector('[data-scroll-next]');
      var step = 320;
      if (prev) {
        prev.addEventListener('click', function () {
          row.scrollBy({ left: -step, behavior: 'smooth' });
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          row.scrollBy({ left: step, behavior: 'smooth' });
        });
      }
    });
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-form]').forEach(function (form) {
      var list = form.parentElement.querySelector('[data-filter-list]');
      if (!list) {
        return;
      }
      var query = form.querySelector('[data-filter-query]');
      var year = form.querySelector('[data-filter-year]');
      var type = form.querySelector('[data-filter-type]');
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

      function apply() {
        var q = (query && query.value ? query.value : '').trim().toLowerCase();
        var y = year && year.value ? year.value : '';
        var t = type && type.value ? type.value : '';
        cards.forEach(function (card) {
          var text = card.textContent.toLowerCase();
          var okQuery = !q || text.indexOf(q) !== -1;
          var okYear = !y || card.getAttribute('data-year') === y;
          var okType = !t || card.getAttribute('data-type') === t;
          card.classList.toggle('is-filtered-out', !(okQuery && okYear && okType));
        });
      }

      [query, year, type].forEach(function (el) {
        if (el) {
          el.addEventListener('input', apply);
          el.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function renderSearchCard(item) {
    var tags = (item.tags || []).slice(0, 2).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a class="movie-thumb" href="' + escapeHtml(item.url) + '" aria-label="观看' + escapeHtml(item.title) + '">' +
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="movie-badge">' + escapeHtml(item.year) + '</span>' +
      '</a>' +
      '<div class="movie-info">' +
      '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
      '<p>' + escapeHtml(item.oneLine) + '</p>' +
      '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
      '<div class="tag-line">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearch() {
    var results = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-search-input]');
    var note = document.querySelector('[data-search-note]');
    if (!results || !window.SEARCH_ITEMS) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function run() {
      var q = (input && input.value ? input.value : '').trim().toLowerCase();
      if (!q) {
        results.innerHTML = window.SEARCH_ITEMS.slice(0, 24).map(renderSearchCard).join('');
        if (note) {
          note.textContent = '可浏览近期推荐，也可以输入关键词进一步筛选。';
        }
        return;
      }
      var words = q.split(/\s+/).filter(Boolean);
      var matched = window.SEARCH_ITEMS.filter(function (item) {
        var text = [item.title, item.oneLine, item.region, item.type, item.year, item.genre, (item.tags || []).join(' ')].join(' ').toLowerCase();
        return words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
      }).slice(0, 80);
      results.innerHTML = matched.map(renderSearchCard).join('');
      if (note) {
        note.textContent = matched.length ? '已展示匹配度较高的内容。' : '未找到匹配内容，请换一个关键词。';
      }
    }

    if (input) {
      input.addEventListener('input', run);
    }
    run();
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (box) {
      var video = box.querySelector('video');
      var cover = box.querySelector('.video-cover');
      var url = box.getAttribute('data-m3u8');
      var attached = false;
      var hls;

      if (!video || !url) {
        return;
      }

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function play() {
        attach();
        if (cover) {
          cover.classList.add('is-hidden');
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initNav();
    initHero();
    initScrollRows();
    initFilters();
    initSearch();
    initPlayers();
  });
})();
