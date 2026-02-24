const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const materialController = require('../../controllers/inventory/materialController');

router.use(authMiddleware);

router.get('/', roleMiddleware('Admin', 'Inventory', 'Inventory Manager', 'inventory_manager', 'Design Engineer', 'design_engineer', 'design.engineer', 'Engineering', 'engineering', 'Production', 'production', 'production_manager'), materialController.getMaterials);
router.post('/', roleMiddleware('Admin', 'Inventory', 'Inventory Manager', 'inventory_manager'), materialController.createMaterial);
router.get('/:id', roleMiddleware('Admin', 'Inventory', 'Inventory Manager', 'inventory_manager', 'Procurement Manager', 'procurement_manager', 'Production', 'production', 'production_manager'), materialController.getMaterialById);
router.put('/:id', roleMiddleware('Admin', 'Inventory', 'Inventory Manager', 'inventory_manager'), materialController.updateMaterial);
router.delete('/:id', roleMiddleware('Admin', 'Inventory', 'Inventory Manager', 'inventory_manager'), materialController.deleteMaterial);
router.patch('/:id/quantity', roleMiddleware('Admin', 'Inventory', 'Inventory Manager', 'inventory_manager'), materialController.updateMaterialQuantity);
router.get('/reorder/check', roleMiddleware('Admin', 'Inventory', 'Inventory Manager', 'inventory_manager'), materialController.checkReorderLevels);

module.exports = router;
