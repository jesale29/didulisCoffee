const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { ensureAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Protect all routes below this line
router.use(ensureAuthenticated);

// 1. DISPLAY ROUTES (GET)
router.get('/', inventoryController.index);
router.get('/create', inventoryController.create);
router.get('/:id/edit', inventoryController.edit);

// 2. ACTION ROUTES (POST)
// We removed the duplicate lines. These versions handle the images AND the data.
router.post('/', upload.single('image'), inventoryController.store);
router.post('/:id', upload.single('image'), inventoryController.update);

module.exports = router;