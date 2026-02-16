const express = require('express');
const productionPlanController = require('../../controllers/production/productionPlanController');
const authMiddleware = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', productionPlanController.createPlan);
router.get('/', productionPlanController.getAllPlans);
router.get('/stats', productionPlanController.getPlansStats);
router.post('/:id/stages', productionPlanController.createPlanStages);
router.put('/:id/stages/:stageId', productionPlanController.updatePlanStage);
router.get('/:id/with-stages', productionPlanController.getPlanWithStages);
router.get('/:id', productionPlanController.getPlan);
router.put('/:id', productionPlanController.updatePlan);
router.patch('/:id/status', productionPlanController.updatePlanStatus);
router.delete('/:id', productionPlanController.deletePlan);
router.post('/:id/generate-work-orders', productionPlanController.generateWorkOrders);
router.post('/:id/send-material-request', productionPlanController.sendMaterialRequest);

module.exports = router;
