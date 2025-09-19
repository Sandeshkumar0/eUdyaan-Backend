const { DataTypes } = require('sequelize');
const sequelize = require('../config/db').sequelize;
const User = require('./user');

const Chat = sequelize.define('Chat', {
  senderId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  },
  receiverId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
    validate: {
      max: 2000
    }
  },
  type: {
    type: DataTypes.ENUM('student', 'doctor', 'bot'),
    defaultValue: 'student'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

Chat.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Chat.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

module.exports = Chat;