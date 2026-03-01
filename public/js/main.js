/**
 * main.js - Client-side logic for Didulis Coffee
 */

console.log("✅ main.js loaded successfully");

const initializeInventory = () => {
    const genBtn = document.getElementById('genBtn');
    const skuInput = document.getElementById('skuInput');

    if (genBtn && skuInput) {
        genBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Stop form submission

            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const gen = (len) => {
                let res = '';
                for (let i = 0; i < len; i++) {
                    res += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return res;
            };

            const formattedSku = `${gen(3)}-${gen(3)}-${gen(4)}`;
            skuInput.value = formattedSku;
            
            console.log("SKU Generated: " + formattedSku);
        });
    }
};

// Initialize once the window is fully loaded
window.addEventListener('load', initializeInventory);

// public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Didulis Asset Loaded");

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Page Fade-In Effect
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in-out';
    
    // Trigger the fade in
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 10);

    console.log("Assets Loaded: Transition Applied");
});