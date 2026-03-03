const express = require('express');
const expressRouter = express.Router();
const InventoryController = require('../controllers/InventoryController');

/**
 * We initialize the wrapper WITHOUT a prefix here. 
 * The logic is: if this file is required by adminRoutes, 
 * we will manually set the 'admin.inventory' namespace.
 */
module.exports = (urlPrefix, namePrefix) => {
    const Route = require('../utils/RouteWrapper')(expressRouter, urlPrefix, namePrefix);

    Route.get('/', (req, res) => InventoryController.index(req, res)).name('index');
    Route.get('/:id', (req, res) => InventoryController.show(req, res)).name('show');

    return expressRouter;
};