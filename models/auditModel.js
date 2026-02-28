// models/auditModel.js
const supabase = require('../config/supabaseClient');

const Audit = {
    // Get full history for a specific product
    async getProductHistory(productId) {
        const { data, error } = await supabase
            .from('inventory_log')
            .select(`
                id,
                change_amount,
                reason,
                created_at,
                products (name, sku)
            `)
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get a summary of current vs. expected stock
    async getStockSummary() {
        const { data, error } = await supabase
            .from('products')
            .select('id, name, sku, stock_quantity');
        
        if (error) throw error;
        return data;
    }
};

module.exports = Audit;