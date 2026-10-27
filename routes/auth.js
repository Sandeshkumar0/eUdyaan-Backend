const express = require("express");
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
} = require("../controllers/authController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const authorizeRoles = require("../middleware/roleMiddleware.js");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { authLimiter } = require("../middleware/rateLimit");
const { auth } = require("../validation/schemas");

const router = express.Router();

// Signup
router.post("/signup", authLimiter, validate(auth.signup), asyncHandler(register));

// Login
router.post("/login", authLimiter, validate(auth.login), asyncHandler(login));

// Profile route (any logged-in user)
router.get("/me", authMiddleware.protect, asyncHandler(getProfile));
router.patch("/me", authMiddleware.protect, validate(auth.updateProfile), asyncHandler(updateProfile));
router.post(
  "/change-password",
  authMiddleware.protect,
  authLimiter,
  validate(auth.changePassword),
  asyncHandler(changePassword)
);
router.post("/logout", authMiddleware.protect, asyncHandler(logout));

// Admin-only route
router.get("/admin", authMiddleware.protect, authorizeRoles("admin"), (req, res) => {
  res.json({ msg: "Welcome Admin 🚀", user: req.user });
});

module.exports = router;
