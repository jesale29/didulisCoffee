// 1. We MUST include 'types' in the destructuring here
const { Pool, types } = require('pg');
require('dotenv').config(); 

// Check if the connection string actually exists
if (!process.env.DATABASE_URL) {
    console.error('❌ CRITICAL ERROR: DATABASE_URL is not defined in the .env file.');
    process.exit(1); 
}

// 2. Now 'types' is defined and can be used to fix the toFixed error
types.setTypeParser(1700, function(val) {
    return val === null ? null : parseFloat(val);
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000, 
    idleTimeoutMillis: 30000
});

// Test the connection immediately
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Postgres Connection Error:', err.message);
        console.error('💡 Peer Tip: Check if your IP is whitelisted or if the password contains special characters.');
    } else {
        console.log('✅ Postgres Connected Successfully');
        release(); 
    }
});

module.exports = pool;