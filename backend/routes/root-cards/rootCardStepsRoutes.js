const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const multer = require('multer');
const path = require('path');
const rootCardStepController = require('../../controllers/root-cards/rootCardStepController');
const clientPOController = require('../../controllers/root-cards/clientPOController');
const designEngineeringController = require('../../controllers/root-cards/designEngineeringController');
const materialRequirementsController = require('../../controllers/root-cards/materialRequirementsController');
const productionPlanController = require('../../controllers/root-cards/productionPlanController');
const qualityCheckController = require('../../controllers/root-cards/qualityCheckController');
const shipmentController = require('../../controllers/root-cards/shipmentController');
const deliveryController = require('../../controllers/root-cards/deliveryController');

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

router.get('/:rootCardId/steps', rootCardStepController.getSteps);
router.get('/:rootCardId/steps/:stepKey', rootCardStepController.getStepByKey);
router.put('/:rootCardId/steps/:stepKey/status', rootCardStepController.updateStepStatus);
router.post('/:rootCardId/steps/:stepKey/assign', rootCardStepController.assignEmployeeToStep);
router.post('/:rootCardId/steps/:stepKey/notes', rootCardStepController.addNoteToStep);
router.get('/:rootCardId/progress', rootCardStepController.getStepProgress);
router.get('/:rootCardId/completed-steps', rootCardStepController.getCompletedSteps);
router.get('/:rootCardId/pending-steps', rootCardStepController.getPendingSteps);

router.post('/:rootCardId/client-po', clientPOController.createOrUpdate);
router.get('/:rootCardId/client-po', clientPOController.getClientPO);
router.delete('/:rootCardId/client-po', clientPOController.delete);
router.get('/client-po/verify/:poNumber', clientPOController.verifyPONumber);
router.get('/client-po/all', clientPOController.getAll);

router.post('/:rootCardId/client-po/client-info', clientPOController.createOrUpdateClientInfo);
router.get('/:rootCardId/client-po/client-info', clientPOController.getClientInfo);

router.post('/:rootCardId/client-po/project-details', clientPOController.createOrUpdateProjectDetails);
router.get('/:rootCardId/client-po/project-details', clientPOController.getProjectDetails);
router.delete('/:rootCardId/client-po/project-details', clientPOController.deleteProjectDetails);

router.post('/:rootCardId/client-po/project-requirements', clientPOController.createOrUpdateProjectRequirements);
router.get('/:rootCardId/client-po/project-requirements', clientPOController.getProjectRequirements);

router.post('/:rootCardId/client-po/product-details', clientPOController.createOrUpdateProductDetails);
router.get('/:rootCardId/client-po/product-details', clientPOController.getProductDetails);

router.post('/:rootCardId/design-engineering', designEngineeringController.createOrUpdate);
router.get('/:rootCardId/design-engineering', designEngineeringController.getDesignEngineering);
router.post('/:rootCardId/design-engineering/approve', designEngineeringController.approveDesign);
router.post('/:rootCardId/design-engineering/reject', designEngineeringController.rejectDesign);
router.post('/:rootCardId/design-engineering/upload', designUpload.array('documents'), designEngineeringController.uploadDesignDocuments);
router.get('/:rootCardId/design-engineering/documents', designEngineeringController.getDesignDocuments);
router.get('/:rootCardId/design-engineering/documents/:documentId', designEngineeringController.getDesignDocument);
router.get('/:rootCardId/design-engineering/validate', designEngineeringController.validateDesign);
router.get('/:rootCardId/design-engineering/review-history', designEngineeringController.getReviewHistory);

