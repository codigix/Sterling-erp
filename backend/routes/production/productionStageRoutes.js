const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const productionStageController = require('../../controllers/production/productionStageController');

router.use(authMiddleware);

router.post('/', productionStageController.createProductionStage);

router.get('/', productionStageController.getAllProductionStages);

router.get('/plan/:productionPlanId', productionStageController.getProductionStagesByPlan);

router.get('/:id', productionStageController.getProductionStage);

router.put('/:id', productionStageController.updateProductionStage);

router.put('/:id/status', productionStageController.updateProductionStageStatus);

router.delete('/:id', productionStageController.deleteProductionStage);

module.exports = router;
