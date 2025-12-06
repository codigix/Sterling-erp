const express = require('express');
const router = express.Router();
const salesOrderWorkflowController = require('../../controllers/sales/salesOrderWorkflowController');
const authMiddleware = require('../../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/sales-orders/documents'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Initialize workflow
router.post('/initialize', authMiddleware, salesOrderWorkflowController.initializeWorkflow);

// Get workflow steps
router.get('/:salesOrderId/steps', authMiddleware, salesOrderWorkflowController.getWorkflowSteps);

// Assign employee to step
router.post('/steps/assign', authMiddleware, salesOrderWorkflowController.assignEmployeeToStep);

// Update step status
router.put('/steps/:stepId/status', authMiddleware, salesOrderWorkflowController.updateStepStatus);

// Upload documents for a step
router.post('/steps/:stepId/upload', authMiddleware, upload.array('files'), salesOrderWorkflowController.uploadStepDocuments);

// Get workflow details with history
router.get('/:salesOrderId/details', authMiddleware, salesOrderWorkflowController.getWorkflowDetails);

// Get workflow statistics
router.get('/stats/summary', authMiddleware, salesOrderWorkflowController.getWorkflowStats);

module.exports = router;
