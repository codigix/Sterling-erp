const express = require('express');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const salesController = require('../../controllers/sales/salesController');
const draftController = require('../../controllers/sales/draftController');
const employeeController = require('../../controllers/admin/employeeController');
const systemConfigController = require('../../controllers/admin/systemConfigController');
const salesOrderWorkflowRoutes = require('./salesOrderWorkflowRoutes');

const router = express.Router();

router.get('/employees', employeeController.getEmployees);
router.get('/config/all', systemConfigController.getAllConfig);
router.get('/config/:configType', systemConfigController.getConfigByType);

router.use(authMiddleware);
router.use(roleMiddleware('Admin', 'Management', 'Sales'));

router.get('/orders', salesController.getSalesOrders);
router.get('/orders/:id', salesController.getSalesOrderById);
router.post('/orders', salesController.createSalesOrder);
router.patch('/orders/:id/status', salesController.updateSalesOrderStatus);

router.get('/drafts/latest', draftController.getLatestDraft);
router.get('/drafts/:id', draftController.getDraftById);
router.post('/drafts', draftController.createDraft);
router.put('/drafts/:id', draftController.updateDraft);
router.delete('/drafts/:id', draftController.deleteDraft);

router.use('/workflow', salesOrderWorkflowRoutes);

module.exports = router;