router.post('/:rootCardId/material-requirements', materialRequirementsController.createOrUpdate);
router.get('/:rootCardId/material-requirements', materialRequirementsController.getMaterialRequirements);
router.patch('/:rootCardId/material-requirements/status', materialRequirementsController.updateProcurementStatus);
router.get('/:rootCardId/material-requirements/validate', materialRequirementsController.validateMaterials);
router.post('/:rootCardId/material-requirements/calculate-cost', materialRequirementsController.calculateCosts);
router.get('/:rootCardId/material-requirements/materials', materialRequirementsController.getMaterials);
router.post('/:rootCardId/material-requirements/materials', materialRequirementsController.addMaterial);
router.get('/:rootCardId/material-requirements/materials/:materialId', materialRequirementsController.getMaterial);
router.put('/:rootCardId/material-requirements/materials/:materialId', materialRequirementsController.updateMaterial);
router.delete('/:rootCardId/material-requirements/materials/:materialId', materialRequirementsController.removeMaterial);
router.post('/:rootCardId/material-requirements/materials/:materialId/assign', materialRequirementsController.assignMaterial);

router.post('/:rootCardId/production-plan', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer'), productionPlanController.createOrUpdate);
router.get('/:rootCardId/production-plan', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer'), productionPlanController.getProductionPlan);
router.post('/:rootCardId/production-plan/validate-timeline', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer'), productionPlanController.validateTimeline);
router.get('/:rootCardId/production-plan/validate-phases', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer'), productionPlanController.validatePhases);
router.post('/:rootCardId/production-plan/phases', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer'), productionPlanController.addPhase);
router.get('/:rootCardId/production-plan/phases', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer'), productionPlanController.getPhases);
router.get('/:rootCardId/production-plan/phases/:phaseKey', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer'), productionPlanController.getPhase);
router.put('/:rootCardId/production-plan/phases/:phaseKey', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer'), productionPlanController.updatePhase);
router.delete('/:rootCardId/production-plan/phases/:phaseKey', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer'), productionPlanController.removePhase);
router.post('/:rootCardId/production-plan/phases/:phaseKey/status', roleMiddleware('Admin', 'Management', 'Production', 'Design Engineer'), productionPlanController.updatePhaseStatus);

router.post('/:rootCardId/quality-check', qualityCheckController.createOrUpdate);
router.get('/:rootCardId/quality-check', qualityCheckController.getQualityCheck);
router.patch('/:rootCardId/quality-check/status', qualityCheckController.updateQCStatus);
router.post('/:rootCardId/quality-check/compliance', qualityCheckController.addCompliance);
router.post('/:rootCardId/quality-check/warranty', qualityCheckController.addWarrantySupport);
router.post('/:rootCardId/quality-check/assign-owner', qualityCheckController.assignProjectOwner);
router.get('/:rootCardId/quality-check/validate', qualityCheckController.validateCompliance);

router.post('/:rootCardId/shipment', shipmentController.createOrUpdate);
router.get('/:rootCardId/shipment', shipmentController.getShipment);
router.patch('/:rootCardId/shipment/status', shipmentController.updateShipmentStatus);
router.post('/:rootCardId/shipment/delivery-terms', shipmentController.updateDeliveryTerms);
router.post('/:rootCardId/shipment/shipment-process', shipmentController.updateShipmentProcess);
router.put('/:rootCardId/shipment/shipping-details', shipmentController.updateShippingDetails);
router.get('/:rootCardId/shipment/validate', shipmentController.validateShipment);

router.post('/:rootCardId/delivery', deliveryController.createOrUpdate);
router.get('/:rootCardId/delivery', deliveryController.getDelivery);
router.patch('/:rootCardId/delivery/status', deliveryController.updateDeliveryStatus);
router.post('/:rootCardId/delivery/final-delivery', deliveryController.updateFinalDelivery);
router.post('/:rootCardId/delivery/installation-status', deliveryController.updateInstallationStatus);
router.post('/:rootCardId/delivery/warranty-info', deliveryController.updateWarrantyInfo);
router.post('/:rootCardId/delivery/project-completion', deliveryController.updateProjectCompletion);
router.post('/:rootCardId/delivery/internal-info', deliveryController.updateInternalInfo);
router.get('/:rootCardId/delivery/validate', deliveryController.validateDelivery);

module.exports = router;
