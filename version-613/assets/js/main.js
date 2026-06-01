(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var filterInput = document.querySelector('[data-card-filter]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (filterInput && cards.length) {
        filterInput.addEventListener('input', function () {
            var keyword = filterInput.value.trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search-text') || '').toLowerCase();
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        });
    }

    var images = Array.prototype.slice.call(document.querySelectorAll('[data-cover-image]'));
    images.forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('is-missing');
        }, { once: true });
    });

    initHeroSlider();
    initGlobalSearch();
}());

function initHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

    if (!slides.length) {
        return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === index);
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
            timer = null;
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            show(Number(dot.getAttribute('data-hero-dot')) || 0);
            start();
        });
    });

    var slider = document.getElementById('heroSlider');
    if (slider) {
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
    }

    show(0);
    start();
}

function initMoviePlayer(streamUrl) {
    var video = document.querySelector('[data-player-video]');
    var button = document.querySelector('[data-play-button]');

    if (!video || !button || !streamUrl) {
        return;
    }

    var loaded = false;

    function bind() {
        if (loaded) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        loaded = true;
        video.setAttribute('controls', 'controls');
    }

    function start() {
        bind();
        button.classList.add('is-hidden');
        var playResult = video.play();

        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
                button.classList.remove('is-hidden');
            });
        }
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (!loaded || video.paused) {
            start();
        }
    });
}

function initGlobalSearch() {
    var input = document.querySelector('[data-global-search-input]');
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');

    if (!input || !results || !window.movieSearchItems) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    function card(item) {
        var tags = item.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '' +
            '<article class="movie-card">' +
                '<a class="poster-wrap" href="./' + escapeHtml(item.url) + '">' +
                    '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="poster-glow"></span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<div class="movie-meta-line">' +
                        '<span>' + escapeHtml(item.year) + '</span>' +
                        '<span>' + escapeHtml(item.region) + '</span>' +
                        '<span>' + escapeHtml(item.type) + '</span>' +
                    '</div>' +
                    '<h2><a href="./' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>' +
                    '<p>' + escapeHtml(item.line) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</article>';
    }

    function run(value) {
        var keyword = value.trim().toLowerCase();

        if (!keyword) {
            results.innerHTML = '';
            if (status) {
                status.textContent = '请输入关键词开始搜索';
            }
            return;
        }

        var matched = window.movieSearchItems.filter(function (item) {
            return item.search.indexOf(keyword) !== -1;
        }).slice(0, 80);

        results.innerHTML = matched.map(card).join('');

        if (status) {
            status.textContent = matched.length ? '为你找到相关内容' : '暂无匹配内容';
        }
    }

    input.value = initial;
    run(initial);

    input.addEventListener('input', function () {
        run(input.value);
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-search-chip]')).forEach(function (chip) {
        chip.addEventListener('click', function () {
            input.value = chip.getAttribute('data-search-chip') || '';
            run(input.value);
            input.focus();
        });
    });
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char];
    });
}
