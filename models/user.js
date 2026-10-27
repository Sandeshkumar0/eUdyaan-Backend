const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { len: [2, 100] },
      set(value) {
        this.setDataValue("name", String(value).trim());
      },
    },
    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
      set(value) {
        this.setDataValue("email", String(value).trim().toLowerCase());
      },
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("student", "doctor", "admin"),
      allowNull: false,
      defaultValue: "student",
    },
    schoolInfo: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    tokenVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    defaultScope: { attributes: { exclude: ["password", "tokenVersion"] } },
    scopes: { withPassword: { attributes: {} } },
    hooks: {
      beforeSave: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
    indexes: [{ fields: ["role"] }],
  }
);

User.prototype.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

User.prototype.toSafeJSON = function () {
  const value = this.get({ plain: true });
  delete value.password;
  delete value.tokenVersion;
  delete value.isActive;
  return value;
};

module.exports = User;
