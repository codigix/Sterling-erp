const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const materialRequestController = require('../../controllers/procurement/materialRequestController');

router.use(authMiddleware);

router.post('/', materialRequestController.createMaterialRequest);

router.get('/', materialRequestController.getAllMaterialRequests);

router.get('/sales-order/:salesOrderId', materialRequestController.getMaterialRequestsBySalesOrder);

router.get('/:id', materialRequestController.getMaterialRequest);

router.put('/:id', materialRequestController.updateMaterialRequest);

router.put('/:id/status', materialRequestController.updateMaterialRequestStatus);

router.delete('/:id', materialRequestController.deleteMaterialRequest);

router.post('/:id/vendors', materialRequestController.addVendorQuote);

router.get('/:id/vendors', materialRequestController.getVendorQuotes);

router.post('/:id/select-vendor', materialRequestController.selectVendor);

module.exports = router;
