// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const authorize = require('../middleware/roleMiddleware');
const AuditController = require('../controllers/auditController');
const OrderController = require('../controllers/orderController');

// Only Admins can see the Stock Audit
router.get('/audit', authorize('admin'), AuditController.viewStockStatus);

// Both Admins and Staff can update Order Status (Processing/Shipped)
router.post('/orders/:orderId/status', authorize(['admin', 'staff']), OrderController.updateStatus);

module.exports = router;