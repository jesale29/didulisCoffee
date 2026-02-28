// server.js
const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // To parse form data

// Routes
app.use('/', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));