const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');

const pool = require('./config/db'); 
const viewHelpers = require('./middleware/viewHelpers');
const mainRouter = require('./routes/index');

// Passport Config
require('./config/passport')(passport);

const app = express();

// 1. Body Parsers (Must be before routes)
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// 2. Session Middleware (ONLY ONE definition)
app.use(session({
    store: new pgSession({
        pool : pool,                
        tableName : 'session'       
    }),
    secret: process.env.SESSION_SECRET || 'didulis-coffee-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: process.env.NODE_ENV === 'production' 
    }
}));

// 3. Passport Middleware (CRITICAL: Must be after session)
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// 4. Global Variables
app.use((req, res, next) => {
    // Passport puts the user in req.user, not req.session.user
    res.locals.user = req.user || null; 
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); // Passport failure messages
    next();
});

// 5. View Engine & Layout Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout/layout'); 
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// 6. Static Assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/storage', express.static(path.join(__dirname, 'storage/app/public')));
app.use(viewHelpers);

// 7. Centralized Routing
app.use('/', mainRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('errors/500', { 
        title: '500 - Server Error',
        pageTitle: 'Server Error',
        message: err.message 
    });
});

module.exports = app;