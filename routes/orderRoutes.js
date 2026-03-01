const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth'); // Assuming you have this
const OrderController = require('../controllers/OrderController');

// All public routes require a logged-in user
router.use(ensureAuthenticated);

/**
 * CUSTOMER FACING ROUTES
 */
// GET /orders - List all orders for the current user
router.get('/', (req, res) => OrderController.index(req, res));

// GET /orders/create - Show the final checkout/confirmation page
router.get('/create', (req, res) => OrderController.create(req, res));

// POST /orders - Process the checkout (Customer creation logic)
router.post('/', (req, res) => OrderController.store(req, res));

// GET /orders/:id - View specific order details
router.get('/:id', (req, res) => OrderController.show(req, res));

// DELETE /orders/:id - Cancel/Archive an order (Soft delete)
router.delete('/:id', (req, res) => OrderController.destroy(req, res));

module.exports = router;