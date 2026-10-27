require("dotenv").config();

const requiredSecrets = ["DATABASE_URL", "JWT_SECRET"];
for (const key of requiredSecrets) {
  if (!process.env[key]) throw new Error(`${key} is required`);
}
if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must contain at least 32 characters");
}

const app = require("./app");
const { sequelize, connectDB } = require("./config/db");
const { stopClassifier } = require("./services/mentalHealthClassifier");
require("./models");

const port = Number(process.env.PORT || 5000);

const startServer = async () => {
  await connectDB();

  if (process.env.DB_SYNC === "true") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DB_SYNC must not be enabled in production; run migrations instead");
    }
    await sequelize.sync({ alter: process.env.DB_SYNC_ALTER === "true" });
    console.log("✅ Development database synchronized");
  }

  const server = app.listen(port, () => {
    console.log(`✅ Server listening on port ${port}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received; shutting down`);
    server.close(async () => {
      stopClassifier();
      await sequelize.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
