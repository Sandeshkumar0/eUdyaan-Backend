const User = require('./user');
const Doctor = require('./doctor');
const Appointment = require('./appointment');
const { Discussion, Comment, Reply, Like } = require('./discussion');
const Chat = require('./chat');
const Notification = require('./notification');
const { Resource, Feedback } = require('./resource');
const DoctorSlot = require('./doctorSlot');
const MoodEntry = require('./moodEntry');

User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctorProfile', onDelete: 'CASCADE' });
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Doctor.hasMany(DoctorSlot, { foreignKey: 'doctorId', as: 'slots', onDelete: 'CASCADE' });
DoctorSlot.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

User.hasMany(Appointment, { foreignKey: 'studentId', as: 'appointments', onDelete: 'CASCADE' });
Appointment.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments', onDelete: 'RESTRICT' });
Appointment.belongsTo(Doctor, { as: 'doctor', foreignKey: 'doctorId' });
DoctorSlot.hasOne(Appointment, { foreignKey: 'slotId', as: 'appointment', onDelete: 'RESTRICT' });
Appointment.belongsTo(DoctorSlot, { foreignKey: 'slotId', as: 'slot' });

User.hasMany(Discussion, { foreignKey: 'userId', onDelete: 'CASCADE' });
Discussion.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Discussion.hasMany(Comment, { foreignKey: 'discussionId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Discussion, { foreignKey: 'discussionId' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Comment.hasMany(Reply, { foreignKey: 'commentId', as: 'replies', onDelete: 'CASCADE' });
Reply.belongsTo(Comment, { foreignKey: 'commentId' });
Reply.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Discussion.hasMany(Like, { foreignKey: 'discussionId', as: 'likes', onDelete: 'CASCADE' });
Like.belongsTo(Discussion, { foreignKey: 'discussionId' });
Like.belongsTo(User, { foreignKey: 'userId' });

Chat.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Chat.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });

Resource.hasMany(Feedback, { foreignKey: 'resourceId', as: 'feedback', onDelete: 'CASCADE' });
Feedback.belongsTo(Resource, { foreignKey: 'resourceId', as: 'resource' });
Feedback.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

MoodEntry.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(MoodEntry, { foreignKey: 'userId', as: 'moodEntries', onDelete: 'CASCADE' });

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
  Feedback,
  DoctorSlot,
  MoodEntry
};
