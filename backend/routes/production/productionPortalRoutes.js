const express = require('express');
const router = express.Router();
const productionPortalController = require('../../controllers/production/productionPortalController');
const authMiddleware = require('../../middleware/authMiddleware');

router.get('/root-cards', authMiddleware, productionPortalController.getRootCards);
router.get('/stages', authMiddleware, productionPortalController.getProductionStages);

module.exports = router;
