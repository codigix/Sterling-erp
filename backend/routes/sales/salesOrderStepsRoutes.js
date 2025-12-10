const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const salesOrderStepController = require('../../controllers/sales/salesOrderStepController');
const clientPOController = require('../../controllers/sales/clientPOController');
const salesOrderDetailController = require('../../controllers/sales/salesOrderDetailController');
const designEngineeringController = require('../../controllers/sales/designEngineeringController');
const materialRequirementsController = require('../../controllers/sales/materialRequirementsController');
const productionPlanController = require('../../controllers/sales/productionPlanController');
const qualityCheckController = require('../../controllers/sales/qualityCheckController');
const shipmentController = require('../../controllers/sales/shipmentController');
const deliveryController = require('../../controllers/sales/deliveryController');

const designUpload = multer({
  dest: path.join(__dirname, '../../uploads/design-engineering'),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/x-cad',
      'application/x-dwg',
      'application/x-autocad-dxf'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

router.use(authMiddleware);

router.get('/:salesOrderId/steps', salesOrderStepController.getSteps);
router.get('/:salesOrderId/steps/:stepKey', salesOrderStepController.getStepByKey);
router.put('/:salesOrderId/steps/:stepKey/status', salesOrderStepController.updateStepStatus);
router.post('/:salesOrderId/steps/:stepKey/assign', salesOrderStepController.assignEmployeeToStep);
router.post('/:salesOrderId/steps/:stepKey/notes', salesOrderStepController.addNoteToStep);
router.get('/:salesOrderId/progress', salesOrderStepController.getStepProgress);
router.get('/:salesOrderId/completed-steps', salesOrderStepController.getCompletedSteps);
router.get('/:salesOrderId/pending-steps', salesOrderStepController.getPendingSteps);

router.post('/:salesOrderId/client-po', clientPOController.createOrUpdate);
router.get('/:salesOrderId/client-po', clientPOController.getClientPO);
router.delete('/:salesOrderId/client-po', clientPOController.delete);
router.get('/client-po/verify/:poNumber', clientPOController.verifyPONumber);
router.get('/client-po/all', clientPOController.getAll);

router.post('/:salesOrderId/client-po/client-info', clientPOController.createOrUpdateClientInfo);
router.get('/:salesOrderId/client-po/client-info', clientPOController.getClientInfo);

router.post('/:salesOrderId/client-po/project-details', clientPOController.createOrUpdateProjectDetails);
router.get('/:salesOrderId/client-po/project-details', clientPOController.getProjectDetails);

router.post('/:salesOrderId/client-po/project-requirements', clientPOController.createOrUpdateProjectRequirements);
router.get('/:salesOrderId/client-po/project-requirements', clientPOController.getProjectRequirements);

router.post('/:salesOrderId/sales-order', salesOrderDetailController.createOrUpdate);
router.get('/:salesOrderId/sales-order', salesOrderDetailController.getSalesOrderDetail);
router.delete('/:salesOrderId/sales-order', salesOrderDetailController.delete);

router.post('/:salesOrderId/sales-order/sales-product', salesOrderDetailController.createOrUpdateSalesAndProduct);
router.get('/:salesOrderId/sales-order/sales-product', salesOrderDetailController.getSalesAndProduct);

router.post('/:salesOrderId/sales-order/quality-compliance', salesOrderDetailController.createOrUpdateQualityAndCompliance);
router.get('/:salesOrderId/sales-order/quality-compliance', salesOrderDetailController.getQualityAndCompliance);

router.post('/:salesOrderId/sales-order/payment-internal', salesOrderDetailController.createOrUpdatePaymentAndInternal);
router.get('/:salesOrderId/sales-order/payment-internal', salesOrderDetailController.getPaymentAndInternal);

router.post('/:salesOrderId/design-engineering', designEngineeringController.createOrUpdate);
router.get('/:salesOrderId/design-engineering', designEngineeringController.getDesignEngineering);
router.post('/:salesOrderId/design-engineering/approve', designEngineeringController.approveDesign);
router.post('/:salesOrderId/design-engineering/reject', designEngineeringController.rejectDesign);
router.post('/:salesOrderId/design-engineering/upload', designUpload.array('documents'), designEngineeringController.uploadDesignDocuments);
router.get('/:salesOrderId/design-engineering/documents', designEngineeringController.getDesignDocuments);
router.get('/:salesOrderId/design-engineering/documents/:documentId', designEngineeringController.getDesignDocument);
router.get('/:salesOrderId/design-engineering/validate', designEngineeringController.validateDesign);
router.get('/:salesOrderId/design-engineering/review-history', designEngineeringController.getReviewHistory);

router.post('/:salesOrderId/material-requirements', materialRequirementsController.createOrUpdate);
router.get('/:salesOrderId/material-requirements', materialRequirementsController.getMaterialRequirements);
router.patch('/:salesOrderId/material-requirements/status', materialRequirementsController.updateProcurementStatus);
router.get('/:salesOrderId/material-requirements/validate', materialRequirementsController.validateMaterials);
router.post('/:salesOrderId/material-requirements/calculate-cost', materialRequirementsController.calculateCosts);
router.get('/:salesOrderId/material-requirements/materials', materialRequirementsController.getMaterials);
router.post('/:salesOrderId/material-requirements/materials', materialRequirementsController.addMaterial);
router.get('/:salesOrderId/material-requirements/materials/:materialId', materialRequirementsController.getMaterial);
router.put('/:salesOrderId/material-requirements/materials/:materialId', materialRequirementsController.updateMaterial);
router.delete('/:salesOrderId/material-requirements/materials/:materialId', materialRequirementsController.removeMaterial);
router.post('/:salesOrderId/material-requirements/materials/:materialId/assign', materialRequirementsController.assignMaterial);

router.post('/:salesOrderId/production-plan', productionPlanController.createOrUpdate);
router.get('/:salesOrderId/production-plan', productionPlanController.getProductionPlan);
router.post('/:salesOrderId/production-plan/validate-timeline', productionPlanController.validateTimeline);
router.get('/:salesOrderId/production-plan/validate-phases', productionPlanController.validatePhases);
router.post('/:salesOrderId/production-plan/phases', productionPlanController.addPhase);
router.get('/:salesOrderId/production-plan/phases', productionPlanController.getPhases);
router.get('/:salesOrderId/production-plan/phases/:phaseKey', productionPlanController.getPhase);
router.put('/:salesOrderId/production-plan/phases/:phaseKey', productionPlanController.updatePhase);
router.delete('/:salesOrderId/production-plan/phases/:phaseKey', productionPlanController.removePhase);
router.post('/:salesOrderId/production-plan/phases/:phaseKey/status', productionPlanController.updatePhaseStatus);

router.post('/:salesOrderId/quality-check', qualityCheckController.createOrUpdate);
router.get('/:salesOrderId/quality-check', qualityCheckController.getQualityCheck);
router.patch('/:salesOrderId/quality-check/status', qualityCheckController.updateQCStatus);
router.post('/:salesOrderId/quality-check/compliance', qualityCheckController.addCompliance);
router.post('/:salesOrderId/quality-check/warranty', qualityCheckController.addWarrantySupport);
router.post('/:salesOrderId/quality-check/assign-owner', qualityCheckController.assignProjectOwner);
router.get('/:salesOrderId/quality-check/validate', qualityCheckController.validateCompliance);

router.post('/:salesOrderId/shipment', shipmentController.createOrUpdate);
router.get('/:salesOrderId/shipment', shipmentController.getShipment);
router.patch('/:salesOrderId/shipment/status', shipmentController.updateShipmentStatus);
router.post('/:salesOrderId/shipment/delivery-terms', shipmentController.updateDeliveryTerms);
router.post('/:salesOrderId/shipment/shipment-process', shipmentController.updateShipmentProcess);
router.put('/:salesOrderId/shipment/shipping-details', shipmentController.updateShippingDetails);
router.get('/:salesOrderId/shipment/validate', shipmentController.validateShipment);

router.post('/:salesOrderId/delivery', deliveryController.createOrUpdate);
router.get('/:salesOrderId/delivery', deliveryController.getDelivery);
router.patch('/:salesOrderId/delivery/status', deliveryController.updateDeliveryStatus);
router.post('/:salesOrderId/delivery/final-delivery', deliveryController.updateFinalDelivery);
router.post('/:salesOrderId/delivery/installation-status', deliveryController.updateInstallationStatus);
router.post('/:salesOrderId/delivery/warranty-info', deliveryController.updateWarrantyInfo);
router.post('/:salesOrderId/delivery/project-completion', deliveryController.updateProjectCompletion);
router.post('/:salesOrderId/delivery/internal-info', deliveryController.updateInternalInfo);
router.get('/:salesOrderId/delivery/validate', deliveryController.validateDelivery);

module.exports = router;
