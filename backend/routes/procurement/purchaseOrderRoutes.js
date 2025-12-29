const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const purchaseOrderController = require('../../controllers/procurement/purchaseOrderController');

router.use(authMiddleware);

router.get('/quotes/received', roleMiddleware('Admin', 'Procurement Manager'), purchaseOrderController.getReceivedQuotes);
router.get('/', roleMiddleware('Admin', 'Procurement Manager'), purchaseOrderController.getPurchaseOrders);
router.post('/', roleMiddleware('Admin', 'Procurement Manager'), purchaseOrderController.createPurchaseOrder);
router.get('/stats/all', roleMiddleware('Admin', 'Procurement Manager'), purchaseOrderController.getPurchaseOrderStats);
router.get('/:id', roleMiddleware('Admin', 'Procurement Manager'), purchaseOrderController.getPurchaseOrderById);
router.get('/:id/communications', roleMiddleware('Admin', 'Procurement Manager'), purchaseOrderController.getPurchaseOrderCommunications);
router.get('/attachments/:id/download', roleMiddleware('Admin', 'Procurement Manager'), purchaseOrderController.downloadAttachment);
router.patch('/:id/status', roleMiddleware('Admin', 'Procurement Manager'), purchaseOrderController.updatePurchaseOrderStatus);
router.post('/:id/email', roleMiddleware('Admin', 'Procurement Manager'), purchaseOrderController.sendPurchaseOrderEmail);
router.delete('/:id', roleMiddleware('Admin', 'Procurement Manager'), purchaseOrderController.deletePurchaseOrder);

module.exports = router;
