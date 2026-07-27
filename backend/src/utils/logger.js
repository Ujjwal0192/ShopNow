const winston = require("winston");
const env = require("../config/env");

// Production: pure JSON lines — easy to pipe into any log aggregator
// (CloudWatch, Datadog, whatever) without a parsing step.
// Development: human-readable, colorized, matches what you'd want staring
// at a terminal while debugging.
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${level}: ${message}${metaStr}`;
  })
);

const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: env.NODE_ENV === "production" ? productionFormat : developmentFormat,
  transports: [new winston.transports.Console()],
  // Uncaught exceptions and unhandled rejections still crash the process —
  // that's intentional (a corrupted process shouldn't keep serving traffic)
  // — but they get logged with full context on the way out instead of just
  // dumping a raw stack trace to stdout.
  exceptionHandlers: [new winston.transports.Console()],
  rejectionHandlers: [new winston.transports.Console()],
});

module.exports = logger;
