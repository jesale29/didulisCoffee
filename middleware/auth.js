module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) return next();
        req.flash('error_msg', 'Please log in to view that resource');
        res.redirect('/login');
    },
    ensureAdmin: function(req, res, next) {
        // user.role check works because of our Model Proxy!
        if (req.user && req.user.role === 'admin') {
            return next();
        }
        req.flash('error_msg', 'Not authorized');
        res.redirect('/inventory');
    }
};