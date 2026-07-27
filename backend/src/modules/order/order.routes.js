const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");
const { protect } = require("../../middleware/auth.middleware");
const { orderLimiter } = require("../../middleware/rateLimit.middleware");

router.use(protect);

router.post("/", orderLimiter, orderController.placeOrderFromCart);
router.post("/buy-now", orderLimiter, orderController.buyNow);
router.get("/", orderController.getMyOrders);
router.get("/:id", orderController.getOrderById);

module.exports = router;
