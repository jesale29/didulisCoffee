const BaseController = require('./BaseController');


class AuthController extends BaseController {
    constructor() {
        super();
    }

    /**
     * GET /login
     * Display the login form
     */
    getLogin = (req, res) => {
        // If user is already authenticated, don't show the login page
        if (req.isAuthenticated()) {
            const isAdmin = req.user.role === 'admin' || req.user.role === 'staff';
            return res.redirect(isAdmin ? this.route('admin.dashboard') : this.route('public.home'));
        }

        // Render the login view
        res.render('auth/login', {
            title: 'Login | Didulis Coffee',
            // Pass any flash messages if your setup requires manual passing
            error: req.flash('error')
        });
    };

    // Convert to arrow function to keep 'this'
    postLogin = (req, res, next) => {
        // Use arrow function in the callback too!
        this.passport.authenticate('local', (err, user, info) => {
            if (err) return next(err);
            
            if (!user) {
                // Now 'this' correctly refers to the controller
                return res.redirect(this.route('auth.login'));
            }

            req.logIn(user, (err) => {
                if (err) return next(err);

                const isAdmin = user.role === 'admin' || user.role === 'staff';
                
                const destination = isAdmin 
                    ? this.route('admin.dashboard') 
                    : this.route('public.home');

                return res.redirect(destination);
            });
        })(req, res, next);
    }

    logout = (req, res) => {
        req.logout((err) => {
            if (err) return next(err);
            res.redirect(this.route('auth.login'));
        });
    }
}

module.exports = new AuthController();