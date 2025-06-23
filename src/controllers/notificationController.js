const Notification = require("../models/Notification");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const { Expo } = require("expo-server-sdk");

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  // Build query
  const query = { user: req.user.id };

  // Filter by read status if provided
  if (req.query.isRead !== undefined) {
    query.isRead = req.query.isRead === "true";
  }

  // Filter by notification type if provided
  if (req.query.type) {
    query.type = req.query.type;
  }

  // Get total count for pagination
  const total = await Notification.countDocuments(query);

  // Get notifications
  const notifications = await Notification.find(query)
    .populate({
      path: "auction",
      select: "auctionTitle status endTime currentHighestBid",
      populate: {
        path: "car",
        select: "images",
        populate: [
          { path: "make", select: "name" },
          { path: "model", select: "name" },
        ],
      },
    })
    .populate({
      path: "bid",
      select: "amount createdAt",
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  // Calculate pagination info
  const pagination = {};

  if (startIndex + limit < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  // Get unread count
  const unreadCount = await Notification.countDocuments({
    user: req.user.id,
    isRead: false,
  });

  sendSuccess(res, {
    data: notifications,
    meta: {
      count: notifications.length,
      total,
      unreadCount,
      pagination,
    },
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markNotificationAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(
      new ErrorResponse(
        `Notification not found with id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure notification belongs to user
  if (notification.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse("Not authorized to access this notification", 401)
    );
  }

  notification.isRead = true;
  await notification.save();

  sendSuccess(res, {
    message: "Notification marked as read",
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllNotificationsAsRead = asyncHandler(async (req, res, next) => {
  const result = await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { isRead: true }
  );

  sendSuccess(res, {
    message: `${result.modifiedCount} notifications marked as read`,
    data: {
      modifiedCount: result.modifiedCount,
    },
  });
});

// @desc    Delete single notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(
      new ErrorResponse(
        `Notification not found with id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure notification belongs to user
  if (notification.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse("Not authorized to delete this notification", 401)
    );
  }

  await notification.deleteOne();

  sendSuccess(res, {
    message: "Notification deleted successfully",
  });
});

// @desc    Clear all notifications for user
// @route   DELETE /api/notifications/clear-all
// @access  Private
exports.clearAllNotifications = asyncHandler(async (req, res, next) => {
  const result = await Notification.deleteMany({ user: req.user.id });

  sendSuccess(res, {
    message: `${result.deletedCount} notifications cleared`,
    data: {
      deletedCount: result.deletedCount,
    },
  });
});

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
exports.getNotificationStats = asyncHandler(async (req, res, next) => {
  const stats = await Notification.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        unreadCount: {
          $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] },
        },
      },
    },
  ]);

  const totalNotifications = await Notification.countDocuments({
    user: req.user.id,
  });
  const totalUnread = await Notification.countDocuments({
    user: req.user.id,
    isRead: false,
  });

  sendSuccess(res, {
    data: {
      totalNotifications,
      totalUnread,
      byType: stats,
    },
  });
});

// @desc    Test push notification to a specific token
// @route   POST /api/notifications/test-push
// @access  Private
exports.testPushNotification = asyncHandler(async (req, res, next) => {
  const { token, title, body, data, sound, image } = req.body;

  // Validate required fields
  if (!token) {
    return next(new ErrorResponse("Push token is required", 400));
  }

  if (!title || !body) {
    return next(new ErrorResponse("Title and body are required", 400));
  }

  try {
    // Create a new Expo SDK client
    const expo = new Expo({
      accessToken: process.env.EXPO_ACCESS_TOKEN,
    });

    // Check that the push token appears to be valid
    if (!Expo.isExpoPushToken(token)) {
      return next(new ErrorResponse("Invalid Expo push token format", 400));
    }

    // Construct the message
    const message = {
      to: token,
      sound: sound || "default",
      title: title,
      body: body,
      data: data || { test: true },
    };

    // Add image if provided
    if (image) {
      message.richContent = {
        image: image,
      };
    }

    // Send the notification
    const tickets = await expo.sendPushNotificationsAsync([message]);
    const ticket = tickets[0];

    if (ticket.status === "error") {
      console.error("Error sending test push notification:", ticket.message);
      return next(
        new ErrorResponse(
          `Failed to send push notification: ${ticket.message}`,
          400
        )
      );
    }

    console.log("Test push notification sent successfully");

    sendSuccess(res, {
      message: "Test push notification sent successfully",
      data: {
        ticket,
        sentMessage: message,
      },
    });
  } catch (error) {
    console.error("Error sending test push notification:", error);
    return next(
      new ErrorResponse(
        `Failed to send push notification: ${error.message}`,
        500
      )
    );
  }
});
