const Inventory = require('../models/Inventory');

const inventoryController = {
    async index(req, res) {
        try {
            const items = await Inventory.getAll();
            res.render('inventory/index', { title: 'Inventory', items });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }
};

module.exports = inventoryController;