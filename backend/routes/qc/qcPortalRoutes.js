const express = require('express');
const router = express.Router();
const qcPortalController = require('../../controllers/qc/qcPortalController');
const authMiddleware = require('../../middleware/authMiddleware');

router.get('/grn-inspections', authMiddleware, qcPortalController.getGRNInspections);
router.get('/stage-qc', authMiddleware, qcPortalController.getStageQC);

module.exports = router;
