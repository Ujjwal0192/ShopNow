const User = require("../../models/user.model");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const orderService = require("../order/order.service");
const { sanitizePagination } = require("../../utils/pagination");

const getAllOrders = async ({ page, limit, status }) => {
  const { page: p, limit: l } = sanitizePagination({ page, limit }, 20);
  const query = {};
  if (status) query.status = status;

  const skip = (p - 1) * l;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .populate("userId", "name email"),
    Order.countDocuments(query),
  ]);

  return {
    orders,
    pagination: { total, page: p, pages: Math.ceil(total / l) },
  };
};

const getAllCustomers = async ({ page, limit }) => {
  const { page: p, limit: l } = sanitizePagination({ page, limit }, 20);
  const skip = (p - 1) * l;

  const [customers, total] = await Promise.all([
    User.find({ role: "customer" })
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l),
    User.countDocuments({ role: "customer" }),
  ]);

  return {
    customers,
    pagination: { total, page: p, pages: Math.ceil(total / l) },
  };
};

const getCustomerById = async (customerId) => {
  const customer = await User.findById(customerId).select("-passwordHash");
  if (!customer || customer.role !== "customer") {
    const err = new Error("Customer not found.");
    err.statusCode = 404;
    throw err;
  }
  return customer;
};

const getCustomerOrders = async (customerId, { page = 1, limit = 20 }) => {
  return orderService.getUserOrders(customerId, { page, limit });
};

const updateOrderStatus = async (orderId, status) => {
  return orderService.updateOrderStatus(orderId, status);
};

const getDashboardStats = async () => {
  const [
    totalOrders,
    totalCustomers,
    totalProducts,
    lowStockProducts,
    recentOrders,
    ordersByStatus,
  ] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: "customer" }),
    Product.countDocuments({ isActive: true }),
    Product.find({ stock: { $lte: 5 }, isActive: true }).select("name stock").limit(10),
    Order.find().sort({ createdAt: -1 }).limit(5).populate("userId", "name email"),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const revenue = await Order.aggregate([
    { $match: { status: { $in: ["DELIVERED", "CONFIRMED", "PREPARING"] } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  return {
    totalOrders,
    totalCustomers,
    totalProducts,
    totalRevenue: revenue[0]?.total || 0,
    lowStockProducts,
    recentOrders,
    ordersByStatus,
  };
};

const exportCustomersData = async () => {
  return User.find({ role: "customer" }).select("-passwordHash").lean();
};

const exportOrdersData = async (status) => {
  const query = {};
  if (status) query.status = status;
  return Order.find(query).populate("userId", "name email").lean();
};

const exportCustomerOrdersData = async (customerId) => {
  return Order.find({ userId: customerId }).lean();
};

module.exports = {
  getAllOrders,
  getAllCustomers,
  getCustomerById,
  getCustomerOrders,
  updateOrderStatus,
  getDashboardStats,
  exportCustomersData,
  exportOrdersData,
  exportCustomerOrdersData,
};
