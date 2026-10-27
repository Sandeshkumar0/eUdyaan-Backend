const { Resource, Feedback } = require("../models");
const { successResponse, errorResponse } = require("../utils/response.js");
const { paginationFrom, paginatedData } = require("../utils/pagination");

// @desc    Add a new resource
// @route   POST /api/resources
// @access  Private/Admin
const addResource = async (req, res) => {
  try {
    const { title, type, url, category } = req.body;
    const resource = await Resource.create({ title, type, url, category });
    return successResponse(res, "Resource added successfully", resource, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to add resource", 400);
  }
};

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
const getResources = async (req, res) => {
  try {
    const { page, limit, offset } = paginationFrom(req.validatedQuery);
    const where = {};
    if (req.validatedQuery.type) where.type = req.validatedQuery.type;
    if (req.validatedQuery.category) where.category = req.validatedQuery.category;
    const { rows, count } = await Resource.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
    return successResponse(res, "Resources fetched successfully", paginatedData(rows, count, page, limit));
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch resources");
  }
};

// @desc    Update a resource
// @route   PUT /api/resources/:id
// @access  Private/Admin
const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, url, category } = req.body;

    const resource = await Resource.findByPk(id);

    if (!resource) {
      return errorResponse(res, "Resource not found", 404);
    }

    if (title !== undefined) resource.title = title;
    if (type !== undefined) resource.type = type;
    if (url !== undefined) resource.url = url;
    if (category !== undefined) resource.category = category;

    const updatedResource = await resource.save();
    return successResponse(res, "Resource updated successfully", updatedResource);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to update resource", 400);
  }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private/Admin
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByPk(id);

    if (!resource) {
      return errorResponse(res, "Resource not found", 404);
    }

    await resource.destroy();
    return successResponse(res, "Resource removed successfully");
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to delete resource");
  }
};

// Add feedback (Student only)
const addFeedback = async (req, res) => {
  try {
    const { id } = req.params; // resource id
    const { comment, rating } = req.body;

    const resource = await Resource.findByPk(id);
    if (!resource) {
      return errorResponse(res, "Resource not found", 404);
    }

    const [feedback, created] = await Feedback.findOrCreate({
      where: { studentId: req.user.id, resourceId: id },
      defaults: { comment, rating },
    });
    if (!created) {
      feedback.comment = comment;
      feedback.rating = rating;
      await feedback.save();
    }

    return successResponse(res, created ? "Feedback added" : "Feedback updated", feedback, created ? 201 : 200);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to add feedback");
  }
};

// View feedback of a resource (Public)
const getFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findAll({
      where: { resourceId: id },
      attributes: ["id", "comment", "rating", "createdAt"]
    });

    return successResponse(res, "Feedback fetched successfully", feedback);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch feedback");
  }
};

module.exports = {
  addResource,
  getResources,
  updateResource,
  deleteResource,
  addFeedback,
  getFeedback,
};
