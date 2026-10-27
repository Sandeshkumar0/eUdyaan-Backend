const express = require("express");
const {
  addResource,
  getResources,
  updateResource,
  deleteResource,
  addFeedback,
  getFeedback,
} = require("../controllers/resourceController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { resource } = require("../validation/schemas");

const router = express.Router();

// Public
router.get("/", validate(resource.list), asyncHandler(getResources));
router.get("/:id/feedback", validate(resource.id), asyncHandler(getFeedback));

// Admin
router.post("/", protect, adminOnly, validate(resource.create), asyncHandler(addResource));
router.put("/:id", protect, adminOnly, validate(resource.update), asyncHandler(updateResource));
router.delete("/:id", protect, adminOnly, validate(resource.id), asyncHandler(deleteResource));

// Student (must be logged in)
router.post("/:id/feedback", protect, authorizeRoles("student"), validate(resource.feedback), asyncHandler(addFeedback));

module.exports = router;
