const express = require("express");
const router = express.Router();
const workOrderController = require("../../controllers/production/workOrderController");
const authMiddleware = require("../../middleware/authMiddleware");

router.get("/", authMiddleware, workOrderController.getAllWorkOrders);
router.post("/", authMiddleware, workOrderController.createWorkOrder);
router.get("/job-cards", authMiddleware, workOrderController.getAllJobCards);
router.post("/operations", authMiddleware, workOrderController.createOperation);
router.put("/operations/:id", authMiddleware, workOrderController.updateOperation);
router.delete("/operations/:id", authMiddleware, workOrderController.deleteOperation);

// Production Entry Routes
router.post("/operations/:id/start", authMiddleware, workOrderController.startOperation);
router.get("/operations/:id/details", authMiddleware, workOrderController.getOperationDetails);
router.post("/operations/:id/time-logs", authMiddleware, workOrderController.addTimeLog);
router.post("/operations/:id/quality-entries", authMiddleware, workOrderController.addQualityEntry);
router.post("/operations/:id/downtime-logs", authMiddleware, workOrderController.addDowntimeLog);
router.post("/operations/:id/complete-entry", authMiddleware, workOrderController.completeProductionEntry);

router.get("/:id", authMiddleware, workOrderController.getWorkOrderById);
router.put("/:id", authMiddleware, workOrderController.updateWorkOrder);
router.delete("/:id", authMiddleware, workOrderController.deleteWorkOrder);

module.exports = router;
