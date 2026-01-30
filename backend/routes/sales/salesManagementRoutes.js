const express = require('express');
const router = express.Router();
const salesManagementController = require('../../controllers/sales/salesManagementController');
const protect = require('../../middleware/authMiddleware');

router.use(protect);

router.post('/', salesManagementController.createSalesOrder);
router.get('/', salesManagementController.getAllSalesOrders);
router.get('/next-so-number', salesManagementController.getNextSONumber);
router.get('/root-cards', salesManagementController.getRootCards);
router.get('/root-cards/:id', salesManagementController.getRootCardDetails);
router.get('/root-cards/:id/boms', salesManagementController.getBOMsByRootCard);
router.get('/approved-boms', salesManagementController.getApprovedBOMs);
router.patch('/:id/status', salesManagementController.updateStatus);
router.put('/:id', salesManagementController.updateSalesOrder);
router.delete('/:id', salesManagementController.deleteSalesOrder);

module.exports = router;
