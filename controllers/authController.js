const passport = require('passport');
const User = require('../models/User');

const authController = {
    // 1. Show Login Form
    getLogin: (req, res) => {
        res.render('auth/login', { 
            title: 'Login', 
            layout: 'layout/layout' 
        });
    },

    // 2. Handle Login Submission
    postLogin: (req, res, next) => {
        passport.authenticate('local', {
            successRedirect: '/inventory',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next);
    },

    // 3. Handle Logout
    logout: (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            req.flash('success_msg', 'You are logged out');
            res.redirect('/login');
        });
    }
};

// CRITICAL: Ensure this export is here!
module.exports = authController;