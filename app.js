const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');

// Core Classes & Config
const BaseController = require('./controllers/BaseController');
const PassportConfig = require('./config/PassportConfig'); // New Class
const pool = require('./config/db'); 
const viewHelpers = require('./middleware/viewHelpers');
const Router = require('./routes/index');
const registry = require('./routes/registry');
const { Session } = require('inspector');

const app = express();

// 1. View Engine Setup (Set early to allow error rendering if needed)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main'); // Ensure this matches your folder structure
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// 2. Static Assets & Body Parsers
app.use(express.static(path.join(__dirname, 'public')));
app.use('/storage', express.static(path.join(__dirname, 'storage/app/public')));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// 3. Session Middleware
app.use(session({
    store: new pgSession({
        // We use the pool directly from the Model class
        pool : Session.db,                
        tableName : Session.tableName       
    }),
    secret: process.env.SESSION_SECRET || 'didulis-coffee-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 30 * 24 * 60 * 60 * 1000, 
        secure: process.env.NODE_ENV === 'production' 
    }
}));

// 4. Passport Configuration (Class-Based)
const authConfig = new PassportConfig(passport);
authConfig.init(); // This runs your strategies, serialize, and deserialize

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// 5. Global Helpers & View Variables
app.use(viewHelpers); // External helpers

app.use((req, res, next) => {
    // Bind registry to locals for EJS: route('name')
    res.locals.route = (name, params) => registry.route(name, params);
    
    // Auth variables
    res.locals.user = req.user || null; 
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); 
    next();
});

// 6. Routing
app.use('/', Router);

// 7. 404 Catch-All
app.use((req, res, next) => {
    const err = new Error(`The page ("${req.originalUrl}") does not exist.`);
    err.status = 404;
    next(err);
});

// 8. Global Error Handler
// Using your BaseController.renderError to show the Dark Mode error page
app.use((err, req, res, next) => {
    const status = err.status || 500;
    console.error(`\x1b[31m[System Error ${status}]: ${err.message}\x1b[0m`);
    
    const base = new BaseController();
    base.renderError(req, res, err);
});

// 9. BrowserSync (Development Only)
if (process.env.NODE_ENV === 'development') {
    const browserSync = require('browser-sync');
    browserSync({
        proxy: "localhost:3000", 
        files: ["views/**/*.ejs", "public/**/*.*", "models/**/*.js", "controllers/**/*.js", "routes/**/*.js"],
        port: 4000, 
        open: false,
        ui: false,
        notify: false,
        ghostMode: false 
    });
}

module.exports = app;