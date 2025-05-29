const express = require('express');
const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationStats
} = require('../controllers/notificationController');

const router = express.Router();

// Import middleware
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .get(getUserNotifications);

router.route('/stats')
  .get(getNotificationStats);

router.route('/read-all')
  .put(markAllNotificationsAsRead);

router.route('/clear-all')
  .delete(clearAllNotifications);

router.route('/:id')
  .delete(deleteNotification);

router.route('/:id/read')
  .put(markNotificationAsRead);

module.exports = router; 