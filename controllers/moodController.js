const { Op } = require("sequelize");
const { MoodEntry } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");

exports.saveMood = async (req, res) => {
  const [entry, created] = await MoodEntry.findOrCreate({
    where: { userId: req.user.id, date: req.body.date },
    defaults: { ...req.body, userId: req.user.id },
  });
  if (!created) {
    entry.mood = req.body.mood;
    entry.journalEntry = req.body.journalEntry;
    await entry.save();
  }
  return successResponse(res, created ? "Mood entry created" : "Mood entry updated", entry, created ? 201 : 200);
};

exports.getMoods = async (req, res) => {
  const { from, to } = req.validatedQuery;
  const date = {};
  if (from) date[Op.gte] = from;
  if (to) date[Op.lte] = to;
  const where = { userId: req.user.id };
  if (Object.keys(date).length) where.date = date;
  const entries = await MoodEntry.findAll({ where, order: [["date", "ASC"]] });
  return successResponse(res, "Mood entries fetched", entries);
};

exports.deleteMood = async (req, res) => {
  const deleted = await MoodEntry.destroy({
    where: { id: req.validatedParams.id, userId: req.user.id },
  });
  if (!deleted) return errorResponse(res, "Mood entry not found", 404);
  return successResponse(res, "Mood entry deleted");
};
