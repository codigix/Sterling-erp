const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const materialController = require('../../controllers/inventory/materialController');

router.use(authMiddleware);

router.get('/', roleMiddleware('Admin', 'Inventory Manager'), materialController.getMaterials);
router.post('/', roleMiddleware('Admin', 'Inventory Manager'), materialController.createMaterial);
router.get('/:id', roleMiddleware('Admin', 'Inventory Manager', 'Procurement Manager'), materialController.getMaterialById);
router.put('/:id', roleMiddleware('Admin', 'Inventory Manager'), materialController.updateMaterial);
router.delete('/:id', roleMiddleware('Admin', 'Inventory Manager'), materialController.deleteMaterial);
router.patch('/:id/quantity', roleMiddleware('Admin', 'Inventory Manager'), materialController.updateMaterialQuantity);
router.get('/reorder/check', roleMiddleware('Admin', 'Inventory Manager'), materialController.checkReorderLevels);

module.exports = router;
