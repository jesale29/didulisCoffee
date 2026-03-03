const express = require('express');
const router = express.Router();

const publicRoutes = require('./publicRoutes');
const inventoryRoutes = require('./inventoryRoutes'); 
const adminRoutes = require('./adminRoutes');
const authRoutes = require('./authRoutes');

// --- 1. THE LANDING PAGE ---
// Results in: public.home, public.about
router.use('/', publicRoutes);

// --- 2. AUTHENTICATION ---
// Results in: auth.login, auth.register
router.use('/', authRoutes); 

// --- 3. PRONG 1: THE CUSTOMER STORE ---
// Results in: store.inventory.index, store.inventory.show
router.use('/store', inventoryRoutes('/store', 'store.inventory'));

// --- 4. PRONG 2: THE ADMIN HUB ---
// Results in: admin.dashboard, admin.users.index, etc.
router.use('/admin', adminRoutes);

module.exports = router;