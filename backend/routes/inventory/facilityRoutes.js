const express = require('express');
const facilityController = require('../../controllers/inventory/facilityController');
const authMiddleware = require('../../middleware/authMiddleware');

const roleMiddleware = require('../../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', roleMiddleware('Admin', 'Inventory Manager'), facilityController.createFacility);
router.get('/', roleMiddleware('Admin', 'Inventory Manager', 'Design Engineer', 'design_engineer', 'design.engineer', 'Engineering', 'engineering', 'Production'), facilityController.getAllFacilities);
router.get('/available', roleMiddleware('Admin', 'Inventory Manager', 'Design Engineer', 'design_engineer', 'design.engineer', 'Engineering', 'engineering', 'Production'), facilityController.getAvailableFacilities);
router.get('/:id', roleMiddleware('Admin', 'Inventory Manager', 'Design Engineer', 'design_engineer', 'design.engineer', 'Engineering', 'engineering', 'Production'), facilityController.getFacility);
router.put('/:id', roleMiddleware('Admin', 'Inventory Manager'), facilityController.updateFacility);
router.delete('/:id', roleMiddleware('Admin', 'Inventory Manager'), facilityController.deleteFacility);

module.exports = router;
