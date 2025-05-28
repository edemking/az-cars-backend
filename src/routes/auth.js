const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Login route
router.post('/login', authController.login);

// Get current logged in user
router.get('/me', protect, authController.getMe);

// Forgot password - request OTP
router.post('/forgot-password', authController.forgotPassword);

// Verify OTP only
router.post('/verify-otp', authController.verifyOTP);

// Reset password with OTP
router.post('/reset-password', authController.resetPassword);

// Change password for logged in user
router.post('/change-password', protect, authController.changePassword);

module.exports = router; 