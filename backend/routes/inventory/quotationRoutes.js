const express = require('express');
const quotationController = require('../../controllers/inventory/quotationController');

const router = express.Router();

router.get('/stats', quotationController.getQuotationStats);
router.get('/vendor/:vendor_id', quotationController.getVendorQuotations);
router.get('/project/:projectId', quotationController.getQuotationsByProject);
router.get('/:id', quotationController.getQuotationById);
router.get('/', quotationController.getAllQuotations);
router.post('/', quotationController.createQuotation);
router.put('/:id', quotationController.updateQuotation);
router.delete('/:id', quotationController.deleteQuotation);
router.patch('/:id/approve', quotationController.approveQuotation);
router.patch('/:id/reject', quotationController.rejectQuotation);
router.patch('/:id/status', quotationController.updateQuotationStatus);

module.exports = router;
