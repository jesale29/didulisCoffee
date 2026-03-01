const User = require('../models/User');
const path = require('path');

// Logic to create the first admin
async function createAdmin() {
    const adminData = {
        name: 'Admin User',
        email: 'admin@didulis.coffee', // Change this to your preferred email
        password: 'Admin123!'    // Change this to a secure password
    };

    console.log('--- Didulis Coffee Admin Setup ---');
    
    try {
        // Check if user already exists
        const existingUser = await User.findByEmail(adminData.email);
        
        if (existingUser) {
            console.log('Error: A user with this email already exists.');
            process.exit(0);
        }

        // Create the user
        const newUser = await User.create(adminData);
        
        console.log('Success! Admin user created.');
        console.log(`ID: ${newUser.id}`);
        console.log(`Email: ${newUser.email}`);
        
    } catch (error) {
        console.error('Failed to create admin:', error.message);
    } finally {
        process.exit();
    }
}

createAdmin();