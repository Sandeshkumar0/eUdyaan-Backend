const { DataTypes } = require('sequelize');
const sequelize = require('../config/db').sequelize;
const User = require('./user');

const Resource = sequelize.define('Resource', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('video', 'audio', 'article'),
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'general'
  }
}, {
  timestamps: true
});

const Feedback = sequelize.define('Feedback', {
  studentId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  },
  resourceId: {
    type: DataTypes.INTEGER,
    references: {
      model: Resource,
      key: 'id'
    },
    allowNull: false
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    validate: {
      min: 1,
      max: 5
    }
  }
}, {
  timestamps: true
});

Resource.hasMany(Feedback, { foreignKey: 'resourceId' });
Feedback.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

module.exports = { Resource, Feedback };