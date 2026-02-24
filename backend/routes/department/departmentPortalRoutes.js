const express = require('express');
const departmentPortalController = require('../../controllers/department/departmentPortalController');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

const router = express.Router();

router.get('/role/:roleName', authMiddleware, departmentPortalController.getRoleByName);
router.get('/departments', authMiddleware, departmentPortalController.getDepartments);
router.get('/tasks/:roleId', authMiddleware, departmentPortalController.getTasksByRole);
router.get('/tasks/:taskId/detail', authMiddleware, departmentPortalController.getTaskById);
router.get('/role/:roleId/stats', authMiddleware, departmentPortalController.getRoleStats);

router.post('/tasks', authMiddleware, roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer', 'Engineering', 'Production', 'production_manager', 'Inventory', 'inventory_manager', 'Inventory Manager'), departmentPortalController.createTask);
router.patch('/tasks/:taskId', authMiddleware, roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer', 'Engineering', 'Production', 'production_manager', 'Inventory', 'inventory_manager', 'Inventory Manager'), departmentPortalController.updateTask);
router.delete('/tasks/:taskId', authMiddleware, roleMiddleware('Admin', 'Management', 'Design Engineer', 'design_engineer', 'design.engineer', 'Engineering', 'Production', 'production_manager', 'Inventory', 'inventory_manager', 'Inventory Manager'), departmentPortalController.deleteTask);

module.exports = router;
