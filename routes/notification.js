const express = require("express");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { notification } = require("../validation/schemas");

const router = express.Router();
router.use(protect);
router.get("/", validate(notification.list), asyncHandler(getNotifications));
router.patch("/read-all", asyncHandler(markAllAsRead));
router.patch("/:id/read", validate(notification.id), asyncHandler(markAsRead));

module.exports = router;
