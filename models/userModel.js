const supabase = require('../config/supabaseClient');

const User = {
    /**
     * Retrieves a user profile and their associated role name.
     * @param {string} userId - The UUID from Supabase Auth.
     */
    async getProfileWithRole(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                id,
                full_name,
                address,
                phone_number,
                roles (
                    name,
                    description
                )
            `)
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Updates profile information.
     * @param {string} userId - The UUID of the user.
     * @param {object} updates - Object containing fields to update.
     */
    async updateProfile(userId, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select();

        if (error) throw error;
        return data;
    },

    /**
     * Admin method to change a user's role.
     */
    async changeUserRole(userId, newRoleId) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ role_id: newRoleId })
            .eq('id', userId)
            .select();

        if (error) throw error;
        return data;
    }
};

module.exports = User;