const { Notification } = require("../models");
const { successResponse, errorResponse } = require("../utils/response.js");

// Create notification
exports.createNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body;
    const notification = await Notification.create({ userId, message, type });
    return successResponse(res, "Notification created", notification, 201);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Error creating notification");
  }
};

// Get user’s notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    return successResponse(res, "Notifications fetched", notifications);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Error fetching notifications");
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return errorResponse(res, "Notification not found", 404);
    }
    notification.isRead = true;
    await notification.save();
    return successResponse(res, "Notification marked as read", notification);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Error updating notification");
  }
};