const Model = require('./Model');

class Inventory extends Model {

    static tableName = 'products';

    constructor() {
        // Table: products, Resource Tag: INVENTORY
        super('products', 'INVENTORY');
    }

    /**
     * CHECK FOR DUPLICATES
     * Uses the inherited shared query engine.
     */
    async exists(sku) {
        const sql = `SELECT id FROM ${this.table} WHERE sku = $1 LIMIT 1`;
        const { rows } = await this.query(sql, [sku]);
        return rows.length > 0;
    }

    /**
     * DOMAIN LOGIC: Low Stock (Supabase Integration)
     * Queries Supabase for rapid filtering, returns Managed Instances.
     */
    async findLowStock(threshold = 5) {
        const supabase = require('../config/supabase'); 
        
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .lt('quantity', threshold)
            .is('deleted_at', null);
        
        if (error) {
            console.error("❌ Supabase Low Stock Error:", error.message);
            throw error;
        }

        // Use the parent's managedInstance to wrap the results
        return data.map(item => this.constructor.managedInstance(item));
    }

    /**
     * RELATIONSHIP: Order History
     * Accesses attributes via the Proxy set up in the parent Model.
     */
    async orderHistory() {
        const sql = `
            SELECT oi.*, o.created_at, o.user_id 
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE oi.product_id = $1
            ORDER BY o.created_at DESC`;
        
        // this.id works here because of the Proxy in Model.js
        const { rows } = await this.query(sql, [this.id]);
        return rows;
    }

    /**
     * ATOMIC STOCK ADJUSTMENT
     * Example of using the new runTransaction helper from Model.js
     */
    async adjustStock(id, amount, userId, reason = 'Inventory Update') {
        return await this.runTransaction(async (client) => {
            const sql = `
                UPDATE ${this.table} 
                SET quantity = quantity + $1, updated_at = NOW() 
                WHERE id = $2 
                RETURNING *`;
            
            const { rows } = await client.query(sql, [amount, id]);
            const updated = rows[0];

            await this.logActivity({
                userId,
                resourceId: id,
                actionType: 'STOCK_ADJUST',
                newData: { quantity: updated.quantity },
                description: `${reason}: Adjusted by ${amount}`
            });

            return this.constructor.managedInstance(updated);
        });
    }
}

// Export the instance for the controller to use
module.exports = Inventory;