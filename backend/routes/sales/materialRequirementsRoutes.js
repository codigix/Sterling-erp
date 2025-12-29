const express = require('express');
const MaterialRequirementsController = require('../../controllers/sales/materialRequirementsController');

const router = express.Router();

router.get('/', MaterialRequirementsController.getAllRequirements);
router.post('/:salesOrderId', MaterialRequirementsController.createOrUpdate);
router.get('/:salesOrderId', MaterialRequirementsController.getMaterialRequirements);
router.patch('/:salesOrderId/status', MaterialRequirementsController.updateProcurementStatus);
router.get('/:salesOrderId/validate', MaterialRequirementsController.validateMaterials);
router.post('/:salesOrderId/calculate-costs', MaterialRequirementsController.calculateCosts);
router.get('/:salesOrderId/materials', MaterialRequirementsController.getMaterials);
router.post('/:salesOrderId/materials', MaterialRequirementsController.addMaterial);
router.get('/:salesOrderId/materials/:materialId', MaterialRequirementsController.getMaterial);
router.put('/:salesOrderId/materials/:materialId', MaterialRequirementsController.updateMaterial);
router.delete('/:salesOrderId/materials/:materialId', MaterialRequirementsController.removeMaterial);
router.post('/:salesOrderId/materials/:materialId/assign', MaterialRequirementsController.assignMaterial);

module.exports = router;
