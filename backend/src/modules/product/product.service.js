const Product = require("../../models/product.model");
const { sanitizePagination } = require("../../utils/pagination");

const listProducts = async ({ page, limit, category, search, sort }) => {
  const { page: p, limit: l } = sanitizePagination({ page, limit }, 12);

  const query = { isActive: true };

  if (category) query.category = category;

  if (search) {
    query.$text = { $search: search };
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
  };

  const sortBy = sortOptions[sort] || { createdAt: -1 };
  const skip = (p - 1) * l;

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortBy).skip(skip).limit(l),
    Product.countDocuments(query),
  ]);

  return {
    products,
    pagination: { total, page: p, pages: Math.ceil(total / l), limit: l },
  };
};

const getProductById = async (productId) => {
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    const err = new Error("Product not found.");
    err.statusCode = 404;
    throw err;
  }
  return product;
};

const createProduct = async (productData) => {
  const product = await Product.create(productData);
  return product;
};

const updateProduct = async (productId, updates) => {
  const product = await Product.findByIdAndUpdate(productId, updates, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    const err = new Error("Product not found.");
    err.statusCode = 404;
    throw err;
  }
  return product;
};

const deleteProduct = async (productId) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { isActive: false },
    { new: true }
  );
  if (!product) {
    const err = new Error("Product not found.");
    err.statusCode = 404;
    throw err;
  }
  return product;
};

const getCategories = async () => {
  return Product.schema.path("category").enumValues;
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};
