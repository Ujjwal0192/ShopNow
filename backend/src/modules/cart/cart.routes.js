const express = require("express");
const router = express.Router();
const cartController = require("./cart.controller");
const { protect } = require("../../middleware/auth.middleware");

router.use(protect);

router.get("/", cartController.getCart);
router.post("/items", cartController.addToCart);
router.patch("/items/:productId", cartController.updateCartItem);
router.delete("/items/:productId", cartController.removeFromCart);

module.exports = router;
