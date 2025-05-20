const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Login route
router.post('/login', authController.login);

// Get current logged in user
router.get('/me', protect, authController.getMe);

module.exports = router; 