const { Sequelize } = require("sequelize");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const useSsl = process.env.DB_SSL === "true";
const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  logging: process.env.DB_LOGGING === "true" ? console.log : false,
  dialectOptions: useSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized:
            process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
        },
      }
    : {},
  pool: {
    max: Number(process.env.DB_POOL_MAX || 10),
    min: Number(process.env.DB_POOL_MIN || 0),
    acquire: 30_000,
    idle: 10_000,
  },
});

const connectDB = async () => {
  await sequelize.authenticate();
  console.log("✅ PostgreSQL connected");
};

module.exports = { sequelize, connectDB };
