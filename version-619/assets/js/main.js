(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startAutoPlay() {
            stopAutoPlay();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopAutoPlay() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startAutoPlay();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startAutoPlay();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startAutoPlay();
            });
        }

        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
        startAutoPlay();
    }

    var player = document.querySelector('[data-hls-src]');

    if (player) {
        var status = document.querySelector('[data-player-status]');
        var source = player.getAttribute('data-hls-src');

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        if (!source) {
            setStatus('播放源暂未配置');
        } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
            player.src = source;
            setStatus('原生 HLS 播放源已就绪');
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });

            hls.loadSource(source);
            hls.attachMedia(player);

            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                setStatus('HLS 播放源已加载，点击播放器开始观看');
            });

            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus('播放源连接异常，请刷新页面或切换浏览器');
                }
            });
        } else {
            player.src = source;
            setStatus('当前浏览器需要 HLS 播放能力支持');
        }
    }

    var searchForm = document.querySelector('[data-search-form]');
    var searchInput = document.querySelector('[data-search-input]');
    var searchResults = document.querySelector('[data-search-results]');
    var searchSummary = document.querySelector('[data-search-summary]');

    function getQueryFromLocation() {
        try {
            return new URLSearchParams(window.location.search).get('q') || '';
        } catch (error) {
            return '';
        }
    }

    function createCard(movie) {
        var article = document.createElement('article');
        article.className = 'card movie-card';
        article.innerHTML = [
            '<a class="card-cover" href="' + movie.url + '" style="--cover-image: url(\'' + movie.cover + '\');" aria-label="' + escapeHtml(movie.title) + '">',
            '    <span class="corner-badge">' + escapeHtml(movie.year) + '</span>',
            '</a>',
            '<div class="card-body">',
            '    <a class="card-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
            '    <p>' + escapeHtml(movie.oneLine || '') + '</p>',
            '    <div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '</div>'
        ].join('');
        return article;
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[character];
        });
    }

    function runSearch(query) {
        if (!searchResults || !searchSummary || !window.MOVIE_SEARCH_DATA) {
            return;
        }

        var keyword = String(query || '').trim().toLowerCase();
        searchResults.innerHTML = '';

        if (!keyword) {
            searchSummary.textContent = '请输入关键词开始搜索。';
            return;
        }

        var results = window.MOVIE_SEARCH_DATA.filter(function (movie) {
            return movie.searchText.indexOf(keyword) !== -1;
        }).slice(0, 60);

        searchSummary.textContent = '找到 ' + results.length + ' 条相关结果。';

        results.forEach(function (movie) {
            searchResults.appendChild(createCard(movie));
        });
    }

    if (searchForm && searchInput) {
        var initialQuery = getQueryFromLocation();

        if (initialQuery) {
            searchInput.value = initialQuery;
            runSearch(initialQuery);
        }

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            runSearch(searchInput.value);
        });
    }
}());
