const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const DoctorSlot = sequelize.define(
  "DoctorSlot",
  {
    doctorId: { type: DataTypes.INTEGER, allowNull: false },
    startsAt: { type: DataTypes.DATE, allowNull: false },
    endsAt: { type: DataTypes.DATE, allowNull: false },
    status: {
      type: DataTypes.ENUM("available", "booked", "unavailable"),
      allowNull: false,
      defaultValue: "available",
    },
  },
  {
    timestamps: true,
    indexes: [
      { unique: true, fields: ["doctorId", "startsAt"] },
      { fields: ["doctorId", "status", "startsAt"] },
    ],
    validate: {
      endsAfterStart() {
        if (new Date(this.endsAt) <= new Date(this.startsAt)) {
          throw new Error("Slot end time must be after its start time");
        }
      },
    },
  }
);

module.exports = DoctorSlot;
