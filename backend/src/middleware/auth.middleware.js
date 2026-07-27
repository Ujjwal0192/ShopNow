const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const env = require("../config/env");
const { sendError } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, "Access denied. No token provided.");
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(token, env.JWT_SECRET);
  const user = await User.findById(decoded.userId).select("-passwordHash");

  if (!user) {
    return sendError(res, 401, "User no longer exists.");
  }

  req.user = user;
  next();
});

module.exports = { protect };
