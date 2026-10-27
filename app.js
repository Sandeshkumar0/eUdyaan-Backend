const crypto = require("crypto");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const apiRoutes = require("./routes");
const { apiLimiter } = require("./middleware/rateLimit");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS || 0));
app.use((req, res, next) => {
  req.id = req.get("x-request-id") || crypto.randomUUID();
  res.set("x-request-id", req.id);
  next();
});
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(Object.assign(new Error("Origin not allowed"), { statusCode: 403 }));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Request-Id"],
    maxAge: 86_400,
  })
);
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "50kb" }));
app.use(express.urlencoded({ extended: false, limit: "20kb" }));

app.get("/", (req, res) => {
  res.json({ success: true, message: "eUdyaan API is running", version: "2.0.0" });
});
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api", apiLimiter, apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
