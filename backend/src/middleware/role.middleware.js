const { sendError } = require("../utils/apiResponse");

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return sendError(res, 403, "You do not have permission to perform this action.");
  }
  next();
};

module.exports = { authorize };
