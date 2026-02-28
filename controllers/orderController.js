// controllers/orderController.js
const supabase = require('../config/supabaseClient');

const OrderController = {
    // Update the status of an order
    async updateStatus(req, res) {
        const { orderId } = req.params;
        const { newStatus } = req.body; // e.g., 'processing'

        try {
            // 1. Update the order status in Supabase
            const { data, error } = await supabase
                .from('orders')
                .update({ status: newStatus, updated_at: new Date() })
                .eq('id', orderId)
                .select();

            if (error) throw error;

            res.status(200).json({ message: `Order updated to ${newStatus}`, data });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Create a new order (Initial state: pending)
    async createOrder(req, res) {
        const { userId, items } = req.body; // items: [{product_id, quantity, unit_price}]
        
        try {
            // Start a 'transaction' by inserting the order first
            const { data: order, error: orderErr } = await supabase
                .from('orders')
                .insert([{ user_id: userId, status: 'pending' }])
                .select()
                .single();

            if (orderErr) throw orderErr;

            // Prepare items with the new Order ID
            const orderItems = items.map(item => ({
                ...item,
                order_id: order.id
            }));

            const { error: itemsErr } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsErr) throw itemsErr;

            res.status(201).json({ message: "Order created successfully", orderId: order.id });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = OrderController;