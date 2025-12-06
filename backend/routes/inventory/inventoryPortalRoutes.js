const express = require('express');
const router = express.Router();
const inventoryPortalController = require('../../controllers/inventory/inventoryPortalController');
const authMiddleware = require('../../middleware/authMiddleware');

router.get('/stock', authMiddleware, inventoryPortalController.getInventoryStock);
router.get('/issuances', authMiddleware, inventoryPortalController.getInventoryIssuances);

module.exports = router;
