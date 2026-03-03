const express = require('express');
const expressRouter = express.Router();
// Wrapper: (router, urlPrefix, namePrefix)
// urlPrefix is empty because these live at the root '/'
const Route = require('../utils/RouteWrapper')(expressRouter, '', 'public');

/**
 * PUBLIC NAMESPACE: 'public.*'
 */
Route.get('/', (req, res) => res.render('index', { title: 'Didulis Coffee | Fresh Roast' }))
     .name('home');

Route.get('/about', (req, res) => res.render('about'))
     .name('about');

Route.get('/contact', (req, res) => res.render('contact'))
     .name('contact');

module.exports = expressRouter;