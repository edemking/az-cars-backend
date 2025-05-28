const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, admin, hasPermission, ownerOrAdmin, checkAccountStatus } = require("../middleware/auth");
const { PERMISSIONS } = require("../models/Role");
const { upload } = require("../utils/fileUpload");

// File upload middleware for user ID documents and profile picture
const uploadUserDocs = upload.fields([
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 },
  { name: 'profilePicture', maxCount: 1 }
]);

// File upload middleware for profile picture
const uploadProfilePicture = upload.single('profilePicture');

// User management routes - require appropriate permissions
router.post(
  "/",
  protect,
  hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT),
  uploadUserDocs,
  userController.createUser
);

// Public registration endpoint - no auth required
router.post(
  "/register",
  uploadUserDocs,
  userController.createUser
);

router.get(
  "/",
  protect,
  hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT),
  userController.getUsers
);
// router.get('/:id', protect, hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT), userController.getUser);
router.get("/:id", protect, userController.getUser);
router.put(
  "/:id",
  protect,
  // hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT),
  uploadUserDocs,
  userController.updateUser
);
router.delete(
  "/:id",
  protect,
  hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT),
  userController.deleteUser
);

// New routes for the requested features

// Change profile picture - users can update their own profile picture or admins can update any user's
router.put(
  "/:id/profile-picture",
  protect,
  checkAccountStatus,
  ownerOrAdmin,
  uploadProfilePicture,
  userController.changeProfilePicture
);

// Suspend user account - requires user management permission
router.put(
  "/:id/suspend",
  protect,
  checkAccountStatus,
  hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT),
  userController.suspendUser
);

// Activate user account - requires user management permission
router.put(
  "/:id/activate",
  protect,
  checkAccountStatus,
  hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT),
  userController.activateUser
);

// Update ID documents - users can update their own or admins can update any user's
router.put(
  "/:id/id-documents",
  protect,
  checkAccountStatus,
  ownerOrAdmin,
  uploadUserDocs,
  userController.updateIdDocuments
);

module.exports = router;
