const express = require('express');
const router = express.Router();
const itemGroupController = require('../../controllers/inventory/itemGroupController');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/', itemGroupController.getItemGroups);
router.post('/', roleMiddleware('Admin', 'Inventory Manager'), itemGroupController.createItemGroup);
router.put('/:id', roleMiddleware('Admin', 'Inventory Manager'), itemGroupController.updateItemGroup);
router.delete('/:id', roleMiddleware('Admin', 'Inventory Manager'), itemGroupController.deleteItemGroup);

module.exports = router;
