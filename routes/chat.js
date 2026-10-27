const express = require("express");
const { sendMessage, getMessages } = require("../controllers/chatController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { chatLimiter } = require("../middleware/rateLimit");
const { chat } = require("../validation/schemas");

const router = express.Router();

// ✅ Send a new chat message (student/doctor/bot)
router.post("/", authMiddleware.protect, chatLimiter, validate(chat.send), asyncHandler(sendMessage));

// ✅ Get all chat messages between 2 users (or with bot)
router.get("/:receiverId", authMiddleware.protect, validate(chat.history), asyncHandler(getMessages));

module.exports = router;
