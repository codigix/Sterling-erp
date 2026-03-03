const express = require('express');
const warehouseController = require('../../controllers/inventory/warehouseController');

const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/:id', roleMiddleware('Admin', 'Inventory', 'Inventory Manager', 'inventory_manager', 'Production', 'production', 'production_manager', 'Design Engineer', 'design_engineer'), warehouseController.getWarehouseById);
router.get('/', roleMiddleware('Admin', 'Inventory', 'Inventory Manager', 'inventory_manager', 'Production', 'production', 'production_manager', 'Design Engineer', 'design_engineer'), warehouseController.getAllWarehouses);
router.post('/', roleMiddleware('Admin', 'Inventory', 'Inventory Manager', 'inventory_manager'), warehouseController.createWarehouse);
router.put('/:id', roleMiddleware('Admin', 'Inventory', 'Inventory Manager', 'inventory_manager'), warehouseController.updateWarehouse);
router.delete('/:id', roleMiddleware('Admin', 'Inventory', 'Inventory Manager', 'inventory_manager'), warehouseController.deleteWarehouse);

module.exports = router;
