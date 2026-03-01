const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
            console.log(`🔍 Attempting login for: ${email}`);

            try {
                // 1. Check Database
                const user = await User.findByEmail(email);

                if (!user) {
                    console.log("❌ User not found in DB");
                    return done(null, false, { message: 'That email is not registered' });
                }

                console.log("✅ User found, checking password...");

                // 2. Match Password
                const isMatch = await bcrypt.compare(password, user.password);
                
                if (isMatch) {
                    console.log("🚀 Password match! Authenticating...");
                    return done(null, user);
                } else {
                    console.log("❌ Password mismatch");
                    return done(null, false, { message: 'Password incorrect' });
                }
            } catch (err) {
                console.error("🔥 Passport Strategy Error:", err);
                return done(err);
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};