const Model = require('./Model');
const User = require('./User'); 
const OrderItem = require('./OrderItem');

class Order extends Model {
    static tableName = 'orders';

    constructor() {
        // Passing 'orders' to parent and 'ORDER' as the resource type for logging
        super(Order.tableName, 'ORDER');
    }

    /**
     * CUSTOMER LOGIC: Automated Checkout
     * Handles order creation, item insertion, and stock reduction atomically.
     */
    async customerCreate(userId, cartItems, totalAmount) {
        // Assuming runTransaction exists on your parent Model to provide a client
        return await this.db.query('BEGIN'); 
        try {
            // 1. Get Status ID for 'Reserved'
            const statusRes = await this.query("SELECT id FROM order_status WHERE name = 'Reserved'");
            const reservedId = statusRes.rows[0].id;

            // 2. Create the Order
            // We use 'this.attributes' to prepare the data for the Proxy
            this.attributes = { 
                user_id: userId, 
                current_status_id: reservedId, 
                total_amount: totalAmount 
            };
            
            // Save the order to get the ID and timestamps
            await this.save(); 

            // 3. Process Items and Inventory
            for (const item of cartItems) {
                await this.query(
                    `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) 
                     VALUES ($1, $2, $3, $4)`, 
                    [this.id, item.id, item.quantity, item.price]
                );
                
                // Atomic Stock Reduction
                await this.query(
                    `UPDATE products SET stock = stock - $1 WHERE id = $2`, 
                    [item.quantity, item.id]
                );
            }

            // 4. Log Activity (assuming logActivity is in parent Model)
            if (this.logActivity) {
                await this.logActivity({
                    userId,
                    resourceId: this.id,
                    actionType: 'CREATE_CUSTOMER',
                    newData: this.attributes,
                    description: `Customer placed order ${this.format().orderNumber}`
                });
            }

            await this.db.query('COMMIT');
            return this.format();
        } catch (error) {
            await this.db.query('ROLLBACK');
            throw error;
        }
    }

    /**
     * Utility: Format Order Number
     * Works directly on 'this' because it's called on a managed instance.
     */
    format() {
        const id = this.id;
        const created_at = this.created_at || new Date();
        
        // Generate a readable Order Number: #DC-2026-ABC12345
        const shortUuid = id ? id.toString().substring(0, 8).toUpperCase() : 'TEMP';
        const year = new Date(created_at).getFullYear();
        
        // Return a copy with the formatted number
        return { 
            ...this.attributes, 
            orderNumber: `#DC-${year}-${shortUuid}` 
        };
    }

    // --- Relationships ---

    async user() {
        return await this.belongsTo(User, 'user_id');
    }

    async orderItems() {
        // Renamed to avoid confusion with the model name 'OrderItem'
        return await this.hasMany(OrderItem, 'order_id');
    }

    // --- Dashboard Helpers ---

    /**
     * Fetch orders specifically for the Admin Dashboard
     */
    static async getRecentWithUsers(limit = 5) {
        const sql = `
            SELECT o.*, u.email as user_email 
            FROM ${this.tableName} o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.deleted_at IS NULL
            ORDER BY o.created_at DESC
            LIMIT $1
        `;
        const { rows } = await this.query(sql, [limit]);
        return rows.map(row => this.managedInstance(row));
    }
}

module.exports = Order;