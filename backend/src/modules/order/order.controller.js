const orderService = require("./order.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");

const placeOrderFromCart = asyncHandler(async (req, res) => {
  const { deliveryAddress } = req.body;
  if (!deliveryAddress) {
    const err = new Error("Delivery address is required.");
    err.statusCode = 400;
    throw err;
  }
  const order = await orderService.placeOrderFromCart(req.user._id, deliveryAddress);
  sendSuccess(res, 201, "Order placed successfully.", order);
});

const buyNow = asyncHandler(async (req, res) => {
  const { productId, quantity, deliveryAddress } = req.body;
  if (!productId || !deliveryAddress) {
    const err = new Error("productId and deliveryAddress are required.");
    err.statusCode = 400;
    throw err;
  }
  const order = await orderService.buyNow(
    req.user._id,
    productId,
    quantity || 1,
    deliveryAddress
  );
  sendSuccess(res, 201, "Order placed successfully.", order);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getUserOrders(req.user._id, req.query);
  sendSuccess(res, 200, "Orders fetched.", result);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user._id);
  sendSuccess(res, 200, "Order fetched.", order);
});

module.exports = { placeOrderFromCart, buyNow, getMyOrders, getOrderById };
