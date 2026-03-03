// public/js/admin-main.js

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlElement = document.documentElement;

    const updateIcon = (theme) => {
        if (theme === 'dark') {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            themeIcon.classList.add('text-warning');
        } else {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            themeIcon.classList.remove('text-warning');
        }
    };

    // Sync icon on load
    updateIcon(htmlElement.getAttribute('data-bs-theme'));

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('didulis-theme', newTheme);
        updateIcon(newTheme);
    });
});