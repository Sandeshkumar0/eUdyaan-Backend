const { Appointment, Doctor, User } = require("../models");
const { successResponse, errorResponse } = require("../utils/response.js");

// Book appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, notes } = req.body;

    const appointment = await Appointment.create({
      studentId: req.user.id,
      doctorId,
      date,
      notes,
    });

    return successResponse(res, "Appointment booked successfully", appointment, 201);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Error booking appointment");
  }
};

// Get user’s appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { studentId: req.user.id },
      include: {
        model: Doctor,
        as: 'doctor',
        attributes: ['specialization'],
        include: {
          model: User,
          attributes: ['name', 'email']
        }
      },
      order: [['date', 'ASC']]
    });

    return successResponse(res, "Appointments fetched successfully", appointments);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Error fetching appointments");
  }
};

// Update appointment status (doctor/admin)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return errorResponse(res, "Appointment not found", 404);
    }

    appointment.status = status;
    await appointment.save();

    return successResponse(res, "Appointment status updated", appointment);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Error updating status");
  }
};