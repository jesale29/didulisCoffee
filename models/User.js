const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

const User = {
    /**
     * Find a user by email
     */
    async findByEmail(email) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
        return data;
    },

    /**
     * Create a new user with a hashed password
     */
    async create({ name, email, password }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data, error } = await supabase
            .from('users')
            .insert([{ name, email, password: hashedPassword }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

module.exports = User;