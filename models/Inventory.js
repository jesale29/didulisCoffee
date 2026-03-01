const Model = require('./Model');
const pool = require('../config/db');

class Inventory extends Model {
    constructor() {
        // 'products' is the table name, 'INVENTORY' is the log tag
        super('products', 'INVENTORY');
    }

    /**
     * ELOQUENT-STYLE INSTANCE CREATION
     * Wraps raw database rows into an Inventory instance with Proxy support.
     */
    static managedInstance(data) {
        if (!data) return null;
        const instance = new this();
        instance.attributes = data;
        return new Proxy(instance, {
            get(target, prop) {
                return prop in target ? target[prop] : target.attributes[prop];
            }
        });
    }

    /**
     * STATIC ENTRY POINT: Find by ID
     * Usage: const product = await Inventory.find(id);
     */
    static async find(id) {
        const query = `SELECT * FROM products WHERE id = $1 AND deleted_at IS NULL`;
        const { rows } = await pool.query(query, [id]);
        return rows[0] ? this.managedInstance(rows[0]) : null;
    }

    /**
     * CHECK FOR DUPLICATES
     * Used by the controller before 'store' to prevent SKU collisions.
     */
    async exists(sku) {
        const query = `SELECT id FROM ${this.table} WHERE sku = $1 LIMIT 1`;
        const { rows } = await pool.query(query, [sku]);
        return rows.length > 0;
    }

    /**
     * DOMAIN LOGIC: Low Stock (Supabase Integration)
     * Queries your Supabase connection directly for rapid filtering.
     */
    async findLowStock(threshold = 5) {
        // We require it here to avoid circular dependencies if any
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
        return data.map(item => Inventory.managedInstance(item));
    }

    /**
     * RELATIONSHIP: Order History
     * Returns all instances where this specific product was part of an order.
     */
    async orderHistory() {
        const sql = `
            SELECT oi.*, o.created_at, o.user_id 
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE oi.product_id = $1
            ORDER BY o.created_at DESC`;
        const { rows } = await pool.query(sql, [this.attributes.id]);
        return rows;
    }
}

// Export the Instance for general use, but the Class is available for static calls
module.exports = new Inventory();