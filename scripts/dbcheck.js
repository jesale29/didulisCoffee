require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

client.connect()
    .then(() => {
        console.log("✅ Connection Successful!");
        process.exit();
    })
    .catch(err => {
        console.error("❌ Connection Failed!");
        console.error("Error Code:", err.code);
        console.error("Message:", err.message);
        process.exit();
    });