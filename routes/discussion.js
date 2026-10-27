const express = require("express");
const router = express.Router();
const {
  createDiscussion,
  getDiscussions,
  getDiscussionById,
  toggleLike,
  updateDiscussion,
  addComment,
  updateComment,
  addReply,
  updateReply,
  deleteDiscussion,
  deleteComment,
  deleteReply,
} = require("../controllers/discussionController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { discussion } = require("../validation/schemas");

// @route   GET & POST /api/discussions
router.route("/").get(validate(discussion.list), asyncHandler(getDiscussions)).post(protect, validate(discussion.create), asyncHandler(createDiscussion));

// @route   GET, PUT & DELETE /api/discussions/:id
router
  .route("/:id")
  .get(validate(discussion.id), asyncHandler(getDiscussionById))
  .put(protect, validate(discussion.update), asyncHandler(updateDiscussion))
  .delete(protect, adminOnly, validate(discussion.id), asyncHandler(deleteDiscussion));

// @route   POST /api/discussions/:id/like
router.route("/:id/like").post(protect, validate(discussion.id), asyncHandler(toggleLike));

// @route   POST /api/discussions/:id/comments
router.route("/:id/comments").post(protect, validate(discussion.comment), asyncHandler(addComment));

// @route   PUT & DELETE /api/discussions/:id/comments/:commentId
router
  .route("/:id/comments/:commentId")
  .put(protect, validate(discussion.commentItem), asyncHandler(updateComment))
  .delete(protect, adminOnly, validate(discussion.commentPath), asyncHandler(deleteComment));

// @route   POST /api/discussions/:id/comments/:commentId/replies
router.route("/:id/comments/:commentId/replies").post(protect, validate(discussion.reply), asyncHandler(addReply));

// @route   PUT & DELETE /api/discussions/:id/comments/:commentId/replies/:replyId
router
  .route("/:id/comments/:commentId/replies/:replyId")
  .put(protect, validate(discussion.replyItem), asyncHandler(updateReply))
  .delete(protect, adminOnly, validate(discussion.replyPath), asyncHandler(deleteReply));

module.exports = router;
