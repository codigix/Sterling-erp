const express = require('express');
const router = express.Router();
const grnController = require('../../controllers/inventory/grnController');
const authMiddleware = require('../../middleware/authMiddleware');

router.get('/', authMiddleware, grnController.getAllGRNs);
router.post('/', authMiddleware, grnController.createGRN);
router.get('/:id', authMiddleware, grnController.getGRNById);
router.patch('/:id/status', authMiddleware, grnController.updateGRNStatus);
router.post('/:id/approve', authMiddleware, grnController.approveGRN);
router.post('/:id/add-to-stock', authMiddleware, grnController.addToStock);

module.exports = router;
