const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

// Import controllers
const userController = require('../../controllers/admin/userController');
const roleController = require('../../controllers/admin/roleController');
const reportsController = require('../../controllers/admin/reportsController');
const auditController = require('../../controllers/admin/auditController');
const dashboardController = require('../../controllers/admin/dashboardController');
const employeeController = require('../../controllers/admin/employeeController');

// All admin routes require authentication and Admin role
router.use(authMiddleware);
router.use(roleMiddleware('Admin'));

// User management routes
router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);
router.put('/users/:id/password', userController.changePassword);

// Role management routes
router.get('/roles', roleController.getRoles);
router.get('/roles/:id', roleController.getRoleById);
router.post('/roles', roleController.createRole);
router.put('/roles/:id', roleController.updateRole);
router.patch('/roles/:id/status', roleController.setRoleStatus);
router.delete('/roles/:id', roleController.deleteRole);

// Reports routes
router.get('/stats', reportsController.getSystemStats);
router.get('/reports/users', reportsController.generateUserReport);
router.get('/reports/projects', reportsController.generateProjectReport);

// Audit logs routes
router.get('/audit-logs', auditController.getAuditLogs);
router.get('/audit-logs/stats', auditController.getAuditStats);
router.get('/audit-logs/:id', auditController.getAuditLogById);

// Dashboard routes
router.get('/kpis', dashboardController.getKPIs);
router.get('/projects', dashboardController.getProjects);
router.get('/departments', dashboardController.getDepartments);
router.get('/vendors', dashboardController.getVendors);
router.get('/materials', dashboardController.getMaterials);
router.get('/production', dashboardController.getProduction);
router.get('/resources', dashboardController.getResources);

// Employee management routes
router.get('/employee-list', employeeController.getEmployees);
router.get('/employee-list/:id', employeeController.getEmployee);
router.post('/employee-list', employeeController.createEmployee);
router.put('/employee-list/:id', employeeController.updateEmployee);
router.delete('/employee-list/:id', employeeController.deleteEmployee);

// Workflow task generation routes
const productionController = require('../../controllers/production/productionController');
router.post('/generate-workflow-tasks/:rootCardId', productionController.createWorkflowBasedTasks);

module.exports = router;