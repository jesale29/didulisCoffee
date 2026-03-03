/**
 * Theme Handler for Didulis Admin
 * Handles light/dark mode persistence using Bootstrap 5.3 data attributes
 */
const themeHandler = {
    init() {
        const savedTheme = localStorage.getItem('theme') || this.getSystemPreference();
        this.setTheme(savedTheme);
        this.setupListener();
    },

    getSystemPreference() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update Icon
        const icon = document.getElementById('theme-icon');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun fs-5 text-warning' : 'fas fa-moon fs-5 text-dark';
        }
    },

    setupListener() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-bs-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                this.setTheme(newTheme);
            });
        }
    }
};

// Execute immediately to prevent "flash" of white content
themeHandler.init();