const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Public route - anyone can create a user
router.post('/', userController.createUser);

// Protected routes - only authenticated users can access
router.get('/', protect, userController.getUsers);
router.get('/:id', protect, userController.getUser);
router.put('/:id', protect, userController.updateUser);
router.delete('/:id', protect, userController.deleteUser);

module.exports = router; 