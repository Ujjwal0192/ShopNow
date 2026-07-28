require("dotenv").config();

const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  REDIS_URL: process.env.REDIS_URL || null,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  NODE_ENV: process.env.NODE_ENV || "development",

   // Resend — sandbox sender until a domain is verified (see notification.service.js)
  RESEND_API_KEY: process.env.RESEND_API_KEY || null,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
};

const required = ["MONGODB_URI", "JWT_SECRET"];
const missing = required.filter((key) => !env[key]);

if (missing.length > 0) {
  console.error(`Missing required env variables: ${missing.join(", ")}`);
  process.exit(1);
}

// Not fatal — an order must still get created and confirmed even if email
// isn't configured yet; it just skips sending the confirmation (see
// notification.service.js).
if (!env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY not set — order confirmation emails will not be sent.");
}

module.exports = env;