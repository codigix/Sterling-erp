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
router.get("/:id", authMiddleware, workOrderController.getWorkOrderById);
router.put("/:id", authMiddleware, workOrderController.updateWorkOrder);
router.delete("/:id", authMiddleware, workOrderController.deleteWorkOrder);

module.exports = router;
