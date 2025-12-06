const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const purchaseOrderController = require('../../controllers/procurement/purchaseOrderController');

router.use(authMiddleware);

router.get('/', roleMiddleware('Admin', 'Procurement Manager'), purchaseOrderController.getPurchaseOrders);
router.post('/', roleMiddleware('Admin', 'Procurement Manager'), purchaseOrderController.createPurchaseOrder);
router.get('/:id', roleMiddleware('Admin', 'Procurement Manager'), purchaseOrderController.getPurchaseOrderById);
router.patch('/:id/status', roleMiddleware('Admin', 'Procurement Manager'), purchaseOrderController.updatePurchaseOrderStatus);
router.delete('/:id', roleMiddleware('Admin', 'Procurement Manager'), purchaseOrderController.deletePurchaseOrder);
router.get('/stats/all', roleMiddleware('Admin', 'Procurement Manager'), purchaseOrderController.getPurchaseOrderStats);

module.exports = router;
