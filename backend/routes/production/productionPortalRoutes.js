const express = require('express');
const router = express.Router();
const productionPortalController = require('../../controllers/production/productionPortalController');
const authMiddleware = require('../../middleware/authMiddleware');
const diagnosticController = require('../../controllers/production/diagnosticController');

router.get('/root-cards', authMiddleware, productionPortalController.getRootCards);
router.get('/production-form/root-cards', authMiddleware, productionPortalController.getProductionFormRootCards);
router.get('/root-cards/:id', authMiddleware, productionPortalController.getRootCardById);
router.get('/stages', authMiddleware, productionPortalController.getProductionStages);
router.get('/employees', authMiddleware, productionPortalController.getEmployees);
router.get('/outsource-tasks', authMiddleware, productionPortalController.getOutsourceTasks);
router.put('/outsource-tasks/:stageId', authMiddleware, productionPortalController.updateOutsourceTaskStatus);
router.post('/manufacturing-stages', authMiddleware, productionPortalController.createManufacturingStages);
router.put('/manufacturing-stages/:id', authMiddleware, productionPortalController.updateManufacturingStage);

router.get('/debug/user-info', authMiddleware, diagnosticController.getUserInfo);
router.get('/debug/root-card/:id', authMiddleware, diagnosticController.debugRootCard);

module.exports = router;
