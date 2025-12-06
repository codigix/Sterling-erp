const express = require('express');
const productionStageTaskController = require('../../controllers/production/productionStageTaskController');
const authMiddleware = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', productionStageTaskController.createTask);
router.get('/employee/:employeeId/stats', productionStageTaskController.getEmployeeStats);
router.get('/employee/:employeeId', productionStageTaskController.getEmployeeTasks);
router.get('/stage/:productionStageId/stats', productionStageTaskController.getProductionStageStats);
router.get('/', productionStageTaskController.getAllTasks);
router.get('/:id', productionStageTaskController.getTask);
router.patch('/:id/status', productionStageTaskController.updateTaskStatus);
router.patch('/:id/pause', productionStageTaskController.pauseTask);

module.exports = router;
