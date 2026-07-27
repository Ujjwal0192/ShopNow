const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { protect } = require("../../middleware/auth.middleware");
const { authLimiter } = require("../../middleware/rateLimit.middleware");
const { validateBody } = require("../../middleware/validate.middleware");
const { registerSchema, loginSchema } = require("./auth.validation");

router.post("/register", authLimiter, validateBody(registerSchema), authController.register);
router.post("/login", authLimiter, validateBody(loginSchema), authController.login);
router.get("/me", protect, authController.getMe);

module.exports = router;
