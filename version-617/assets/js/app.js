(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function submitSearch(form) {
        var input = qs('input[name="q"]', form);
        var query = input ? input.value.trim() : '';
        if (query) {
            window.location.href = './search.html?q=' + encodeURIComponent(query);
        } else {
            window.location.href = './search.html';
        }
    }

    qsa('.site-search').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            submitSearch(form);
        });
    });

    var menuButton = qs('.mobile-menu-button');
    var mobileMenu = qs('.mobile-menu');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileMenu.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            menuButton.textContent = isOpen ? '×' : '☰';
        });
    }

    qsa('.hero-slider').forEach(function (slider) {
        var slides = qsa('.hero-slide', slider);
        var dots = qsa('.hero-dot', slider);
        var prev = qs('.hero-arrow.prev', slider);
        var next = qs('.hero-arrow.next', slider);
        var index = 0;
        var timer;

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
            }, 5200);
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

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    function uniqueValues(cards, attr) {
        var values = [];
        cards.forEach(function (card) {
            var value = card.getAttribute(attr) || '';
            if (value && values.indexOf(value) === -1) {
                values.push(value);
            }
        });
        return values.sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-Hans-CN');
        });
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    qsa('.filter-toolbar').forEach(function (toolbar) {
        var section = toolbar.closest('.section') || document;
        var cards = qsa('.movie-card', section);
        var input = qs('.filter-input', toolbar);
        var region = qs('.filter-region', toolbar);
        var year = qs('.filter-year', toolbar);
        var type = qs('.filter-type', toolbar);
        var empty = qs('.filter-empty', section) || qs('.filter-empty');

        fillSelect(region, uniqueValues(cards, 'data-region'));
        fillSelect(year, uniqueValues(cards, 'data-year'));
        fillSelect(type, uniqueValues(cards, 'data-type'));

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var regionValue = region ? region.value : '';
            var yearValue = year ? year.value : '';
            var typeValue = type ? type.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.textContent
                ].join(' ').toLowerCase();
                var matched = (!query || haystack.indexOf(query) !== -1) &&
                    (!regionValue || card.getAttribute('data-region') === regionValue) &&
                    (!yearValue || card.getAttribute('data-year') === yearValue) &&
                    (!typeValue || card.getAttribute('data-type') === typeValue);
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, region, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input) {
            input.value = q;
        }
        apply();
    });

    qsa('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('image-missing');
        });
    });
})();
