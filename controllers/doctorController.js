const { Op } = require("sequelize");
const { Doctor, DoctorSlot, User } = require("../models");
const { sequelize } = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response.js");
const { paginationFrom, paginatedData } = require("../utils/pagination");

exports.addDoctor = async (req, res) => {
  const { userId, specialization, experience, bio } = req.body;
  const result = await sequelize.transaction(async (transaction) => {
    const user = await User.unscoped().findByPk(userId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!user) return null;
    if (!user.isActive) throw Object.assign(new Error("User account is inactive"), { statusCode: 400 });

    const existing = await Doctor.findOne({ where: { userId }, transaction });
    if (existing) throw Object.assign(new Error("Doctor profile already exists"), { statusCode: 409 });

    user.role = "doctor";
    await user.save({ transaction });
    return Doctor.create({ userId, specialization, experience, bio }, { transaction });
  });

  if (!result) return errorResponse(res, "User not found", 404);
  return successResponse(res, "Doctor added successfully", result, 201);
};

exports.getDoctors = async (req, res) => {
  const { page, limit, offset } = paginationFrom(req.validatedQuery);
  const where = req.validatedQuery.specialization
    ? { specialization: { [Op.iLike]: `%${req.validatedQuery.specialization}%` } }
    : {};
  const { rows, count } = await Doctor.findAndCountAll({
    where,
    include: [
      { model: User, as: "user", attributes: ["name"] },
      {
        model: DoctorSlot,
        as: "slots",
        attributes: ["id", "startsAt", "endsAt"],
        where: { status: "available", startsAt: { [Op.gt]: new Date() } },
        required: false,
        separate: true,
        order: [["startsAt", "ASC"]],
        limit: 20,
      },
    ],
    distinct: true,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });
  return successResponse(res, "Doctors fetched successfully", paginatedData(rows, count, page, limit));
};

exports.getDoctorById = async (req, res) => {
  const doctor = await Doctor.findByPk(req.validatedParams.id, {
    include: [
      { model: User, as: "user", attributes: ["name"] },
      {
        model: DoctorSlot,
        as: "slots",
        attributes: ["id", "startsAt", "endsAt"],
        where: { status: "available", startsAt: { [Op.gt]: new Date() } },
        required: false,
      },
    ],
  });
  if (!doctor) return errorResponse(res, "Doctor not found", 404);
  return successResponse(res, "Doctor fetched", doctor);
};

exports.addSlot = async (req, res) => {
  const doctor = await Doctor.findByPk(req.validatedParams.id);
  if (!doctor) return errorResponse(res, "Doctor not found", 404);
  if (req.user.role !== "admin" && doctor.userId !== req.user.id) {
    return errorResponse(res, "Not authorized for this doctor", 403);
  }
  if (new Date(req.body.startsAt) <= new Date()) {
    return errorResponse(res, "Slot must be in the future", 400);
  }
  const slot = await DoctorSlot.create({ doctorId: doctor.id, ...req.body });
  return successResponse(res, "Availability slot added", slot, 201);
};

exports.removeSlot = async (req, res) => {
  const slot = await DoctorSlot.findOne({
    where: { id: req.validatedParams.slotId, doctorId: req.validatedParams.id },
    include: { model: Doctor, as: "doctor" },
  });
  if (!slot) return errorResponse(res, "Slot not found", 404);
  if (req.user.role !== "admin" && slot.doctor.userId !== req.user.id) {
    return errorResponse(res, "Not authorized for this doctor", 403);
  }
  if (slot.status === "booked") return errorResponse(res, "A booked slot cannot be removed", 409);
  await slot.destroy();
  return successResponse(res, "Availability slot removed");
};
