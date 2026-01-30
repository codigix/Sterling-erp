const express = require('express');
const warehouseController = require('../../controllers/inventory/warehouseController');

const router = express.Router();

router.get('/:id', warehouseController.getWarehouseById);
router.get('/', warehouseController.getAllWarehouses);
router.post('/', warehouseController.createWarehouse);
router.put('/:id', warehouseController.updateWarehouse);
router.delete('/:id', warehouseController.deleteWarehouse);

module.exports = router;
