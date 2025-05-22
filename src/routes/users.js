const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin, hasPermission } = require('../middleware/auth');
const { PERMISSIONS } = require('../models/Role');

// User management routes - require appropriate permissions
router.post('/', protect, hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT), userController.createUser);
router.get('/', protect, hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT), userController.getUsers);
// router.get('/:id', protect, hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT), userController.getUser);
router.get('/:id', protect, userController.getUser);
router.put('/:id', protect, hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT), userController.updateUser);
router.delete('/:id', protect, hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT), userController.deleteUser);

module.exports = router; 