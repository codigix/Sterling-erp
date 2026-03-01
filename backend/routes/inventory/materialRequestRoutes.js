const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const materialRequestController = require('../../controllers/procurement/materialRequestController');

router.use(authMiddleware);

router.put('/:id/status', materialRequestController.updateMaterialRequestStatus);
router.patch('/:id/status', materialRequestController.updateMaterialRequestStatus);
router.post('/:id/release', materialRequestController.releaseMaterial);

router.post('/', materialRequestController.createMaterialRequest);
router.post('/bulk', materialRequestController.bulkCreateMaterialRequests);

router.get('/', materialRequestController.getAllMaterialRequests);

router.get('/root-card/:rootCardId', materialRequestController.getMaterialRequestsByRootCard);
router.get('/production-plan/:productionPlanId', materialRequestController.getMaterialRequestsByProductionPlan);

router.get('/:id', materialRequestController.getMaterialRequest);

router.put('/:id', materialRequestController.updateMaterialRequest);

router.delete('/:id', materialRequestController.deleteMaterialRequest);

router.post('/:id/vendors', materialRequestController.addVendorQuote);

router.get('/:id/vendors', materialRequestController.getVendorQuotes);

router.post('/:id/select-vendor', materialRequestController.selectVendor);

module.exports = router;
