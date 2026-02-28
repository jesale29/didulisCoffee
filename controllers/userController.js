const User = require('../models/userModel');

// For the customer to see/edit their own data
exports.getAccount = async (req, res) => {
    try {
        // req.user is populated by our authMiddleware
        const profile = await User.getProfile(req.user.id);
        res.render('user/account', { profile });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// For the admin to see all registered customers
exports.adminUserList = async (req, res) => {
    try {
        const users = await User.getAllWithStats();
        res.render('admin/users', { users });
    } catch (err) {
        res.status(500).send(err.message);
    }
};