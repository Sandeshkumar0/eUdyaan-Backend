const { DataTypes } = require('sequelize');
const sequelize = require('../config/db').sequelize;
const User = require('./user');

const Doctor = sequelize.define('Doctor', {
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false,
    unique: true
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  availableSlots: {
    type: DataTypes.ARRAY(DataTypes.DATE)
  },
  experience: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0
    }
  },
  bio: {
    type: DataTypes.STRING,
    validate: {
      max: 500
    }
  }
}, {
  timestamps: true
});

Doctor.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Doctor, { foreignKey: 'userId' });

module.exports = Doctor;