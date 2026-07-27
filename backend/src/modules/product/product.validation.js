const { z } = require("zod");

const CATEGORIES = ["Electronics", "Clothing", "Books", "Food", "Home", "Sports", "Other"];

const createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(5000),
  price: z.number().nonnegative("Price cannot be negative"),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: `Category must be one of: ${CATEGORIES.join(", ")}` }),
  }),
  imageUrl: z.string().trim().url("imageUrl must be a valid URL").optional(),
  stock: z.number().int().nonnegative("Stock cannot be negative").default(0),
});

// PATCH — every field optional, but whatever IS provided must still be valid.
const updateProductSchema = createProductSchema.partial();

module.exports = { createProductSchema, updateProductSchema };
