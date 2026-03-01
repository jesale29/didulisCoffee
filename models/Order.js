const Model = require('./Model');
const pool = require('../config/db');

class Order extends Model {
    constructor() {
        super('orders', 'ORDER');
    }

    /**
     * CUSTOMER LOGIC: Automated Checkout
     * Includes 5-minute stock reservation and 'Reserved' status.
     */
    async customerCreate(userId, cartItems, totalAmount) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const statusRes = await client.query("SELECT id FROM order_status WHERE name = 'Reserved'");
            const reservedId = statusRes.rows[0].id;

            const order = await this.create({ 
                user_id: userId, 
                current_status_id: reservedId, 
                total_amount: totalAmount 
            });

            for (const item of cartItems) {
                await client.query(`INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)`, 
                    [order.id, item.id, item.quantity, item.price]);
                
                // Immediate Stock Reduction for Reservation
                await client.query(`UPDATE inventory SET stock = stock - $1 WHERE id = $2`, [item.quantity, item.id]);
            }

            await this.logActivity({
                userId,
                resourceId: order.id,
                actionType: 'CREATE_CUSTOMER',
                newData: order,
                description: `Customer placed order ${this.format(order).orderNumber}`
            });

            await client.query('COMMIT');
            return this.format(order);
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally { client.release(); }
    }

    /**
     * INTERNAL LOGIC: Admin Manual Order
     * Bypasses automated reservation logic for manual entry.
     */
    async internalCreate(adminId, customerId, items, totalAmount, notes) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const statusRes = await client.query("SELECT id FROM order_status WHERE name = 'Confirmed'");
            const confirmedId = statusRes.rows[0].id;

            const order = await this.create({
                user_id: customerId,
                current_status_id: confirmedId,
                total_amount: totalAmount
            });

            // Log that this was an INTERNAL creation for audit
            await this.logActivity({
                userId: adminId,
                resourceId: order.id,
                actionType: 'CREATE_INTERNAL',
                newData: order,
                description: `Internal Admin Order created: ${notes}`
            });

            await client.query('COMMIT');
            return this.format(order);
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally { client.release(); }
    }

    format(order) {
        if (!order) return null;
        const shortUuid = order.id.toString().substring(0, 8).toUpperCase();
        return { ...order, orderNumber: `#DC-${new Date(order.created_at).getFullYear()}-${shortUuid}` };
    }

    // $this->belongsTo(User::class)
    async user() {
        return await this.belongsTo(User, 'user_id');
    }

    // $this->hasMany(OrderItem::class)
    async items() {
        return await this.hasMany(OrderItem, 'order_id');
    }

}

module.exports = new Order();