const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Chat = sequelize.define('Chat', {
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 2000]
    }
  },
  type: {
    type: DataTypes.ENUM('student', 'doctor', 'bot'),
    defaultValue: 'student'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  analysis: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['senderId', 'receiverId', 'createdAt'] },
    { fields: ['receiverId', 'isRead'] }
  ]
});

module.exports = Chat;
