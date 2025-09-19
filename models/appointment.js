const { DataTypes } = require('sequelize');
const sequelize = require('../config/db').sequelize;
const User = require('./user');
const Doctor = require('./doctor');

const Appointment = sequelize.define('Appointment', {
  studentId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  },
  doctorId: {
    type: DataTypes.INTEGER,
    references: {
      model: Doctor,
      key: 'id'
    },
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.STRING,
    validate: {
      max: 1000
    }
  }
}, {
  timestamps: true
});

Appointment.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
Appointment.belongsTo(Doctor, { as: 'doctor', foreignKey: 'doctorId' });

module.exports = Appointment;