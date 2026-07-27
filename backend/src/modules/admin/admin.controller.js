const adminService = require("./admin.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");
const { streamCSVResponse } = require("../../utils/csvExporter");

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  sendSuccess(res, 200, "Dashboard stats fetched.", stats);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const result = await adminService.getAllOrders(req.query);
  sendSuccess(res, 200, "Orders fetched.", result);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) {
    const err = new Error("Status is required.");
    err.statusCode = 400;
    throw err;
  }
  const order = await adminService.updateOrderStatus(req.params.id, status);
  sendSuccess(res, 200, "Order status updated.", order);
});

const getAllCustomers = asyncHandler(async (req, res) => {
  const result = await adminService.getAllCustomers(req.query);
  sendSuccess(res, 200, "Customers fetched.", result);
});

const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await adminService.getCustomerById(req.params.id);
  sendSuccess(res, 200, "Customer fetched.", customer);
});

const getCustomerOrders = asyncHandler(async (req, res) => {
  const result = await adminService.getCustomerOrders(req.params.id, req.query);
  sendSuccess(res, 200, "Customer orders fetched.", result);
});

const exportCustomers = asyncHandler(async (req, res) => {
  const customers = await adminService.exportCustomersData();
  const headers = ["_id", "name", "email", "createdAt"];
  const rows = customers.map((c) => ({
    _id: c._id,
    name: c.name,
    email: c.email,
    createdAt: new Date(c.createdAt).toISOString(),
  }));
  streamCSVResponse(res, "customers.csv", headers, rows);
});

const exportAllOrders = asyncHandler(async (req, res) => {
  const orders = await adminService.exportOrdersData(req.query.status);
  const headers = ["_id", "customerName", "customerEmail", "totalAmount", "status", "paymentMethod", "deliveryAddress", "createdAt"];
  const rows = orders.map((o) => ({
    _id: o._id,
    customerName: o.userId?.name || "",
    customerEmail: o.userId?.email || "",
    totalAmount: o.totalAmount,
    status: o.status,
    paymentMethod: o.paymentMethod,
    deliveryAddress: o.deliveryAddress,
    createdAt: new Date(o.createdAt).toISOString(),
  }));
  streamCSVResponse(res, "orders.csv", headers, rows);
});

const exportCustomerOrders = asyncHandler(async (req, res) => {
  const orders = await adminService.exportCustomerOrdersData(req.params.id);
  const headers = ["_id", "totalAmount", "status", "paymentMethod", "deliveryAddress", "createdAt"];
  const rows = orders.map((o) => ({
    _id: o._id,
    totalAmount: o.totalAmount,
    status: o.status,
    paymentMethod: o.paymentMethod,
    deliveryAddress: o.deliveryAddress,
    createdAt: new Date(o.createdAt).toISOString(),
  }));
  streamCSVResponse(res, `customer_${req.params.id}_orders.csv`, headers, rows);
});

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllCustomers,
  getCustomerById,
  getCustomerOrders,
  exportCustomers,
  exportAllOrders,
  exportCustomerOrders,
};
