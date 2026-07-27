const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");

const getCart = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate("items.productId", "name price imageUrl stock isActive");
  if (!cart) return { items: [], totalAmount: 0 };

  const validItems = cart.items.filter((item) => item.productId && item.productId.isActive);
  const totalAmount = validItems.reduce(
    (sum, item) => sum + item.priceAtAdd * item.quantity,
    0
  );

  return { items: validItems, totalAmount };
};

const addToCart = async (userId, productId, quantity = 1) => {
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    const err = new Error("Product not found.");
    err.statusCode = 404;
    throw err;
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    if (product.stock < quantity) {
      const err = new Error(`Only ${product.stock} item(s) available in stock.`);
      err.statusCode = 400;
      throw err;
    }
    cart = await Cart.create({
      userId,
      items: [{ productId, quantity, priceAtAdd: product.price }],
    });
    return cart;
  }

  const existingIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId.toString()
  );

  // Check against the TOTAL requested quantity (what's already in the cart
  // plus what's being added now), not just the incoming amount — otherwise
  // two additions of 3 each pass individually even when stock is only 4.
  const currentQtyInCart = existingIndex > -1 ? cart.items[existingIndex].quantity : 0;
  const newTotalQty = currentQtyInCart + quantity;

  if (product.stock < newTotalQty) {
    const err = new Error(
      `Only ${product.stock} item(s) available — you already have ${currentQtyInCart} in your cart.`
    );
    err.statusCode = 400;
    throw err;
  }

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity = newTotalQty;
  } else {
    cart.items.push({ productId, quantity, priceAtAdd: product.price });
  }

  await cart.save();
  return cart;
};

const updateCartItem = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    const err = new Error("Cart not found.");
    err.statusCode = 404;
    throw err;
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId.toString()
  );

  if (itemIndex === -1) {
    const err = new Error("Item not in cart.");
    err.statusCode = 404;
    throw err;
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      const err = new Error(`Only ${product.stock} item(s) available.`);
      err.statusCode = 400;
      throw err;
    }
    cart.items[itemIndex].quantity = quantity;
  }

  await cart.save();
  return cart;
};

const removeFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    const err = new Error("Cart not found.");
    err.statusCode = 404;
    throw err;
  }

  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId.toString()
  );

  await cart.save();
  return cart;
};

const clearCart = async (userId, options = {}) => {
  await Cart.findOneAndUpdate({ userId }, { items: [] }, { session: options.session });
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
