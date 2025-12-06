const express = require('express');
const productionPlanController = require('../../controllers/production/productionPlanController');
const authMiddleware = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', productionPlanController.createPlan);
router.get('/', productionPlanController.getAllPlans);
router.get('/stats', productionPlanController.getPlansStats);
router.get('/:id', productionPlanController.getPlan);
router.put('/:id', productionPlanController.updatePlan);
router.patch('/:id/status', productionPlanController.updatePlanStatus);

module.exports = router;
