(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = qs('.menu-toggle');
    var menu = qs('.mobile-nav');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var previous = qs('.hero-prev', hero);
    var next = qs('.hero-next', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.slide || 0));
        start();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
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

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupLocalFiltering() {
    var toolbar = qs('[data-filter-toolbar]');
    var grid = qs('[data-card-grid]');

    if (!toolbar || !grid) {
      return;
    }

    var input = qs('.local-filter', toolbar);
    var sort = qs('.local-sort', toolbar);
    var cards = qsa('.movie-card, .full-rank-row', grid);
    var originalOrder = cards.slice();

    function getNumber(card, name) {
      return Number(card.dataset[name] || 0);
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.genre || '',
          card.dataset.year || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        card.classList.toggle('hidden-by-filter', keyword && haystack.indexOf(keyword) === -1);
      });
    }

    function applySort() {
      var mode = sort ? sort.value : 'default';
      var ordered = originalOrder.slice();

      if (mode === 'year') {
        ordered.sort(function (a, b) {
          return getNumber(b, 'year') - getNumber(a, 'year');
        });
      } else if (mode === 'views') {
        ordered.sort(function (a, b) {
          return getNumber(b, 'views') - getNumber(a, 'views');
        });
      } else if (mode === 'likes') {
        ordered.sort(function (a, b) {
          return getNumber(b, 'likes') - getNumber(a, 'likes');
        });
      }

      ordered.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (sort) {
      sort.addEventListener('change', function () {
        applySort();
        applyFilter();
      });
      applySort();
    }
  }

  function createOption(value) {
    var option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    return option;
  }

  function setupSearchPage() {
    var results = qs('#searchResults');

    if (!results || !window.MOVIES) {
      return;
    }

    var input = qs('#searchInput');
    var region = qs('#regionFilter');
    var type = qs('#typeFilter');
    var year = qs('#yearFilter');
    var sort = qs('#sortFilter');
    var summary = qs('#searchSummary');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    Array.from(new Set(window.MOVIES.map(function (movie) { return movie.region; }))).sort().forEach(function (value) {
      region.appendChild(createOption(value));
    });

    Array.from(new Set(window.MOVIES.map(function (movie) { return movie.type; }))).sort().forEach(function (value) {
      type.appendChild(createOption(value));
    });

    Array.from(new Set(window.MOVIES.map(function (movie) { return movie.year; }))).sort().reverse().forEach(function (value) {
      year.appendChild(createOption(value));
    });

    function render() {
      var keyword = (input ? input.value : '').trim().toLowerCase();
      var regionValue = region.value;
      var typeValue = type.value;
      var yearValue = year.value;
      var sortValue = sort.value;

      var filtered = window.MOVIES.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
        return (!keyword || haystack.indexOf(keyword) !== -1)
          && (!regionValue || movie.region === regionValue)
          && (!typeValue || movie.type === typeValue)
          && (!yearValue || movie.year === yearValue);
      });

      filtered.sort(function (a, b) {
        if (sortValue === 'year') {
          return Number(b.year || 0) - Number(a.year || 0);
        }
        if (sortValue === 'likes') {
          return Number(b.likes || 0) - Number(a.likes || 0);
        }
        return Number(b.views || 0) - Number(a.views || 0);
      });

      var visible = filtered.slice(0, 120);
      results.innerHTML = visible.map(function (movie) {
        return [
          '<article class="movie-card">',
          '  <a href="' + movie.url + '" class="movie-card-link" aria-label="' + movie.title + ' 在线观看">',
          '    <div class="poster-frame">',
          '      <img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">',
          '      <span class="poster-badge poster-badge-left">' + movie.year + '</span>',
          '      <span class="poster-badge poster-badge-right">' + movie.type + '</span>',
          '    </div>',
          '    <div class="movie-card-body">',
          '      <div class="movie-card-meta"><span>' + movie.region + '</span><span>' + movie.duration + '</span></div>',
          '      <h3>' + movie.title + '</h3>',
          '      <p>' + movie.oneLine + '</p>',
          '      <div class="tag-row"><span class="tag">' + movie.genre + '</span></div>',
          '      <div class="movie-stats"><span>热度 ' + movie.views.toLocaleString() + '</span><span>评分 ' + movie.rating + '</span></div>',
          '    </div>',
          '  </a>',
          '</article>'
        ].join('');
      }).join('');

      if (summary) {
        summary.textContent = '共匹配 ' + filtered.length + ' 部影片，当前展示前 ' + visible.length + ' 部。';
      }
    }

    [input, region, type, year, sort].forEach(function (control) {
      if (control) {
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      }
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupLocalFiltering();
    setupSearchPage();
  });
}());
