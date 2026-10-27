const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Notification = sequelize.define('Notification', {
  userId: {
    type: DataTypes.INTEGER,
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
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  }
}, {
  timestamps: true,
  indexes: [{ fields: ['userId', 'createdAt'] }]
});

module.exports = Notification;
