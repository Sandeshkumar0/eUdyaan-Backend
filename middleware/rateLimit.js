const { rateLimit } = require("express-rate-limit");

const makeLimiter = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message },
  });

exports.apiLimiter = makeLimiter(
  15 * 60 * 1000,
  Number(process.env.API_RATE_LIMIT || 500),
  "Too many requests; please try again later"
);

exports.authLimiter = makeLimiter(
  15 * 60 * 1000,
  Number(process.env.AUTH_RATE_LIMIT || 20),
  "Too many authentication attempts; please try again later"
);

exports.chatLimiter = makeLimiter(
  60 * 1000,
  Number(process.env.CHAT_RATE_LIMIT || 10),
  "Too many chat messages; please slow down"
);
