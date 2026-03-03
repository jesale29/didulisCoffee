const express = require('express');
const expressRouter = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const OrderController = require('../controllers/OrderController');

/**
 * INITIALIZE WRAPPER
 * This adds the .name() functionality to your routes.
 */
const Route = require('../utils/RouteWrapper')(expressRouter, '');

// All order routes require a logged-in user
expressRouter.use(ensureAuthenticated);

/**
 * CUSTOMER & ADMIN SHARED ROUTES
 * The controller logic will handle the view difference via req.originalUrl
 */

// GET /orders - List all orders
Route.get('/', (req, res) => OrderController.index(req, res))
     .name('orders.index');

// GET /orders/create - Show the checkout page
Route.get('/create', (req, res) => OrderController.create(req, res))
     .name('orders.create');

// POST /orders - Process the checkout
Route.post('/', (req, res) => OrderController.store(req, res))
     .name('orders.store');

// GET /orders/:id - View specific order details
Route.get('/:id', (req, res) => OrderController.show(req, res))
     .name('orders.show');

// DELETE /orders/:id - Cancel/Archive an order
// Note: Some browsers/forms struggle with DELETE, so we use POST for archiving usually
Route.post('/:id/cancel', (req, res) => OrderController.destroy(req, res))
     .name('orders.destroy');

module.exports = expressRouter;