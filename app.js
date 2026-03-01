const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const viewHelpers = require('./middleware/viewHelpers');
const mainRouter = require('./routes/index');
const session = require('express-session');
const flash = require('connect-flash');




const app = express();

// --- ADD THESE LINES ---
// This allows Express to read JSON data
app.use(express.json()); 
// This allows Express to read standard HTML form data (URL-encoded)
app.use(express.urlencoded({ extended: true })); 
// -----------------------

// Middleware for Sessions
app.use(session({
    secret: process.env.APP_KEY || 'secret-coffee-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

app.use(flash());

// Global variable for Auth Status (Available in all EJS views)
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

// 1. View Engine & Layout Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout/layout'); // Points to views/layout/layout.ejs
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// 2. Middleware & Assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/storage', express.static(path.join(__dirname, 'storage/app/public')));
app.use(viewHelpers);

// 3. Centralized Routing
app.use('/', mainRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('errors/500', { 
        title: '500 - Server Error',
        message: err.message 
    });
});

module.exports = app;