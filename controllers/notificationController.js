const { Notification } = require("../models");
const { successResponse, errorResponse } = require("../utils/response.js");
const { paginationFrom, paginatedData } = require("../utils/pagination");

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
    const { page, limit, offset } = paginationFrom(req.validatedQuery);
    const where = { userId: req.user.id };
    if (req.validatedQuery.unreadOnly) where.isRead = false;
    const { rows, count } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    return successResponse(res, "Notifications fetched", paginatedData(rows, count, page, limit));
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Error fetching notifications");
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({ where: { id, userId: req.user.id } });
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

exports.markAllAsRead = async (req, res) => {
  const [updated] = await Notification.update(
    { isRead: true },
    { where: { userId: req.user.id, isRead: false } }
  );
  return successResponse(res, "Notifications marked as read", { updated });
};
