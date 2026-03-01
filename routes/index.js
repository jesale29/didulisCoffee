const express = require('express');
const router = express.Router();
const inventoryRoutes = require('./inventoryRoutes');
const authRoutes = require('./authRoutes');


// Auth routes
router.use('/', authRoutes);

// Home Route
router.get('/', (req, res) => {
    res.render('index', { 
        title: 'Dashboard',
        pageTitle: "Diduli's Coffee Inc." 

    });
});

// Prefix all inventory routes
router.use('/inventory', inventoryRoutes);

// 2. The Catch-All Route (Must be last)
router.use((req, res) => {
    res.status(404).render('errors/404', { 
        title: '404 - Page Not Found' 
    });
});

module.exports = router;