const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const departmentPortalController = require('../../controllers/department/departmentPortalController');

router.use(authMiddleware);

router.get('/tasks/:roleId', departmentPortalController.getDepartmentTasks);
router.post('/tasks', departmentPortalController.createDepartmentTask);
router.get('/tasks/detail/:taskId', departmentPortalController.getDepartmentTaskById);
router.patch('/tasks/:taskId', departmentPortalController.updateDepartmentTask);
router.delete('/tasks/:taskId', departmentPortalController.deleteDepartmentTask);
router.get('/stats/:roleId', departmentPortalController.getDepartmentTaskStats);
router.get('/role/:roleName', departmentPortalController.getRoleIdByName);

module.exports = router;
