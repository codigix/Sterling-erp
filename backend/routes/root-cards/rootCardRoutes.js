const express = require('express');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const rootCardController = require('../../controllers/root-cards/rootCardController');
const productionController = require('../../controllers/production/productionController');
const designEngineeringController = require('../../controllers/root-cards/designEngineeringController');
const draftController = require('../../controllers/root-cards/draftController');
const employeeController = require('../../controllers/admin/employeeController');
const systemConfigController = require('../../controllers/admin/systemConfigController');
const rootCardWorkflowRoutes = require('./rootCardWorkflowRoutes');
const materialRequirementsRoutes = require('./materialRequirementsRoutes');

const router = express.Router();

router.get('/employees', employeeController.getEmployees);
router.get('/config/all', systemConfigController.getAllConfig);
router.get('/config/:configType', systemConfigController.getConfigByType);

router.use(authMiddleware);
router.use(roleMiddleware('Admin', 'Management', 'Sales', 'Production', 'Design Engineer', 'design_engineer', 'design.engineer', 'Engineering', 'engineering', 'Inventory', 'inventory_manager', 'Inventory Manager', 'Procurement', 'Procurement Manager'));

router.get('/assigned', rootCardController.getAssignedRootCards);
router.get('/by-department/:department', rootCardController.getRootCardsByDepartment);
router.get('/', rootCardController.getRootCards);

// Move fixed paths ABOVE parameterized routes
router.use('/requirements', materialRequirementsRoutes);
router.use('/workflow', rootCardWorkflowRoutes);

router.get('/drafts/latest', draftController.getLatestDraft);
router.get('/drafts/:id', draftController.getDraftById);
router.post('/drafts', draftController.createDraft);
router.put('/drafts/:id', draftController.updateDraft);
router.delete('/drafts/:id', draftController.deleteDraft);

router.get('/:id', rootCardController.getRootCardById);
router.post('/', rootCardController.createRootCard);
router.put('/:id', rootCardController.updateRootCard);
router.patch('/:id/status', rootCardController.updateRootCardStatus);
router.delete('/:id', rootCardController.deleteRootCard);
router.post('/:id/assign', rootCardController.assignRootCard);

router.post('/:rootCardId/design-details', designEngineeringController.createOrUpdate);
router.post('/:rootCardId/workflow-tasks', roleMiddleware('Admin', 'Management', 'Production', 'production', 'Production Manager', 'production_manager', 'Design Engineer', 'design_engineer', 'design.engineer', 'Engineering', 'engineering'), productionController.createWorkflowBasedTasks);
router.post('/:rootCardId/production-workflow-tasks', roleMiddleware('Admin', 'Management', 'Production', 'production', 'Production Manager'), productionController.createProductionWorkflowTasks);
router.post('/:rootCardId/send-to-inventory', rootCardController.sendToInventory);
router.post('/:rootCardId/send-to-design-engineering', rootCardController.sendToDesignEngineering);
router.get('/:rootCardId/design-details', designEngineeringController.getDesignEngineering);

module.exports = router;
