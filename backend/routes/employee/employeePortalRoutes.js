const express = require('express');
const router = express.Router();
const employeePortalController = require('../../controllers/employee/employeePortalController');
const authMiddleware = require('../../middleware/authMiddleware');

router.get('/departments', authMiddleware, employeePortalController.getAllDepartments);
router.get('/employees', authMiddleware, employeePortalController.getAllEmployees);
router.get('/departments/:departmentId/employees', authMiddleware, employeePortalController.getEmployeesByDepartment);
router.get('/stats/:employeeId', authMiddleware, employeePortalController.getEmployeeStats);
router.get('/tasks/:employeeId', authMiddleware, employeePortalController.getEmployeeTasks);
router.get('/attendance/:employeeId', authMiddleware, employeePortalController.getEmployeeAttendance);
router.get('/projects/:employeeId', authMiddleware, employeePortalController.getEmployeeProjects);
router.get('/alerts/:employeeId', authMiddleware, employeePortalController.getEmployeeAlerts);
router.get('/company-updates', authMiddleware, employeePortalController.getCompanyUpdates);

router.post('/assign-task', authMiddleware, employeePortalController.assignTaskToEmployee);
router.get('/assigned-tasks/:employeeId', authMiddleware, employeePortalController.getAssignedTasks);
router.get('/assigned-tasks-stats/:employeeId', authMiddleware, employeePortalController.getAssignedTasksStats);
router.put('/tasks/:taskId/status', authMiddleware, employeePortalController.updateTaskStatus);
router.delete('/tasks/:taskId', authMiddleware, employeePortalController.deleteAssignedTask);
router.delete('/worker-tasks/:taskId', authMiddleware, employeePortalController.deleteWorkerTask);

router.put('/profile/:employeeId', authMiddleware, employeePortalController.updateEmployeeProfile);
router.put('/change-password/:employeeId', authMiddleware, employeePortalController.changePassword);

module.exports = router;
