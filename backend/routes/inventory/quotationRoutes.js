const express = require('express');
const quotationController = require('../../controllers/inventory/quotationController');

const router = express.Router();

router.get('/stats', quotationController.getQuotationStats);
router.get('/attachments/:id/download', quotationController.downloadQuotationAttachment);
router.get('/vendor/:vendor_id', quotationController.getVendorQuotations);
router.get('/root-card/:rootCardId', quotationController.getQuotationsByRootCard);
router.get('/material-request/:id', quotationController.getQuotationsByMaterialRequest);
router.get('/:id/communications', quotationController.getQuotationCommunications);
router.post('/:id/communications/read', quotationController.markCommunicationsAsRead);
router.get('/:id/responses', quotationController.getQuotationResponses);
router.get('/:id', quotationController.getQuotationById);
router.get('/', quotationController.getAllQuotations);
router.post('/upload', quotationController.uploadQuotationFile);
router.post('/analyze', quotationController.analyzeQuotation);
router.post('/', quotationController.createQuotation);
router.post('/:id/email', quotationController.sendQuotationEmail);
router.put('/:id', quotationController.updateQuotation);
router.delete('/:id', quotationController.deleteQuotation);
router.patch('/:id/approve', quotationController.approveQuotation);
router.patch('/:id/reject', quotationController.rejectQuotation);
router.patch('/:id/status', quotationController.updateQuotationStatus);

module.exports = router;
