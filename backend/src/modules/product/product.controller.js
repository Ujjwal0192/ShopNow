const productService = require("./product.service");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/apiResponse");

const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, category, search, sort } = req.query;
  const result = await productService.listProducts({ page, limit, category, search, sort });
  sendSuccess(res, 200, "Products fetched.", result);
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  sendSuccess(res, 200, "Product fetched.", product);
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  sendSuccess(res, 201, "Product created.", product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  sendSuccess(res, 200, "Product updated.", product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  sendSuccess(res, 200, "Product deleted.");
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await productService.getCategories();
  sendSuccess(res, 200, "Categories fetched.", categories);
});

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};
