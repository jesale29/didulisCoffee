// routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { ensureAuthenticated } = require('../middleware/auth'); // Import our guard

// Add the middleware to the route
router.get('/', ensureAuthenticated, inventoryController.index);

module.exports = router;