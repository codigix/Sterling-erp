const express = require('express');
const facilityController = require('../../controllers/inventory/facilityController');
const authMiddleware = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', facilityController.createFacility);
router.get('/', facilityController.getAllFacilities);
router.get('/available', facilityController.getAvailableFacilities);
router.get('/:id', facilityController.getFacility);
router.put('/:id', facilityController.updateFacility);
router.delete('/:id', facilityController.deleteFacility);

module.exports = router;
