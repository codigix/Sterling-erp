const express = require('express');
const router = express.Router();
const projectInventoryTaskController = require('../../controllers/inventory/projectInventoryTaskController');
const authMiddleware = require('../../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/project/:projectId/tasks', projectInventoryTaskController.getProjectInventoryTasks);
router.get('/project/:projectId/task/:taskId', projectInventoryTaskController.getTaskById);
router.get('/project/:projectId/progress', projectInventoryTaskController.getWorkflowProgress);

router.patch('/project/:projectId/task/:taskId/complete', projectInventoryTaskController.completeTask);
router.patch('/project/:projectId/task/:taskId/status', projectInventoryTaskController.updateTaskStatus);
router.patch('/project/:projectId/task/:taskId/link-reference', projectInventoryTaskController.linkReferenceToTask);

module.exports = router;
