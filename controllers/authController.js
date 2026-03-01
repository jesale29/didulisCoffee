const User = require('../models/User');
const bcrypt = require('bcryptjs');

const authController = {
    // Show Login Page
    showLogin(req, res) {
        res.render('auth/login', { title: 'Login' });
    },

    // Handle Login Logic
    async login(req, res) {
        const { email, password } = req.body;

        try {
            const user = await User.findByEmail(email);
            if (!user) {
                req.flash('error_msg', 'Email not registered');
                return res.redirect('/login');
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                req.flash('error_msg', 'Password incorrect');
                return res.redirect('/login');
            }

            // Create Session
            req.session.user = { id: user.id, name: user.name, email: user.email };
            res.redirect('/inventory');
        } catch (err) {
            res.status(500).send(err.message);
        }
    },

    // Logout
    logout(req, res) {
        req.session.destroy(() => {
            res.redirect('/login');
        });
    }
};

module.exports = authController;