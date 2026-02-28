// middleware/roleMiddleware.js
const supabase = require('../config/supabaseClient');

/**
 * Middleware to restrict access based on dynamic roles
 * @param {string|string[]} allowedRoles - Single role string or array of strings
 */
const authorize = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            // 1. Ensure the user is authenticated (req.user is set by authMiddleware)
            if (!req.user) {
                return res.status(401).redirect('/auth');
            }

            // 2. Fetch the user's role name from the database
            const { data: profile, error } = await supabase
                .from('profiles')
                .select(`
                    role_id,
                    roles ( name )
                `)
                .eq('id', req.user.id)
                .single();

            if (error || !profile || !profile.roles) {
                return res.status(403).send("User profile or role not found.");
            }

            const userRole = profile.roles.name;

            // 3. Check if the user's role is in the allowed list
            const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
            
            if (!rolesArray.includes(userRole)) {
                return res.status(403).render('error', { 
                    message: "Access Denied: You do not have the required permissions." 
                });
            }

            // 4. Success - proceed to the controller
            next();
        } catch (err) {
            console.error("Authorization Error:", err.message);
            res.status(500).send("Internal Server Error during authorization.");
        }
    };
};

module.exports = authorize;