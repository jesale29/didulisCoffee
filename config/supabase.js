// config/supabase.js
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Ensure dotenv is initialized exactly where the file is needed
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('Checking Environment Variables...');
console.log('URL Found:', process.env.SUPABASE_URL ? 'Yes' : 'No');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    throw new Error('Missing Supabase Environment Variables in .env file. Please check your .env file in the root folder.');
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = supabase;