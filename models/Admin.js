const Model = require('./Model');

/**
 * AdminModel - Extends base Model for Admin-specific operations
 * Handles data aggregation for the dashboard and inventory management.
 */
class Admin extends Model {
    constructor() {
        super(); // Inherits the DB connection and query method from Model.js
    }

    /**
     * Dashboard Summary Data
     * Runs multiple counts in a single query for performance
     */
    async getDashboardStats() {
        const sql = `
            SELECT 
                (SELECT COUNT(*) FROM orders) as orders_count,
                (SELECT COUNT(*) FROM products WHERE stock < 10) as low_stock_count,
                (SELECT COUNT(*) FROM users WHERE role != 'customer') as staff_count,
                (SELECT SUM(total_price) FROM orders WHERE status = 'completed') as total_revenue
        `;
        const result = await this.query(sql);
        return result[0]; // Return the single row of stats
    }

    /**
     * Recent Activity
     */
    async getRecentOrders(limit = 5) {
        const sql = `
            SELECT id, customer_name, status, total_price, created_at 
            FROM orders 
            ORDER BY created_at DESC 
            LIMIT $1
        `;
        return await this.query(sql, [limit]);
    }

    /**
     * Inventory Listing
     */
    async getInventoryList() {
        const sql = `
            SELECT id, name, sku, category, stock, price 
            FROM products 
            ORDER BY stock ASC, name ASC
        `;
        return await this.query(sql);
    }
}

module.exports = Admin;