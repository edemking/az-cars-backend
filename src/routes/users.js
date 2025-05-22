const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, admin, hasPermission } = require("../middleware/auth");
const { PERMISSIONS } = require("../models/Role");
const { upload } = require("../utils/fileUpload");

// File upload middleware for user ID documents
const uploadUserDocs = upload.fields([
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 }
]);

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
  hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT),
  uploadUserDocs,
  userController.updateUser
);
router.delete(
  "/:id",
  protect,
  hasPermission(PERMISSIONS.USER_ROLES_MANAGEMENT),
  userController.deleteUser
);

module.exports = router;
