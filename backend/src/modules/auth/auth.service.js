const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const env = require("../../config/env");

const generateToken = (userId) =>
  jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error("Email already registered.");
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  const token = generateToken(user._id);

  return { user: user.toSafeObject(), token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("Invalid email or password.");
    err.statusCode = 401;
    throw err;
  }

  const passwordMatch = await user.comparePassword(password);
  if (!passwordMatch) {
    const err = new Error("Invalid email or password.");
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user._id);
  return { user: user.toSafeObject(), token };
};

module.exports = { register, login };
