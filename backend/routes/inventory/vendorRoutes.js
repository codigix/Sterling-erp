const express = require('express');
const vendorController = require('../../controllers/inventory/vendorController');

const router = express.Router();

router.get('/stats', vendorController.getVendorStats);
router.get('/categories', vendorController.getCategories);
router.get('/:id', vendorController.getVendorById);
router.get('/', vendorController.getAllVendors);
router.post('/', vendorController.createVendor);
router.put('/:id', vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);

module.exports = router;
