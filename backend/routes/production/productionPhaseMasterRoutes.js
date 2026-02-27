const express = require('express');
const router = express.Router();
const productionPhaseMasterController = require('../../controllers/production/productionPhaseMasterController');

router.get('/', productionPhaseMasterController.getAllPhases);
router.post('/', productionPhaseMasterController.createPhase);

module.exports = router;
