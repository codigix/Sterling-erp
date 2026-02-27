const express = require('express');
const router = express.Router();
const rootCardInventoryTaskController = require('../../controllers/inventory/rootCardInventoryTaskController');
const authMiddleware = require('../../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/root-card/:rootCardId/tasks', rootCardInventoryTaskController.getRootCardInventoryTasks);
router.get('/root-card/:rootCardId/task/:taskId', rootCardInventoryTaskController.getTaskById);
router.get('/root-card/:rootCardId/progress', rootCardInventoryTaskController.getWorkflowProgress);

router.get('/mr/:mrId/tasks', rootCardInventoryTaskController.getMRInventoryTasks);
router.get('/mr/:mrId/progress', rootCardInventoryTaskController.getMRWorkflowProgress);
router.post('/mr/:mrId/initialize', rootCardInventoryTaskController.initializeMRWorkflow);

router.patch('/root-card/:rootCardId/task/:taskId/complete', rootCardInventoryTaskController.completeTask);
router.patch('/root-card/:rootCardId/task/:taskId/status', rootCardInventoryTaskController.updateTaskStatus);
router.patch('/root-card/:rootCardId/task/:taskId/link-reference', rootCardInventoryTaskController.linkReferenceToTask);

module.exports = router;
