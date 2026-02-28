// middleware/authMiddleware.js
const supabase = require('../config/supabaseClient');

const protect = async (req, res, next) => {
    // Get the current user session from Supabase
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return res.redirect('/auth');
    }

    // Attach user to request for use in controllers
    req.user = user;
    next();
};

module.exports = protect;