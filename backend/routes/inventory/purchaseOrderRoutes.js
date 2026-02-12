const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const purchaseOrderController = require('../../controllers/procurement/purchaseOrderController');

router.use(authMiddleware);

router.get('/quotes/received', roleMiddleware('Admin', 'Procurement', 'Inventory', 'inventory_manager', 'Inventory Manager'), purchaseOrderController.getReceivedQuotes);
router.get('/', roleMiddleware('Admin', 'Procurement', 'Inventory', 'inventory_manager', 'Inventory Manager'), purchaseOrderController.getPurchaseOrders);
router.post('/', roleMiddleware('Admin', 'Procurement', 'Inventory', 'inventory_manager', 'Inventory Manager'), purchaseOrderController.createPurchaseOrder);
router.get('/stats/summary', roleMiddleware('Admin', 'Procurement', 'Inventory', 'inventory_manager', 'Inventory Manager'), purchaseOrderController.getPurchaseOrderStats);
router.get('/stats/all', roleMiddleware('Admin', 'Procurement', 'Inventory', 'inventory_manager', 'Inventory Manager'), purchaseOrderController.getPurchaseOrderStats);
router.get('/:id', roleMiddleware('Admin', 'Procurement', 'Inventory', 'inventory_manager', 'Inventory Manager'), purchaseOrderController.getPurchaseOrderById);
router.put('/:id', roleMiddleware('Admin', 'Procurement', 'Inventory', 'inventory_manager', 'Inventory Manager'), purchaseOrderController.updatePurchaseOrder);
router.get('/:id/communications', roleMiddleware('Admin', 'Procurement', 'Inventory', 'inventory_manager', 'Inventory Manager'), purchaseOrderController.getPurchaseOrderCommunications);
router.get('/attachments/:id/download', roleMiddleware('Admin', 'Procurement', 'Inventory', 'inventory_manager', 'Inventory Manager'), purchaseOrderController.downloadAttachment);
router.patch('/:id/status', roleMiddleware('Admin', 'Procurement', 'Inventory', 'inventory_manager', 'Inventory Manager'), purchaseOrderController.updatePurchaseOrderStatus);
router.post('/:id/email', roleMiddleware('Admin', 'Procurement', 'Inventory', 'inventory_manager', 'Inventory Manager'), purchaseOrderController.sendPurchaseOrderEmail);
router.delete('/:id', roleMiddleware('Admin', 'Procurement', 'Inventory', 'inventory_manager', 'Inventory Manager'), purchaseOrderController.deletePurchaseOrder);

module.exports = router;
