const express = require('express');
const router = express.Router();
const PublicController = require('../controllers/PublicController');

// Define the public paths
router.get('/', PublicController.getHome);
router.get('/about', PublicController.getAbout);
router.get('/contact', PublicController.getContact);

module.exports = router;