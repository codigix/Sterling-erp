const express = require('express');
const router = express.Router();
const workstationController = require('../../controllers/production/workstationController');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/', roleMiddleware('Admin', 'Management', 'Production'), workstationController.getWorkstations);
router.post('/', roleMiddleware('Admin', 'Management', 'Production'), workstationController.createWorkstation);
router.get('/stats', roleMiddleware('Admin', 'Management', 'Production'), workstationController.getWorkstationStats);
router.get('/:id', roleMiddleware('Admin', 'Management', 'Production'), workstationController.getWorkstationById);
router.put('/:id', roleMiddleware('Admin', 'Management', 'Production'), workstationController.updateWorkstation);
router.delete('/:id', roleMiddleware('Admin', 'Management', 'Production'), workstationController.deleteWorkstation);

module.exports = router;
