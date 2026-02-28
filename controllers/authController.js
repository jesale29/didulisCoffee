// controllers/authController.js
const supabase = require('../config/supabaseClient');

// Render the Login/Signup Page
exports.renderAuthPage = (req, res) => {
    res.render('auth');
};

// Handle User Registration
exports.signUp = async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) return res.status(400).send(error.message);
    res.send('Check your email for the confirmation link!');
};

// Handle User Login
exports.signIn = async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) return res.status(400).send(error.message);
    
    // In a real app, you would set a cookie or session here.
    // Supabase client stores the session automatically in memory.
    res.redirect('/dashboard');
};

// Handle Sign Out
exports.signOut = async (req, res) => {
    const { error } = await supabase.auth.signOut();
    if (error) return res.status(500).send(error.message);
    res.redirect('/auth');
};