const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Doctor = sequelize.define('Doctor', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [2, 120] }
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

module.exports = Doctor;
