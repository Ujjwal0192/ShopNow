const express = require("express");
const router = express.Router();
const adminController = require("./admin.controller");
const { protect } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/role.middleware");

router.use(protect, authorize("admin"));

router.get("/dashboard", adminController.getDashboardStats);

router.get("/orders", adminController.getAllOrders);
router.patch("/orders/:id/status", adminController.updateOrderStatus);
router.get("/orders/export", adminController.exportAllOrders);

router.get("/customers", adminController.getAllCustomers);
router.get("/customers/export", adminController.exportCustomers);
router.get("/customers/:id", adminController.getCustomerById);
router.get("/customers/:id/orders", adminController.getCustomerOrders);
router.get("/customers/:id/orders/export", adminController.exportCustomerOrders);

module.exports = router;
