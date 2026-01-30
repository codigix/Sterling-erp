const express = require('express');
const customerController = require('../../controllers/sales/customerController');

const router = express.Router();

router.get('/:id', customerController.getCustomerById);
router.get('/', customerController.getAllCustomers);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
