const supabase = require('../config/supabase');

const products = {
    /**
     * Fetch all items
     */
    async getAll() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Fetch Error: ${error.message}`);
        return data;
    },

    /**
     * Fetch a single item by ID
     */
    async find(id) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw new Error(`Item Not Found: ${error.message}`);
        return data;
    },

    /**
     * Create a new products item (Laravel-style 'create')
     */
    async create(itemData) {
        const { data, error } = await supabase
            .from('products')
            .insert([itemData])
            .select();

        if (error) throw new Error(`Insert Error: ${error.message}`);
        return data[0];
    },

    /**
     * Update an existing item (Laravel-style 'update')
     */
    async update(id, updateData) {
        const { data, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) throw new Error(`Update Error: ${error.message}`);
        return data[0];
    },

    /**
     * Delete an item (Laravel-style 'delete')
     */
    async delete(id) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Delete Error: ${error.message}`);
        return true;
    },

    /**
     * Search items by name (Laravel-style 'where like')
     */
    async search(query) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .ilike('name', `%${query}%`);

        if (error) throw new Error(`Search Error: ${error.message}`);
        return data;
    }
};

module.exports = products;