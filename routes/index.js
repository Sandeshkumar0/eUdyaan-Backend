const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.js');
const chatRoutes = require('./chat.js');
const discussionRoutes = require('./discussion.js');
const appointmentRoutes = require('./appointment.js');
const resourceRoutes = require('./resource.js');
const doctorRoutes = require('./doctor.js');
const notificationRoutes = require('./notification.js');
const moodRoutes = require('./mood.js');

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/discussion', discussionRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/resources', resourceRoutes);
router.use('/doctors', doctorRoutes);
router.use('/notifications', notificationRoutes);
router.use('/moods', moodRoutes);

module.exports = router;
