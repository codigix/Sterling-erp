const express = require('express');
const router = express.Router();
const employeePortalController = require('../../controllers/employee/employeePortalController');
const authMiddleware = require('../../middleware/authMiddleware');

router.get('/departments', authMiddleware, employeePortalController.getAllDepartments);
router.get('/departments/:departmentId/employees', authMiddleware, employeePortalController.getEmployeesByDepartment);
router.get('/stats/:employeeId', authMiddleware, employeePortalController.getEmployeeStats);
router.get('/tasks/:employeeId', authMiddleware, employeePortalController.getEmployeeTasks);
router.get('/attendance/:employeeId', authMiddleware, employeePortalController.getEmployeeAttendance);
router.get('/projects/:employeeId', authMiddleware, employeePortalController.getEmployeeProjects);
router.get('/alerts/:employeeId', authMiddleware, employeePortalController.getEmployeeAlerts);
router.get('/company-updates', authMiddleware, employeePortalController.getCompanyUpdates);

module.exports = router;
