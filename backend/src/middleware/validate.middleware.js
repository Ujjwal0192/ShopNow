const { sendError } = require("../utils/apiResponse");

/**
 * Wraps a Zod schema as Express middleware. Validates req.body, replaces it
 * with the parsed (and type-coerced) result so controllers can trust the
 * shape of what they receive instead of re-checking it. Previously only
 * auth.controller.js did manual `if (!x)` checks — everything else passed
 * req.body straight to Mongoose, relying entirely on schema-level
 * validation that never runs until the DB call.
 */
const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    return sendError(res, 400, message);
  }
  req.body = result.data;
  next();
};

module.exports = { validateBody };
