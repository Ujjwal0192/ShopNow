const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Electronics", "Clothing", "Books", "Food", "Home", "Sports", "Other"],
    },
    imageUrl: {
      type: String,
      default: "https://placehold.co/400x300?text=Product",
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ name: "text", description: "text" });
productSchema.index({ isActive: 1, stock: 1 });

module.exports = mongoose.model("Product", productSchema);
