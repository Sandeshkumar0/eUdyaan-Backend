const { Discussion, Comment, Reply, Like, User } = require("../models");
const { successResponse, errorResponse } = require("../utils/response.js");

// ------------------- STUDENT -------------------

// Add new discussion
const createDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.create({
      userId: req.user.id,
      text: req.body.text,
      media: req.body.media || null,
    });
    return successResponse(res, "Discussion created", discussion, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to create discussion");
  }
};

// Get all discussions
const getDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.findAll({
      include: [
        { model: User, attributes: ['name', 'schoolInfo'] },
        {
          model: Comment,
          include: [
            { model: User, attributes: ['name', 'schoolInfo'] },
            {
              model: Reply,
              include: [{ model: User, attributes: ['name', 'schoolInfo'] }]
            }
          ]
        },
        { model: Like, attributes: ['userId'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return successResponse(res, "Discussions fetched", discussions);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch discussions");
  }
};

// Get single discussion
const getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['name', 'schoolInfo'] },
        {
          model: Comment,
          include: [
            { model: User, attributes: ['name', 'schoolInfo'] },
            {
              model: Reply,
              include: [{ model: User, attributes: ['name', 'schoolInfo'] }]
            }
          ]
        },
        { model: Like, attributes: ['userId'] }
      ]
    });

    if (!discussion) {
      return errorResponse(res, "Discussion not found", 404);
    }

    return successResponse(res, "Discussion fetched", discussion);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch discussion");
  }
};

// Like / Unlike discussion
const toggleLike = async (req, res) => {
  try {
    const discussionId = req.params.id;
    const userId = req.user.id;

    const existingLike = await Like.findOne({ where: { discussionId, userId } });

    if (existingLike) {
      await existingLike.destroy();
    } else {
      await Like.create({ discussionId, userId });
    }

    const likeCount = await Like.count({ where: { discussionId } });

    return successResponse(res, "Like toggled", { likes: likeCount });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to toggle like");
  }
};

// Update discussion (only owner)
const updateDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id);
    if (!discussion) return errorResponse(res, "Discussion not found", 404);

    if (discussion.userId !== req.user.id) {
      return errorResponse(res, "Not authorized", 403);
    }

    discussion.text = req.body.text || discussion.text;
    discussion.media = req.body.media || discussion.media;
    await discussion.save();

    return successResponse(res, "Discussion updated", discussion);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to update discussion");
  }
};

// Add comment
const addComment = async (req, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id);
    if (!discussion) return errorResponse(res, "Discussion not found", 404);

    const comment = await Comment.create({
      discussionId: req.params.id,
      userId: req.user.id,
      text: req.body.text
    });

    return successResponse(res, "Comment added", comment, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to add comment");
  }
};

// Update comment (only owner)
const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) return errorResponse(res, "Comment not found", 404);

    if (comment.userId !== req.user.id) {
      return errorResponse(res, "Not authorized", 403);
    }

    comment.text = req.body.text || comment.text;
    await comment.save();

    return successResponse(res, "Comment updated", comment);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to update comment");
  }
};

// Reply on comment
const addReply = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) return errorResponse(res, "Comment not found", 404);

    const reply = await Reply.create({
      commentId: req.params.commentId,
      userId: req.user.id,
      text: req.body.text
    });

    return successResponse(res, "Reply added", reply, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to add reply");
  }
};

// Update reply (only owner)
const updateReply = async (req, res) => {
  try {
    const reply = await Reply.findByPk(req.params.replyId);
    if (!reply) return errorResponse(res, "Reply not found", 404);

    if (reply.userId !== req.user.id) {
      return errorResponse(res, "Not authorized", 403);
    }

    reply.text = req.body.text || reply.text;
    await reply.save();

    return successResponse(res, "Reply updated", reply);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to update reply");
  }
};

// ------------------- ADMIN -------------------
const deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id);
    if (!discussion) return errorResponse(res, "Discussion not found", 404);
    await discussion.destroy();
    return successResponse(res, "Discussion deleted");
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to delete discussion");
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) return errorResponse(res, "Comment not found", 404);
    await comment.destroy();
    return successResponse(res, "Comment deleted");
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to delete comment");
  }
};

const deleteReply = async (req, res) => {
  try {
    const reply = await Reply.findByPk(req.params.replyId);
    if (!reply) return errorResponse(res, "Reply not found", 404);
    await reply.destroy();
    return successResponse(res, "Reply deleted");
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to delete reply");
  }
};

module.exports = {
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
};