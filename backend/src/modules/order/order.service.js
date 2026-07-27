const mongoose = require("mongoose");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const Cart = require("../../models/cart.model");
const cartService = require("../cart/cart.service");
const { sanitizePagination } = require("../../utils/pagination");

const VALID_TRANSITIONS = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const placeOrderFromCart = async (userId, deliveryAddress) => {
  const cart = await Cart.findOne({ userId }).populate("items.productId");

  if (!cart || cart.items.length === 0) {
    const err = new Error("Your cart is empty.");
    err.statusCode = 400;
    throw err;
  }

  /*
   * CORE INVENTORY CONSISTENCY:
   * Wrapped in a real MongoDB transaction (requires a replica set — MongoDB
   * Atlas gives you this by default; a standalone local `mongod` does not).
   *
   * Previously this used per-item atomic findOneAndUpdate calls plus a
   * manual rollback loop in the catch block. That handled the common case
   * (one item fails validation, roll back the ones that succeeded) but had
   * a real gap: if the Node process crashed *between* a successful
   * decrement and the rollback running — not just threw an error, but
   * actually died — stock stayed decremented with no order ever created.
   * A transaction closes that gap: MongoDB guarantees every operation in
   * the session either all commits or all aborts, even across a process
   * crash, because the abort is driven by the session/transaction state
   * on the server, not by application code that has to survive to run it.
   */
  const session = await mongoose.startSession();
  let order;

  try {
    await session.withTransaction(async () => {
      const orderItems = [];
      let totalAmount = 0;

      for (const cartItem of cart.items) {
        const product = cartItem.productId;

        if (!product || !product.isActive) {
          const err = new Error(`Product "${product?.name || "unknown"}" is no longer available.`);
          err.statusCode = 400;
          throw err;
        }

        const updatedProduct = await Product.findOneAndUpdate(
          { _id: product._id, stock: { $gte: cartItem.quantity } },
          { $inc: { stock: -cartItem.quantity } },
          { new: true, session }
        );

        if (!updatedProduct) {
          const err = new Error(
            `"${product.name}" is out of stock or has insufficient quantity.`
          );
          err.statusCode = 409;
          throw err;
        }

        orderItems.push({
          productId: product._id,
          name: product.name,
          quantity: cartItem.quantity,
          priceAtOrder: cartItem.priceAtAdd,
        });

        totalAmount += cartItem.priceAtAdd * cartItem.quantity;
      }

      const created = await Order.create(
        [{
          userId,
          items: orderItems,
          totalAmount,
          deliveryAddress,
          status: "PLACED",
          paymentMethod: "COD",
        }],
        { session }
      );
      order = created[0];

      await cartService.clearCart(userId, { session });
    });
  } finally {
    await session.endSession();
  }

  return order;
};

const buyNow = async (userId, productId, quantity, deliveryAddress) => {
  const product = await Product.findOne({ _id: productId, isActive: true });

  if (!product) {
    const err = new Error("Product not found.");
    err.statusCode = 404;
    throw err;
  }

  const session = await mongoose.startSession();
  let order;

  try {
    await session.withTransaction(async () => {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true, session }
      );

      if (!updatedProduct) {
        const err = new Error(`"${product.name}" is out of stock or has insufficient quantity.`);
        err.statusCode = 409;
        throw err;
      }

      const created = await Order.create(
        [{
          userId,
          items: [{ productId, name: product.name, quantity, priceAtOrder: product.price }],
          totalAmount: product.price * quantity,
          deliveryAddress,
          status: "PLACED",
          paymentMethod: "COD",
        }],
        { session }
      );
      order = created[0];
    });
  } finally {
    await session.endSession();
  }

  return order;
};

const getUserOrders = async (userId, { page, limit }) => {
  const { page: p, limit: l } = sanitizePagination({ page, limit }, 10);
  const skip = (p - 1) * l;

  const [orders, total] = await Promise.all([
    Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(l),
    Order.countDocuments({ userId }),
  ]);

  return {
    orders,
    pagination: { total, page: p, pages: Math.ceil(total / l) },
  };
};

const getOrderById = async (orderId, userId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    const err = new Error("Order not found.");
    err.statusCode = 404;
    throw err;
  }

  if (order.userId.toString() !== userId.toString()) {
    const err = new Error("Access denied.");
    err.statusCode = 403;
    throw err;
  }

  return order;
};

const updateOrderStatus = async (orderId, newStatus) => {
  const order = await Order.findById(orderId);
  if (!order) {
    const err = new Error("Order not found.");
    err.statusCode = 404;
    throw err;
  }

  const allowed = VALID_TRANSITIONS[order.status];
  if (!allowed.includes(newStatus)) {
    const err = new Error(
      `Cannot transition order from ${order.status} to ${newStatus}.`
    );
    err.statusCode = 400;
    throw err;
  }

  // Restore stock if cancelling
  if (newStatus === "CANCELLED") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }
  }

  order.status = newStatus;
  await order.save();
  return order;
};

module.exports = {
  placeOrderFromCart,
  buyNow,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
};
