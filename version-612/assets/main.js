(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.mobile-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var index = 0;
    var timer = null;

    function showSlide(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide') || 0));
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    startHero();
  }

  var sortBar = document.querySelector('[data-sort-bar]');
  var sortList = document.querySelector('[data-sort-list]');
  if (sortBar && sortList) {
    var original = Array.prototype.slice.call(sortList.children);
    sortBar.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-sort]');
      if (!button) {
        return;
      }
      sortBar.querySelectorAll('button').forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      var mode = button.getAttribute('data-sort');
      var items = original.slice();
      if (mode === 'views') {
        items.sort(function (a, b) {
          return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
        });
      }
      if (mode === 'score') {
        items.sort(function (a, b) {
          return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
        });
      }
      if (mode === 'year') {
        items.sort(function (a, b) {
          return String(b.getAttribute('data-year') || '').localeCompare(String(a.getAttribute('data-year') || ''), 'zh-CN', { numeric: true });
        });
      }
      if (mode === 'default') {
        items = original.slice();
      }
      items.forEach(function (item) {
        sortList.appendChild(item);
      });
    });
  }

  var searchForm = document.querySelector('[data-search-form]');
  var searchList = document.querySelector('[data-search-list]');
  var resultText = document.querySelector('[data-result-text]');
  var quickTags = document.querySelector('[data-quick-tags]');
  if (searchForm && searchList) {
    var input = searchForm.querySelector('input[name="q"]');
    var cards = Array.prototype.slice.call(searchList.children);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    function applySearch(value) {
      var query = String(value || '').trim().toLowerCase();
      var count = 0;
      cards.forEach(function (card) {
        var text = String(card.getAttribute('data-search') || '').toLowerCase();
        var matched = !query || text.indexOf(query) !== -1;
        card.classList.toggle('hidden-by-search', !matched);
        if (matched) {
          count += 1;
        }
      });
      if (resultText) {
        resultText.textContent = query ? '匹配结果 ' + count : '全部内容';
      }
    }

    input.value = initial;
    applySearch(initial);

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState(null, '', nextUrl);
      applySearch(query);
    });

    input.addEventListener('input', function () {
      applySearch(input.value);
    });

    if (quickTags) {
      quickTags.addEventListener('click', function (event) {
        var button = event.target.closest('button[data-query]');
        if (!button) {
          return;
        }
        input.value = button.getAttribute('data-query') || '';
        applySearch(input.value);
        input.focus();
      });
    }
  }
})();
