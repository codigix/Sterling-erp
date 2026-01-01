const express = require('express');
const router = express.Router();
const qcPortalController = require('../../controllers/qc/qcPortalController');
const authMiddleware = require('../../middleware/authMiddleware');

router.get('/grn-inspections', authMiddleware, qcPortalController.getGRNInspections);
router.get('/stage-qc', authMiddleware, qcPortalController.getStageQC);

// New routes for QC actions
router.post('/inspections', authMiddleware, qcPortalController.saveInspection);
router.get('/inspections/grn/:grnId', authMiddleware, qcPortalController.getInspectionDetails);
router.get('/grn-details/:grnId', authMiddleware, qcPortalController.getGRNDetailsWithInspection);

module.exports = router;
