const Inventory = require('../models/inventoryModel');

const inventoryController = {
    // Display the inventory list page
    async index(req, res) {
        try {
            const products = await Inventory.getAll();
            res.render('inventory', { 
                title: 'Inventory Management',
                products: products 
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Error loading inventory.");
        }
    },

    // Handle form submission for a new product
    async addProduct(req, res) {
        const { name, sku, price, stock_quantity, description } = req.body;
        
        try {
            await Inventory.createProduct({
                name,
                sku,
                price: parseFloat(price),
                stock_quantity: parseInt(stock_quantity),
                description
            });
            
            // Redirect back to the list to see the new item
            res.redirect('/inventory');
        } catch (err) {
            console.error(err);
            res.status(400).send("Error adding product: " + err.message);
        }
    }
};

module.exports = inventoryController;