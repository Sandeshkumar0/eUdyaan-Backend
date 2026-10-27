const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const MoodEntry = sequelize.define(
  "MoodEntry",
  {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    mood: {
      type: DataTypes.ENUM("happy", "calm", "neutral", "sad", "anxious", "angry"),
      allowNull: false,
    },
    journalEntry: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
      validate: { len: [0, 5000] },
    },
  },
  {
    timestamps: true,
    indexes: [{ unique: true, fields: ["userId", "date"] }],
  }
);

module.exports = MoodEntry;
