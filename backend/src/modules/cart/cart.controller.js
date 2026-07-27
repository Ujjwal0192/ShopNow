const cartService = require("./cart.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);
  sendSuccess(res, 200, "Cart fetched.", cart);
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) {
    const err = new Error("productId is required.");
    err.statusCode = 400;
    throw err;
  }
  const cart = await cartService.addToCart(req.user._id, productId, quantity || 1);
  sendSuccess(res, 200, "Item added to cart.", cart);
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (quantity === undefined) {
    const err = new Error("quantity is required.");
    err.statusCode = 400;
    throw err;
  }
  const cart = await cartService.updateCartItem(req.user._id, req.params.productId, quantity);
  sendSuccess(res, 200, "Cart updated.", cart);
});

const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await cartService.removeFromCart(req.user._id, req.params.productId);
  sendSuccess(res, 200, "Item removed from cart.", cart);
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
