const express = require("express");
const router = express.Router();
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");
const User = require("../../models/user.model");
const { protect } = require("../../middleware/auth.middleware");

router.get(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    sendSuccess(res, 200, "Profile fetched.", req.user.toSafeObject());
  })
);

router.patch(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) {
      const err = new Error("Name is required.");
      err.statusCode = 400;
      throw err;
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true }
    );
    sendSuccess(res, 200, "Profile updated.", user.toSafeObject());
  })
);

module.exports = router;
