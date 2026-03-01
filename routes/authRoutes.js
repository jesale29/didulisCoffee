const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Line 6 was likely here:
router.get('/login', authController.getLogin); 

router.post('/login', authController.postLogin);

router.get('/logout', authController.logout);

module.exports = router;