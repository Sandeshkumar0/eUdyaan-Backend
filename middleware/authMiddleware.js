const jwt = require("jsonwebtoken");
const { User } = require("../models");

const protect = async (req, res, next) => {
  const authorization = req.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: process.env.JWT_ISSUER || "eudyaan-api",
      audience: process.env.JWT_AUDIENCE || "eudyaan-mobile",
    });
    const user = await User.unscoped().findByPk(decoded.sub, {
      attributes: { exclude: ["password"] },
    });

    if (!user || !user.isActive || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ success: false, message: "Session is no longer valid" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Access denied: admin only" });
  }
};

module.exports = { protect, adminOnly };
