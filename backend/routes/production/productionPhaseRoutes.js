const express = require('express');
const router = express.Router();
const productionPhaseController = require('../../controllers/production/productionPhaseController');
const challanController = require('../../controllers/production/challanController');

router.post('/phases/save', productionPhaseController.savePhaseDetail);
router.get('/phases/:salesOrderId', productionPhaseController.getPhaseDetails);
router.get('/phase/:phaseDetailId', productionPhaseController.getPhaseDetail);
router.post('/phases/:trackingId/start', productionPhaseController.startPhase);
router.post('/phases/:trackingId/finish', productionPhaseController.finishPhase);
router.post('/phases/:trackingId/hold', productionPhaseController.holdPhase);
router.post('/phases/:trackingId/cancel', productionPhaseController.cancelPhase);
router.put('/phases/:trackingId/edit', productionPhaseController.editPhase);

router.post('/challans/outward', challanController.createOutwardChallan);
router.post('/challans/inward', challanController.createInwardChallan);
router.get('/challans/outward/:salesOrderId', challanController.getOutwardChallans);
router.get('/challans/inward/:outwardChallanId', challanController.getInwardChallans);
router.put('/challans/outward/:challanId', challanController.updateOutwardChallan);
router.put('/challans/inward/:challanId', challanController.updateInwardChallan);

module.exports = router;
