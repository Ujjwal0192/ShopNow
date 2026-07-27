require("dotenv").config();

const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  REDIS_URL: process.env.REDIS_URL || null,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  NODE_ENV: process.env.NODE_ENV || "development",
};

const required = ["MONGODB_URI", "JWT_SECRET"];
const missing = required.filter((key) => !env[key]);

if (missing.length > 0) {
  console.error(`Missing required env variables: ${missing.join(", ")}`);
  process.exit(1);
}

module.exports = env;