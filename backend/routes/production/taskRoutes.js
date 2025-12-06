const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const taskController = require('../../controllers/production/taskController');

router.use(authMiddleware);

router.get('/', taskController.getEmployeeTasks);
router.get('/statistics', taskController.getTaskStatistics);
router.get('/:id', taskController.getTaskById);
router.patch('/:id/status', taskController.updateTaskStatus);
router.post('/:id/logs', taskController.addTaskLog);

module.exports = router;
