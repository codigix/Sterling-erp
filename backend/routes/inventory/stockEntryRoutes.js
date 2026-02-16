const express = require('express');
const router = express.Router();
const stockEntryController = require('../../controllers/inventory/stockEntryController');
const authMiddleware = require('../../middleware/authMiddleware');

router.post('/', authMiddleware, stockEntryController.createStockEntry);
router.get('/', authMiddleware, stockEntryController.getAllStockEntries);
router.get('/:id', authMiddleware, stockEntryController.getStockEntryById);

module.exports = router;
