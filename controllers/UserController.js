const User = require('../models/User');

class UserController {
    /**
     * GET /admin/users
     * Displays all registered users.
     */
    async index(req, res) {
        try {
            const users = await User.all();
            res.render('admin/users/index', { 
                title: 'User Management', 
                users,
                layout: 'layout/layout'
            });
        } catch (err) {
            res.status(500).send("Error loading users.");
        }
    }

    /**
     * GET /admin/users/:id
     * View a specific user and their order history.
     */
    async show(req, res) {
        try {
            const user = await User.find(req.params.id);
            if (!user) return res.status(404).send("User not found");

            // Using the relationship we built in the User model
            const orders = await user.orders();

            res.render('admin/users/show', { 
                title: `Profile: ${user.email}`, 
                user, 
                orders 
            });
        } catch (err) {
            res.status(500).send("Error fetching user details.");
        }
    }

    /**
     * POST /admin/users/:id/archive
     * Soft-deletes a user account.
     */
    async archive(req, res) {
        try {
            // Uses the transaction-safe archive from Model.js
            // Passes the current admin ID (req.user.id) for the activity log
            await User.archive(
                req.params.id, 
                req.user.id, 
                "Account suspended by Administrator."
            );

            req.flash('success_msg', 'User account has been archived.');
            res.redirect('/admin/users');
        } catch (err) {
            res.status(500).send("Failed to archive user.");
        }
    }
}

module.exports = new UserController();