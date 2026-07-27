const express = require("express");
const router = express.Router();
const productController = require("./product.controller");
const { protect } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/role.middleware");
const { validateBody } = require("../../middleware/validate.middleware");
const { createProductSchema, updateProductSchema } = require("./product.validation");

router.get("/", productController.listProducts);
router.get("/categories", productController.getCategories);
router.get("/:id", productController.getProduct);

router.post(
  "/",
  protect,
  authorize("admin"),
  validateBody(createProductSchema),
  productController.createProduct
);
router.patch(
  "/:id",
  protect,
  authorize("admin"),
  validateBody(updateProductSchema),
  productController.updateProduct
);
router.delete("/:id", protect, authorize("admin"), productController.deleteProduct);

module.exports = router;
