const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/authController');
const authMiddleware = require('../../middleware/authMiddleware');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes
router.get('/me', authMiddleware, authController.getProfile);

module.exports = router;