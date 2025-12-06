const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const productionController = require('../../controllers/production/productionController');

router.use(authMiddleware);

router.get('/root-cards', roleMiddleware('Admin', 'Management', 'Production'), productionController.getRootCards);
router.post('/root-cards', roleMiddleware('Admin', 'Management'), productionController.createRootCard);
router.get('/root-cards/:id', roleMiddleware('Admin', 'Management', 'Production'), productionController.getRootCardById);
router.put('/root-cards/:id', roleMiddleware('Admin', 'Management'), productionController.updateRootCard);
router.delete('/root-cards/:id', roleMiddleware('Admin', 'Management'), productionController.deleteRootCard);

router.get('/manufacturing-stages', roleMiddleware('Admin', 'Management', 'Production'), productionController.getManufacturingStages);
router.post('/manufacturing-stages', roleMiddleware('Admin', 'Management'), productionController.createManufacturingStage);
router.put('/manufacturing-stages/:id', roleMiddleware('Admin', 'Management'), productionController.updateManufacturingStage);
router.patch('/manufacturing-stages/:id/status', roleMiddleware('Admin', 'Management', 'Production'), productionController.updateStageStatus);

router.get('/worker-tasks/:stageId', roleMiddleware('Admin', 'Management', 'Production'), productionController.getWorkerTasks);
router.post('/worker-tasks', roleMiddleware('Admin', 'Management'), productionController.createWorkerTask);
router.patch('/worker-tasks/:id/status', roleMiddleware('Admin', 'Management', 'Production'), productionController.updateTaskStatus);

router.get('/statistics', roleMiddleware('Admin', 'Management', 'Production'), productionController.getProductionStatistics);

module.exports = router;
