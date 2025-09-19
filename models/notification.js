const { DataTypes } = require('sequelize');
const sequelize = require('../config/db').sequelize;
const User = require('./user');

const Notification = sequelize.define('Notification', {
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      max: 500
    }
  },
  type: {
    type: DataTypes.ENUM('appointment', 'reminder', 'general'),
    defaultValue: 'general'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

Notification.belongsTo(User, { foreignKey: 'userId' });

module.exports = Notification;