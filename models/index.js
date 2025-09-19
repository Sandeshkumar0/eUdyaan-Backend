const User = require('./user');
const Doctor = require('./doctor');
const Appointment = require('./appointment');
const { Discussion, Comment, Reply, Like } = require('./discussion');
const Chat = require('./chat');
const Notification = require('./notification');
const { Resource, Feedback } = require('./resource');

module.exports = {
  User,
  Doctor,
  Appointment,
  Discussion,
  Comment,
  Reply,
  Like,
  Chat,
  Notification,
  Resource,
  Feedback
};
