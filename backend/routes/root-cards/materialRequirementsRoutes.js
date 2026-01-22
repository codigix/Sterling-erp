const express = require('express');
const MaterialRequirementsController = require('../../controllers/root-cards/materialRequirementsController');

const router = express.Router();

router.get('/', MaterialRequirementsController.getAllRequirements);
router.post('/:rootCardId', MaterialRequirementsController.createOrUpdate);
router.get('/:rootCardId', MaterialRequirementsController.getMaterialRequirements);
router.patch('/:rootCardId/status', MaterialRequirementsController.updateProcurementStatus);
router.get('/:rootCardId/validate', MaterialRequirementsController.validateMaterials);
router.post('/:rootCardId/calculate-costs', MaterialRequirementsController.calculateCosts);
router.get('/:rootCardId/materials', MaterialRequirementsController.getMaterials);
router.post('/:rootCardId/materials', MaterialRequirementsController.addMaterial);
router.get('/:rootCardId/materials/:materialId', MaterialRequirementsController.getMaterial);
router.put('/:rootCardId/materials/:materialId', MaterialRequirementsController.updateMaterial);
router.delete('/:rootCardId/materials/:materialId', MaterialRequirementsController.removeMaterial);
router.post('/:rootCardId/materials/:materialId/assign', MaterialRequirementsController.assignMaterial);

module.exports = router;
