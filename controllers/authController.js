const { User } = require("../models");
const jwt = require("jsonwebtoken");
const { successResponse, errorResponse, authResponse } = require("../utils/response.js");

const generateToken = (user) => {
  return jwt.sign({ tokenVersion: user.tokenVersion }, process.env.JWT_SECRET, {
    subject: String(user.id),
    algorithm: "HS256",
    issuer: process.env.JWT_ISSUER || "eudyaan-api",
    audience: process.env.JWT_AUDIENCE || "eudyaan-mobile",
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, schoolInfo } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return errorResponse(res, "User already exists", 400);
    }

    // Public signup is intentionally locked to student. Doctor/admin accounts are
    // promoted only through an authenticated administrative workflow.
    const user = await User.create({ name, email, password, schoolInfo, role: "student" });
    const token = generateToken(user);
    return authResponse(res, "User registered successfully", token, user.toSafeJSON(), 201);
  } catch (err) {
    console.error(err);
    if (err.name === "SequelizeUniqueConstraintError") {
      return errorResponse(res, "User already exists", 409);
    }
    return errorResponse(res, "Registration failed", 400);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.scope("withPassword").findOne({ where: { email } });
    if (!user || !user.isActive || !(await user.matchPassword(password))) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const token = generateToken(user);
    return authResponse(res, "Login successful", token, user.toSafeJSON());
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Login failed");
  }
};

exports.getProfile = async (req, res) => {
  return successResponse(res, "Profile fetched successfully", req.user.toSafeJSON());
};

exports.updateProfile = async (req, res) => {
  const user = await User.unscoped().findByPk(req.user.id);
  if (Object.hasOwn(req.body, "name")) user.name = req.body.name;
  if (Object.hasOwn(req.body, "schoolInfo")) user.schoolInfo = req.body.schoolInfo;
  await user.save();
  return successResponse(res, "Profile updated", user.toSafeJSON());
};

exports.changePassword = async (req, res) => {
  const user = await User.scope("withPassword").findByPk(req.user.id);
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return errorResponse(res, "Current password is incorrect", 401);
  }
  user.password = req.body.newPassword;
  user.tokenVersion += 1;
  await user.save();
  return successResponse(res, "Password changed; please sign in again");
};

exports.logout = async (req, res) => {
  await User.unscoped().increment("tokenVersion", { where: { id: req.user.id } });
  return successResponse(res, "Signed out from all sessions");
};
