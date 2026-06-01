(function () {
    var mobileToggle = document.querySelector('.mobile-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    document.querySelectorAll('.site-search-form').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input');
            var keyword = input ? input.value.trim() : '';
            var target = './search.html';
            if (keyword) {
                target += '?q=' + encodeURIComponent(keyword);
            }
            window.location.href = target;
        });
    });

    var hero = document.querySelector('.hero');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var current = 0;
        var timer = null;

        var show = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        };

        var restart = function () {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        };

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });

        show(0);
        restart();
    }

    var filterInput = document.querySelector('.filter-input');
    var filterSelect = document.querySelector('.filter-select');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    var applyFilters = function () {
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var type = filterSelect ? filterSelect.value : '';
        cards.forEach(function (card) {
            var content = (card.getAttribute('data-search') || '').toLowerCase();
            var cardType = card.getAttribute('data-type') || '';
            var matchedKeyword = !keyword || content.indexOf(keyword) !== -1;
            var matchedType = !type || cardType === type;
            card.classList.toggle('hidden-card', !(matchedKeyword && matchedType));
        });
    };

    if (filterInput || filterSelect) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && filterInput) {
            filterInput.value = query;
        }
        if (filterInput) {
            filterInput.addEventListener('input', applyFilters);
        }
        if (filterSelect) {
            filterSelect.addEventListener('change', applyFilters);
        }
        applyFilters();
    }

    document.querySelectorAll('.player-box').forEach(function (box) {
        var video = box.querySelector('video');
        var trigger = box.querySelector('.player-trigger');
        var stream = box.getAttribute('data-stream');
        var initialized = false;
        var hls = null;

        var start = function () {
            if (!video || !stream) {
                return;
            }
            box.classList.add('is-playing');
            if (!initialized) {
                initialized = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        maxBufferLength: 40,
                        enableWorker: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        };

        if (trigger) {
            trigger.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
}());
