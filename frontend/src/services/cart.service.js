import api from "../utils/axiosInstance";

export const getCart = () => api.get("/cart");
export const addToCart = (productId, quantity) =>
  api.post("/cart/items", { productId, quantity });
export const updateCartItem = (productId, quantity) =>
  api.patch(`/cart/items/${productId}`, { quantity });
export const removeFromCart = (productId) =>
  api.delete(`/cart/items/${productId}`);
