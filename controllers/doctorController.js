const { Doctor, User } = require("../models");
const { successResponse, errorResponse } = require("../utils/response.js");

// Register doctor (admin only)
exports.addDoctor = async (req, res) => {
  try {
    const { userId, specialization, availableSlots, experience, bio } = req.body;

    const user = await User.findByPk(userId);
    if (!user || user.role !== "doctor") {
      return errorResponse(res, "User is not a doctor", 400);
    }

    const doctor = await Doctor.create({ userId, specialization, availableSlots, experience, bio });
    return successResponse(res, "Doctor added successfully", doctor, 201);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Error adding doctor");
  }
};

// Get all doctors
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: {
        model: User,
        attributes: ['name', 'email']
      }
    });
    return successResponse(res, "Doctors fetched successfully", doctors);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Error fetching doctors");
  }
};