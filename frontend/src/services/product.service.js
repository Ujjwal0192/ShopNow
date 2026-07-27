import api from "../utils/axiosInstance";

export const getProducts = (params) => api.get("/products", { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const getCategories = () => api.get("/products/categories");

// Admin
export const createProduct = (data) => api.post("/products", data);
export const updateProduct = (id, data) => api.patch(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
