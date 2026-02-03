const express = require("express");
const router = express.Router();
const workOrderController = require("../../controllers/production/workOrderController");
const authMiddleware = require("../../middleware/authMiddleware");

router.get("/", authMiddleware, workOrderController.getAllWorkOrders);
router.get("/:id", authMiddleware, workOrderController.getWorkOrderById);
router.put("/:id", authMiddleware, workOrderController.updateWorkOrder);
router.delete("/:id", authMiddleware, workOrderController.deleteWorkOrder);

module.exports = router;
