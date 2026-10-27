const { Appointment, Doctor, DoctorSlot, Notification, User } = require("../models");
const { sequelize } = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response.js");
const { paginationFrom, paginatedData } = require("../utils/pagination");

exports.bookAppointment = async (req, res) => {
  const { slotId, notes } = req.body;
  const appointment = await sequelize.transaction(async (transaction) => {
    const slot = await DoctorSlot.findByPk(slotId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!slot) throw Object.assign(new Error("Appointment slot not found"), { statusCode: 404 });
    if (slot.status !== "available" || new Date(slot.startsAt) <= new Date()) {
      throw Object.assign(new Error("Appointment slot is no longer available"), { statusCode: 409 });
    }

    const created = await Appointment.create(
      {
        studentId: req.user.id,
        doctorId: slot.doctorId,
        slotId: slot.id,
        date: slot.startsAt,
        notes,
      },
      { transaction }
    );
    slot.status = "booked";
    await slot.save({ transaction });
    return created;
  });

  return successResponse(res, "Appointment booked successfully", appointment, 201);
};

exports.getAppointments = async (req, res) => {
  const { page, limit, offset } = paginationFrom(req.validatedQuery);
  let where = {};
  if (req.user.role === "student") where.studentId = req.user.id;
  if (req.user.role === "doctor") {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) return errorResponse(res, "Doctor profile not found", 404);
    where.doctorId = doctor.id;
  }

  const { rows, count } = await Appointment.findAndCountAll({
    where,
    include: [
      { model: User, as: "student", attributes: ["id", "name"] },
      {
        model: Doctor,
        as: "doctor",
        attributes: ["id", "specialization"],
        include: { model: User, as: "user", attributes: ["name"] },
      },
      { model: DoctorSlot, as: "slot", attributes: ["startsAt", "endsAt"] },
    ],
    order: [["date", "ASC"]],
    distinct: true,
    limit,
    offset,
  });
  return successResponse(res, "Appointments fetched successfully", paginatedData(rows, count, page, limit));
};

exports.updateStatus = async (req, res) => {
  const appointment = await sequelize.transaction(async (transaction) => {
    const item = await Appointment.findByPk(req.validatedParams.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!item) return null;

    if (req.user.role === "student") {
      if (item.studentId !== req.user.id || req.body.status !== "cancelled") {
        throw Object.assign(new Error("Not authorized to update this appointment"), { statusCode: 403 });
      }
    } else if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id }, transaction });
      if (!doctor || item.doctorId !== doctor.id) {
        throw Object.assign(new Error("Not authorized to update this appointment"), { statusCode: 403 });
      }
    }

    const transitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["completed", "cancelled"],
      cancelled: [],
      completed: [],
    };
    if (!transitions[item.status].includes(req.body.status)) {
      throw Object.assign(new Error(`Cannot change ${item.status} appointment to ${req.body.status}`), {
        statusCode: 409,
      });
    }

    item.status = req.body.status;
    await item.save({ transaction });
    if (item.status === "cancelled" && item.slotId) {
      await DoctorSlot.update(
        { status: "available" },
        { where: { id: item.slotId, status: "booked" }, transaction }
      );
    }
    await Notification.create(
      {
        userId: item.studentId,
        type: "appointment",
        message: `Your appointment is now ${item.status}`,
        metadata: { appointmentId: item.id },
      },
      { transaction }
    );
    return item;
  });

  if (!appointment) return errorResponse(res, "Appointment not found", 404);
  return successResponse(res, "Appointment status updated", appointment);
};
