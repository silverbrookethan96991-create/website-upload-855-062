(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        if (toggle && mobileMenu) {
            toggle.addEventListener("click", function () {
                mobileMenu.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length > 1) {
            var current = 0;
            var showSlide = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            };
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                });
            });
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        var searchInput = document.querySelector("[data-search-input]");
        var typeSelect = document.querySelector("[data-type-filter]");
        var yearSelect = document.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var emptyState = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        if (searchInput && params.get("q")) {
            searchInput.value = params.get("q");
        }

        var applyFilter = function () {
            if (!cards.length) {
                return;
            }
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var selectedType = typeSelect ? typeSelect.value : "";
            var selectedYear = yearSelect ? yearSelect.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-tags") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-genre") || ""
                ].join(" ").toLowerCase();
                var typeOk = !selectedType || (card.getAttribute("data-type") || "") === selectedType;
                var yearOk = !selectedYear || (card.getAttribute("data-year") || "") === selectedYear;
                var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
                var match = typeOk && yearOk && keywordOk;
                card.classList.toggle("hidden-card", !match);
                if (match) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.style.display = visible ? "none" : "block";
            }
        };

        [searchInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });
        applyFilter();
    });
})();
