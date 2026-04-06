/* Dark Mode Toggle — runs after DOM is ready */
(function () {
    var STORAGE_KEY = 'uy-theme';

    function getSystemPreference() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark' : 'light';
    }

    function getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
        updateToggleIcons(theme === 'dark');
    }

    function updateToggleIcons(isDark) {
        document.querySelectorAll('.dark-mode-toggle i').forEach(function (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        });
        document.querySelectorAll('.dark-mode-toggle').forEach(function (btn) {
            btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        /* Wire up all toggle buttons (desktop navbar + mobile toolbar) */
        document.querySelectorAll('.dark-mode-toggle').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
                applyTheme(next);
            });
        });

        /* Sync icon state with current theme (set by inline script in <head>) */
        updateToggleIcons(getCurrentTheme() === 'dark');

        /* React to system preference changes when user hasn't overridden */
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
                if (!localStorage.getItem(STORAGE_KEY)) {
                    applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    });
}());
