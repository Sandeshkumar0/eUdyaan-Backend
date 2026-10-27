const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getAppointments,
  updateStatus,
} = require('../controllers/appointmentController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const authorizeRoles = require('../middleware/roleMiddleware.js');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { appointment } = require('../validation/schemas');

// Student books an appointment
router.post('/', authMiddleware.protect, authorizeRoles('student'), validate(appointment.create), asyncHandler(bookAppointment));

// User gets their own appointments
router.get('/', authMiddleware.protect, validate(appointment.list), asyncHandler(getAppointments));

// Doctor/Admin updates appointment status
router.patch('/:id/status', authMiddleware.protect, validate(appointment.status), asyncHandler(updateStatus));

module.exports = router;
