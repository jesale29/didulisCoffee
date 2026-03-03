const express = require('express');
const expressRouter = express.Router();
const AuthController = require('../controllers/AuthController');

// Ensure you are passing 'auth' as the third argument (namePrefix)
const Route = require('../utils/RouteWrapper')(expressRouter, '', 'auth');

/**
 * Results in 'auth.login' and 'auth.logout'
 */
Route.get('/login', (req, res) => AuthController.getLogin(req, res)).name('login');
Route.post('/login', (req, res) => AuthController.postLogin(req, res)).name('login.post');
Route.get('/logout', (req, res) => AuthController.logout(req, res)).name('logout');

module.exports = expressRouter;