require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

const app = express();

// --- 1. SETTINGS & VIEW ENGINE ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout'); // Tells Express to use views/layout.ejs as the wrapper

// --- 2. MIDDLEWARE ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- 3. ROUTES ---
// Root/Landing Page Route
app.get('/', (req, res) => {
    // We pass 'title' because our layout.ejs likely uses it in the <title> tag
    res.render('index', { title: 'Home | OrderFlow' });
});

// Auth Page Route
app.get('/auth', (req, res) => {
    res.render('auth', { title: 'Login | OrderFlow' });
});

// --- 4. SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    ✅ Server is Live!
    --------------------------------------
    Local: http://localhost:${PORT}
    Mode: Development (MVC)
    --------------------------------------
    `);
});