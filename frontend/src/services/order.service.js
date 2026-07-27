import api from "../utils/axiosInstance";

export const placeOrder = (deliveryAddress) =>
  api.post("/orders", { deliveryAddress });
export const buyNow = (productId, quantity, deliveryAddress) =>
  api.post("/orders/buy-now", { productId, quantity, deliveryAddress });
export const getMyOrders = (params) => api.get("/orders", { params });
export const getOrderById = (id) => api.get(`/orders/${id}`);
