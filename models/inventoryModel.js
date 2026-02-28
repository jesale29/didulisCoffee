const supabase = require('../config/supabaseClient');

const Inventory = {
    // Fetch all products
    async getAll() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name', { ascending: true });
        
        if (error) throw error;
        return data;
    },

    // Add a new product and create initial audit log
    async createProduct(productData) {
        // 1. Insert the product
        const { data: product, error: pError } = await supabase
            .from('products')
            .insert([productData])
            .select()
            .single();

        if (pError) throw pError;

        // 2. Log the initial stock entry for tracing
        const { error: lError } = await supabase
            .from('inventory_log')
            .insert([{
                product_id: product.id,
                change_amount: product.stock_quantity,
                reason: 'Initial stock entry'
            }]);

        if (lError) throw lError;
        return product;
    }
};

module.exports = Inventory;