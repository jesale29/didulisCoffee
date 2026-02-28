// config/supabaseClient.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Exporting a singleton instance of the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;