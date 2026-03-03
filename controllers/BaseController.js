const passport = require('passport');

class BaseController {
    constructor() {
        // Safe check for registry to prevent crash if not yet loaded
        try {
            this.route = require('../routes/registry').route;
        } catch (e) {
            this.route = (path) => path; 
        }
        this.passport = passport;
    }

    /**
     * Standardized Render Method
     * Uses spread operator to merge data, preventing DEP0060.
     */
    render = (res, view, data = {}, layout = 'main') => {
        // 1. Prepare default variables
        const defaultData = {
            pageStyles: null,
            pageScripts: null,
            title: 'Didulis Coffee',
            user: res.locals.user || null,
            activePage: 'dashboard', // Default for sidebar highlighting
            layout: `layouts/${layout}`
        };

        // 2. Merge using the Spread Operator (Modern & Safe)
        const finalData = { ...defaultData, ...data };

        res.render(view, finalData);
    }

    /**
     * Redirect Error Handler
     */
    handleError = (res, error, redirectPath = 'home') => {
        console.error("\x1b[31m[Controller Error]:\x1b[0m", error.message);
        return res.redirect(this.route(redirectPath));
    }

    /**
     * Detailed Error Page Renderer (Laravel Style)
     */
    renderError = (req, res, err) => {
        const status = err.status || 500;
        const backURL = req.header('Referer') || '/admin/dashboard';

        this.render(res, 'error/display', {
            title: `System Alert: ${status}`,
            message: err.message,
            status: status,
            stack: process.env.NODE_ENV === 'development' ? err.stack : null,
            backURL: backURL,
            env: process.env.NODE_ENV || 'development'
        }, 'error'); 
    }
}

module.exports = BaseController;