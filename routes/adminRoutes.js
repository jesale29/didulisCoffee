const express = require('express');
const expressRouter = express.Router();
// Wrapper: (router, urlPrefix, namePrefix)
const Route = require('../utils/RouteWrapper')(expressRouter, '/admin', 'admin');

const UserController = require('../controllers/UserController');
const inventoryRoutes = require('./inventoryRoutes');
const orderRoutes = require('./orderRoutes');
const AdminController = require('../controllers/AdminController');

/**
 * ADMIN NAMESPACE: 'admin.*'
 */
Route.get('/dashboard', (req, res) => AdminController.dashboard(req, res)).name('dashboard');

// Users: result is 'admin.users.index'
Route.get('/users', (req, res) => UserController.index(req, res)).name('users.index');
Route.post('/users/:id/archive', (req, res) => UserController.archive(req, res)).name('users.archive');

/**
 * NESTED PRONGS
 * We mount these and let the sub-files handle their own resource naming
 */
expressRouter.use('/inventory', inventoryRoutes);
expressRouter.use('/orders', orderRoutes);

module.exports = expressRouter;