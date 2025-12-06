const express = require('express');
const router = express.Router();
const procurementPortalController = require('../../controllers/procurement/procurementPortalController');
const authMiddleware = require('../../middleware/authMiddleware');

router.get('/purchase-requests', authMiddleware, procurementPortalController.getPurchaseRequests);
router.get('/purchase-orders', authMiddleware, procurementPortalController.getPurchaseOrders);
router.get('/quotes', authMiddleware, procurementPortalController.getQuotes);

module.exports = router;
