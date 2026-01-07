const express = require('express');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const salesController = require('../../controllers/sales/salesController');
const draftController = require('../../controllers/sales/draftController');
const employeeController = require('../../controllers/admin/employeeController');
const systemConfigController = require('../../controllers/admin/systemConfigController');
const salesOrderWorkflowRoutes = require('./salesOrderWorkflowRoutes');
const materialRequirementsRoutes = require('./materialRequirementsRoutes');

const router = express.Router();

router.get('/employees', employeeController.getEmployees);
router.get('/config/all', systemConfigController.getAllConfig);
router.get('/config/:configType', systemConfigController.getConfigByType);

router.use(authMiddleware);
router.use(roleMiddleware('Admin', 'Management', 'Sales', 'Production', 'Design Engineer'));

router.get('/orders/assigned', salesController.getAssignedOrders);
router.get('/orders', salesController.getSalesOrders);
router.get('/orders/:id', salesController.getSalesOrderById);
router.post('/orders', salesController.createSalesOrder);
router.put('/orders/:id', salesController.updateSalesOrder);
router.patch('/orders/:id/status', salesController.updateSalesOrderStatus);
router.delete('/orders/:id', salesController.deleteSalesOrder);
router.post('/orders/:id/assign', salesController.assignSalesOrder);

router.get('/drafts/latest', draftController.getLatestDraft);
router.get('/drafts/:id', draftController.getDraftById);
router.post('/drafts', draftController.createDraft);
router.put('/drafts/:id', draftController.updateDraft);
router.delete('/drafts/:id', draftController.deleteDraft);

router.post('/orders/:salesOrderId/design-details', salesController.saveDesignDetails);
router.post('/orders/:salesOrderId/send-to-inventory', salesController.sendToInventory);
router.get('/orders/:salesOrderId/design-details', salesController.getDesignDetails);

router.use('/workflow', salesOrderWorkflowRoutes);
router.use('/requirements', materialRequirementsRoutes);

module.exports = router;
