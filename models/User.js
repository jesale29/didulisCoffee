const pool = require('../config/db'); // Ensure this points to your postgres pool

const User = {
    // Find user for the Login Strategy
    findByEmail: async (email) => {
        try {
            const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            return res.rows[0];
        } catch (err) {
            console.error("Database Error in findByEmail:", err);
            throw err;
        }
    },

    // Find user for the Session (Deserialization)
    findById: async (id) => {
        try {
            const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
            return res.rows[0];
        } catch (err) {
            console.error("Database Error in findById:", err);
            throw err;
        }
    }
};

module.exports = User;