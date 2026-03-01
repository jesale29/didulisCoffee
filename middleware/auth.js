// middleware/auth.js

module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        console.log("🚫 Unauthorized access blocked. Redirecting to login...");
        res.redirect('/login');
    }
};