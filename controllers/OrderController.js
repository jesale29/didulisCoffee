const Order = require('../models/Order');

class OrderController {
    
    /**
     * GET /orders (Index)
     * Laravel: $orders = Order::all();
     */
    async index(req, res) {
        try {
            // We use a custom static method to filter by user
            const orders = await Order.where('user_id', req.user.id);
            
            res.render('orders/index', { 
                title: 'My Orders', 
                orders 
            });
        } catch (err) {
            res.status(500).render('errors/500');
        }
    }

    /**
     * GET /orders/create
     * Shows the checkout/cart confirmation page.
     */
    async create(req, res) {
        res.render('orders/create', { title: 'Finalize Order' });
    }

    /**
     * POST /orders (Store)
     * Laravel: Order::create([...])
     */
    async store(req, res) {
        try {
            const { cart, total } = req.body;
            // Calls the specialized business logic inside the Order model
            const order = await Order.customerCreate(req.user.id, cart, total);
            
            res.redirect(`/orders/${order.id}`);
        } catch (err) {
            res.status(400).render('cart/index', { error: 'Failed to place order.' });
        }
    }

    /**
     * GET /orders/:id (Show)
     * Laravel: $order = Order::with(['items', 'user'])->find($id);
     */
    async show(req, res) {
        try {
            const order = await Order.find(req.params.id);

            // Validation: Exists, Not Deleted, and belongs to User (unless Admin)
            if (!order || (order.user_id !== req.user.id && req.user.role !== 'admin')) {
                return res.status(404).render('errors/404');
            }

            // Eager load relations via instance methods
            const items = await order.items();
            const customer = await order.user();

            res.render('orders/show', { 
                title: `Order Details`, 
                order,
                items,
                customer
            });
        } catch (err) {
            res.status(500).render('errors/500');
        }
    }

    /**
     * PUT /orders/:id (Update)
     * Used for internal status updates (Admin)
     */
    async update(req, res) {
        try {
            const order = await Order.find(req.params.id);
            if (!order) return res.status(404).json({ success: false });

            // Laravel-style attribute update
            await order.update({
                current_status_id: req.body.status_id,
                notes: req.body.notes
            });

            res.json({ success: true, message: 'Order updated.' });
        } catch (err) {
            res.status(500).json({ success: false });
        }
    }

    /**
     * DELETE /orders/:id (Destroy)
     * Laravel: $order->delete(); (Soft delete implementation)
     */
    async destroy(req, res) {
        try {
            const order = await Order.find(req.params.id);
            
            if (order) {
                // Instance method that handles soft-delete + logging
                await order.archive(req.user.id, 'Order cancelled by customer.');
            }

            res.redirect('/orders');
        } catch (err) {
            res.status(500).send("Cancellation failed.");
        }
    }
}

// Export as a singleton instance
module.exports = new OrderController();