const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const employeeController = require('../../controllers/admin/employeeController');

router.use(authMiddleware);

router.get('/', employeeController.getEmployees);
router.get('/:id', employeeController.getEmployee);

module.exports = router;
