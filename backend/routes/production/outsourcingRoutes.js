const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const outsourcingController = require('../../controllers/production/outsourcingController');

router.use(authMiddleware);

router.get(
  '/tasks',
  roleMiddleware('Admin', 'Management', 'Production'),
  outsourcingController.getOutsourcingTasks
);

router.get(
  '/tasks/:id',
  roleMiddleware('Admin', 'Management', 'Production'),
  outsourcingController.getOutsourcingTaskById
);

router.get(
  '/tasks/production-stage/:stageId',
  roleMiddleware('Admin', 'Management', 'Production'),
  outsourcingController.getOutsourcingTaskByProductionStage
);

router.post(
  '/tasks/:taskId/select-vendor',
  roleMiddleware('Admin', 'Management', 'Production'),
  outsourcingController.selectVendor
);

router.get(
  '/project/:projectId/materials',
  roleMiddleware('Admin', 'Management', 'Production'),
  outsourcingController.getProjectMaterials
);

router.get(
  '/work-order/:workOrderId/materials',
  roleMiddleware('Admin', 'Management', 'Production'),
  outsourcingController.getWorkOrderMaterials
);

router.post(
  '/job-card/:operationId/outward-challan',
  roleMiddleware('Admin', 'Management', 'Production'),
  outsourcingController.createOutwardChallanFromJobCard
);

router.post(
  '/job-card/:operationId/inward-challan',
  roleMiddleware('Admin', 'Management', 'Production'),
  outsourcingController.createInwardChallanFromJobCard
);

router.post(
  '/tasks/:taskId/outward-challan',
  roleMiddleware('Admin', 'Management', 'Production'),
  outsourcingController.createOutwardChallan
);

router.get(
  '/outward-challan/:challanId',
  roleMiddleware('Admin', 'Management', 'Production'),
  outsourcingController.getOutwardChallanDetails
);

router.post(
  '/outward-challan/:outwardChallanId/inward-challan',
  roleMiddleware('Admin', 'Management', 'Production'),
  outsourcingController.createInwardChallan
);

router.get(
  '/inward-challan/:challanId',
  roleMiddleware('Admin', 'Management', 'Production'),
  outsourcingController.getInwardChallanDetails
);

router.post(
  '/tasks/:taskId/complete',
  roleMiddleware('Admin', 'Management', 'Production'),
  outsourcingController.completeOutsourcingTask
);

module.exports = router;
