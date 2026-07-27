import api from "../utils/axiosInstance";

export const getDashboardStats = () => api.get("/admin/dashboard");
export const getAllOrders = (params) => api.get("/admin/orders", { params });
export const updateOrderStatus = (id, status) =>
  api.patch(`/admin/orders/${id}/status`, { status });
export const getAllCustomers = (params) => api.get("/admin/customers", { params });
export const getCustomerById = (id) => api.get(`/admin/customers/${id}`);
export const getCustomerOrders = (id, params) =>
  api.get(`/admin/customers/${id}/orders`, { params });

export const exportCustomersURL = () => `/api/v1/admin/customers/export`;
export const exportOrdersURL = (status) =>
  `/api/v1/admin/orders/export${status ? `?status=${status}` : ""}`;
export const exportCustomerOrdersURL = (id) =>
  `/api/v1/admin/customers/${id}/orders/export`;
