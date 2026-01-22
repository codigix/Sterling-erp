const express = require('express');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const rootCardController = require('../../controllers/root-cards/rootCardController');
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
router.use(roleMiddleware('Admin', 'Management', 'Sales', 'Production', 'Design Engineer'));

router.get('/assigned', rootCardController.getAssignedRootCards);
router.get('/', rootCardController.getRootCards);
router.get('/:id', rootCardController.getRootCardById);
router.post('/', rootCardController.createRootCard);
router.put('/:id', rootCardController.updateRootCard);
router.patch('/:id/status', rootCardController.updateRootCardStatus);
router.delete('/:id', rootCardController.deleteRootCard);
router.post('/:id/assign', rootCardController.assignRootCard);

router.get('/drafts/latest', draftController.getLatestDraft);
router.get('/drafts/:id', draftController.getDraftById);
router.post('/drafts', draftController.createDraft);
router.put('/drafts/:id', draftController.updateDraft);
router.delete('/drafts/:id', draftController.deleteDraft);

router.post('/:rootCardId/design-details', rootCardController.saveDesignDetails);
router.post('/:rootCardId/send-to-inventory', rootCardController.sendToInventory);
router.get('/:rootCardId/design-details', rootCardController.getDesignDetails);

router.use('/workflow', rootCardWorkflowRoutes);
router.use('/requirements', materialRequirementsRoutes);

module.exports = router;
