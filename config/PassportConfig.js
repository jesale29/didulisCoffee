const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * PassportConfig Class
 * Centralizes authentication strategies and session management.
 */
class PassportConfig {
    constructor(passport) {
        this.passport = passport;
    }

    /**
     * Initialize all passport configurations
     */
    init() {
        this.setupLocalStrategy();
        this.setupSerialization();
        this.setupDeserialization();
    }

    /**
     * Configure the Local Username/Password Strategy
     */
    setupLocalStrategy() {
        this.passport.use(
            new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
                try {
                    // Using the static method we refactored in User.js
                    const user = await User.findByEmail(email);

                    if (!user) {
                        return done(null, false, { message: 'That email is not registered' });
                    }

                    const isMatch = await bcrypt.compare(password, user.password);
                    
                    if (isMatch) {
                        // Log activity if the model supports it
                        if (user.logActivity) {
                            await user.logActivity({
                                userId: user.id,
                                resourceId: user.id,
                                actionType: 'LOGIN',
                                description: `User ${user.email} authenticated via Passport Class.`
                            });
                        }
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Password incorrect' });
                    }
                } catch (err) {
                    return done(err);
                }
            })
        );
    }

    /**
     * Determines which data of the user object should be stored in the session.
     */
    setupSerialization() {
        this.passport.serializeUser((user, done) => {
            done(null, user.id);
        });
    }

    /**
     * Retrieves the user object from the database using the ID in the session.
     */
    setupDeserialization() {
        this.passport.deserializeUser(async (id, done) => {
            try {
                // Uses the 'find' method inherited from Model.js
                const user = await User.find(id);
                
                if (user) {
                    // Attach dynamic role data for EJS access
                    const roleData = await user.userRole();
                    user.roleName = roleData ? roleData.name : 'customer';
                }
                
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        });
    }
}

module.exports = PassportConfig;