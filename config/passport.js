const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // This is your User singleton/class

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
            try {
                // 1. Check Database
                // Note: Since User is exported as an instance/class, 
                // we ensure we call the method correctly.
                const user = await User.findByEmail(email);

                if (!user) {
                    return done(null, false, { message: 'That email is not registered' });
                }

                // 2. Match Password
                const isMatch = await bcrypt.compare(password, user.password);
                
                if (isMatch) {
                    // 3. Log Activity
                    // Using the instance method if User is an instance, 
                    // or static if defined as static.
                    if (user.logActivity) {
                        await user.logActivity({
                            userId: user.id,
                            resourceId: user.id,
                            actionType: 'LOGIN',
                            description: `User ${user.email} logged in successfully.`
                        });
                    }
                    
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password incorrect' });
                }
            } catch (err) {
                console.error("🔥 Passport Strategy Error:", err);
                return done(err);
            }
        })
    );

    /**
     * Serializes the user ID into the session.
     */
    passport.serializeUser((user, done) => {
        // user.id is accessible via the Proxy attributes
        done(null, user.id);
    });

    /**
     * Deserializes the user from the ID in the session.
     */
    passport.deserializeUser(async (id, done) => {
        try {
            // Uses the 'find' method inherited from Model.js
            const user = await User.find(id);
            
            if (user) {
                // Attach the role name directly to the user object
                // This makes it available in every request as req.user.roleName
                const roleData = await user.userRole();
                user.roleName = roleData ? roleData.name : 'customer';
            }
            
            done(null, user);
        } catch (err) {
            console.error("❌ Deserialization Error:", err);
            done(err, null);
        }
    });
};