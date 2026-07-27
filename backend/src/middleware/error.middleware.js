const logger = require("../utils/logger");
const { sendError } = require("../utils/apiResponse");

const errorHandler = (err, req, res, next) => {
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 400, "Validation failed", errors);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, 409, `${field} already exists.`);
  }

  if (err.name === "JsonWebTokenError") {
    return sendError(res, 401, "Invalid token.");
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, 401, "Token expired.");
  }

  if (err.name === "CastError") {
    return sendError(res, 400, "Invalid ID format.");
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error." : err.message;
  return sendError(res, statusCode, message);
};

const notFound = (req, res) => {
  sendError(res, 404, `Route ${req.originalUrl} not found.`);
};

module.exports = { errorHandler, notFound };
