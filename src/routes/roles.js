const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { protect, hasPermission } = require('../middleware/auth');
const { PERMISSIONS } = require('../models/Role');

// Routes requiring User & Roles Management permission
router.get('/', protect, hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT), roleController.getRoles);
router.get('/permissions', protect, hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT), roleController.getPermissions);
router.get('/:id', protect, hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT), roleController.getRole);
router.post('/', protect, hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT), roleController.createRole);
router.put('/:id', protect, hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT), roleController.updateRole);
router.delete('/:id', protect, hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT), roleController.deleteRole);

module.exports = router; 