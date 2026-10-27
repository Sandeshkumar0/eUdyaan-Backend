const { Discussion, Comment, Reply, Like, User } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");
const { paginationFrom, paginatedData } = require("../utils/pagination");

const includeTree = [
  { model: User, as: "author", attributes: ["name"] },
  {
    model: Comment,
    as: "comments",
    include: [
      { model: User, as: "author", attributes: ["name"] },
      {
        model: Reply,
        as: "replies",
        include: [{ model: User, as: "author", attributes: ["name"] }],
      },
    ],
  },
  { model: Like, as: "likes", attributes: ["id"] },
];

const redactAuthor = (item) => {
  const authorName = item.anonymous ? "Anonymous" : item.author?.name || "Member";
  delete item.userId;
  delete item.author;
  item.authorName = authorName;
  return item;
};

const sanitizeDiscussion = (instance) => {
  const item = redactAuthor(instance.get({ plain: true }));
  item.likeCount = item.likes?.length || 0;
  delete item.likes;
  item.comments = (item.comments || []).map((comment) => {
    redactAuthor(comment);
    comment.replies = (comment.replies || []).map(redactAuthor);
    return comment;
  });
  return item;
};

exports.createDiscussion = async (req, res) => {
  const discussion = await Discussion.create({ userId: req.user.id, ...req.body });
  return successResponse(res, "Discussion created", sanitizeDiscussion(discussion), 201);
};

exports.getDiscussions = async (req, res) => {
  const { page, limit, offset } = paginationFrom(req.validatedQuery);
  const { rows, count } = await Discussion.findAndCountAll({
    include: includeTree,
    distinct: true,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });
  return successResponse(
    res,
    "Discussions fetched",
    paginatedData(rows.map(sanitizeDiscussion), count, page, limit)
  );
};

exports.getDiscussionById = async (req, res) => {
  const discussion = await Discussion.findByPk(req.validatedParams.id, { include: includeTree });
  if (!discussion) return errorResponse(res, "Discussion not found", 404);
  return successResponse(res, "Discussion fetched", sanitizeDiscussion(discussion));
};

exports.toggleLike = async (req, res) => {
  const discussionId = req.validatedParams.id;
  if (!(await Discussion.findByPk(discussionId, { attributes: ["id"] }))) {
    return errorResponse(res, "Discussion not found", 404);
  }
  const existing = await Like.findOne({ where: { discussionId, userId: req.user.id } });
  let liked;
  if (existing) {
    await existing.destroy();
    liked = false;
  } else {
    await Like.create({ discussionId, userId: req.user.id });
    liked = true;
  }
  const likeCount = await Like.count({ where: { discussionId } });
  return successResponse(res, "Like updated", { liked, likeCount });
};

exports.updateDiscussion = async (req, res) => {
  const discussion = await Discussion.findByPk(req.validatedParams.id);
  if (!discussion) return errorResponse(res, "Discussion not found", 404);
  if (discussion.userId !== req.user.id) return errorResponse(res, "Not authorized", 403);
  for (const key of ["text", "media", "anonymous"]) {
    if (Object.hasOwn(req.body, key)) discussion[key] = req.body[key];
  }
  await discussion.save();
  return successResponse(res, "Discussion updated", sanitizeDiscussion(discussion));
};

exports.addComment = async (req, res) => {
  const discussionId = req.validatedParams.id;
  if (!(await Discussion.findByPk(discussionId, { attributes: ["id"] }))) {
    return errorResponse(res, "Discussion not found", 404);
  }
  const comment = await Comment.create({ discussionId, userId: req.user.id, ...req.body });
  return successResponse(res, "Comment added", redactAuthor(comment.get({ plain: true })), 201);
};

exports.updateComment = async (req, res) => {
  const { id: discussionId, commentId } = req.validatedParams;
  const comment = await Comment.findOne({ where: { id: commentId, discussionId } });
  if (!comment) return errorResponse(res, "Comment not found", 404);
  if (comment.userId !== req.user.id) return errorResponse(res, "Not authorized", 403);
  if (Object.hasOwn(req.body, "text")) comment.text = req.body.text;
  if (Object.hasOwn(req.body, "anonymous")) comment.anonymous = req.body.anonymous;
  await comment.save();
  return successResponse(res, "Comment updated", redactAuthor(comment.get({ plain: true })));
};

exports.addReply = async (req, res) => {
  const { id: discussionId, commentId } = req.validatedParams;
  const comment = await Comment.findOne({ where: { id: commentId, discussionId } });
  if (!comment) return errorResponse(res, "Comment not found", 404);
  const reply = await Reply.create({ commentId, userId: req.user.id, ...req.body });
  return successResponse(res, "Reply added", redactAuthor(reply.get({ plain: true })), 201);
};

exports.updateReply = async (req, res) => {
  const { id: discussionId, commentId, replyId } = req.validatedParams;
  const comment = await Comment.findOne({ where: { id: commentId, discussionId } });
  if (!comment) return errorResponse(res, "Comment not found", 404);
  const reply = await Reply.findOne({ where: { id: replyId, commentId } });
  if (!reply) return errorResponse(res, "Reply not found", 404);
  if (reply.userId !== req.user.id) return errorResponse(res, "Not authorized", 403);
  if (Object.hasOwn(req.body, "text")) reply.text = req.body.text;
  if (Object.hasOwn(req.body, "anonymous")) reply.anonymous = req.body.anonymous;
  await reply.save();
  return successResponse(res, "Reply updated", redactAuthor(reply.get({ plain: true })));
};

exports.deleteDiscussion = async (req, res) => {
  const deleted = await Discussion.destroy({ where: { id: req.validatedParams.id } });
  if (!deleted) return errorResponse(res, "Discussion not found", 404);
  return successResponse(res, "Discussion deleted");
};

exports.deleteComment = async (req, res) => {
  const deleted = await Comment.destroy({
    where: { id: req.validatedParams.commentId, discussionId: req.validatedParams.id },
  });
  if (!deleted) return errorResponse(res, "Comment not found", 404);
  return successResponse(res, "Comment deleted");
};

exports.deleteReply = async (req, res) => {
  const { id: discussionId, commentId, replyId } = req.validatedParams;
  const comment = await Comment.findOne({ where: { id: commentId, discussionId } });
  if (!comment) return errorResponse(res, "Comment not found", 404);
  const deleted = await Reply.destroy({ where: { id: replyId, commentId } });
  if (!deleted) return errorResponse(res, "Reply not found", 404);
  return successResponse(res, "Reply deleted");
};
