const authService = require("./auth.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");

const register = asyncHandler(async (req, res) => {
  // req.body is already validated + normalized (trimmed, lowercased email)
  // by validateBody(registerSchema) in auth.routes.js.
  const result = await authService.register(req.body);
  sendSuccess(res, 201, "Account created successfully.", result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, 200, "Login successful.", result);
});

const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "User fetched.", req.user.toSafeObject());
});

module.exports = { register, login, getMe };
