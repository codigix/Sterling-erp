const express = require('express');
const trackingController = require('../../controllers/reports/trackingController');
const authMiddleware = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/project-milestone', trackingController.createProjectMilestone);
router.get('/project/:projectId/milestones', trackingController.getProjectMilestones);
router.patch('/milestone/:id/progress', trackingController.updateMilestoneProgress);
router.patch('/milestone/:id/status', trackingController.updateMilestoneStatus);
router.get('/project/:projectId/progress', trackingController.getProjectProgress);

router.post('/employee', trackingController.createEmployeeTracking);
router.get('/employee/:employeeId', trackingController.getEmployeeTracking);
router.get('/project/:projectId/team', trackingController.getProjectTeamTracking);
router.patch('/employee/:employeeId/project/:projectId/stats', trackingController.updateEmployeeTaskStats);
router.patch('/employee/:employeeId/project/:projectId/efficiency', trackingController.updateEmployeeEfficiency);
router.get('/employee/:employeeId/performance', trackingController.getEmployeePerformance);
router.get('/project/:projectId/team-performance', trackingController.getProjectTeamPerformance);

module.exports = router;
