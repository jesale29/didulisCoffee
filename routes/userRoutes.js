// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Auth Routes
router.get('/', (req, res) => {
    // We pass any global data needed for the layout here
    res.render('index', { 
        title: "OrderFlow | Home",
        user: req.user || null // Assuming you have auth middleware
    });
});
router.get('/auth', authController.renderAuthPage);
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.get('/logout', authController.signOut);
router.get('/inventory', );

// Protected Route (Dashboard)
router.get('/dashboard', protect, (req, res) => {
    res.send(`Welcome to your dashboard, ${req.user.email}!`);
});

// Viewing inventory: Accessible by Staff and Admins
router.get('/', authorize(['admin', 'staff']), inventoryController.index);

// Adding inventory: Restricted to Admins only
router.post('/add', authorize('admin'), inventoryController.addProduct);

module.exports = router;