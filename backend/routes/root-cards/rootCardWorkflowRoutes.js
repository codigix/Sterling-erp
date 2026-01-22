const express = require('express');
const router = express.Router();
const rootCardWorkflowController = require('../../controllers/root-cards/rootCardWorkflowController');
const authMiddleware = require('../../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/root-cards/documents'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Initialize workflow
router.post('/initialize', authMiddleware, rootCardWorkflowController.initializeWorkflow);

// Get workflow steps
router.get('/:rootCardId/steps', authMiddleware, rootCardWorkflowController.getWorkflowSteps);

// Assign employee to step
router.post('/steps/assign', authMiddleware, rootCardWorkflowController.assignEmployeeToStep);

// Update step status
router.put('/steps/:stepId/status', authMiddleware, rootCardWorkflowController.updateStepStatus);

// Upload documents for a step
router.post('/steps/:stepId/upload', authMiddleware, upload.array('files'), rootCardWorkflowController.uploadStepDocuments);

// Get workflow details with history
router.get('/:rootCardId/details', authMiddleware, rootCardWorkflowController.getWorkflowDetails);

// Get workflow statistics
router.get('/stats/summary', authMiddleware, rootCardWorkflowController.getWorkflowStats);

module.exports = router;
