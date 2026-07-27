const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const env = require("./config/env");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/user/user.routes");
const productRoutes = require("./modules/product/product.routes");
const cartRoutes = require("./modules/cart/cart.routes");
const orderRoutes = require("./modules/order/order.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const { errorHandler, notFound } = require("./middleware/error.middleware");
const { generalLimiter } = require("./middleware/rateLimit.middleware");

const app = express();

// Render (and most PaaS providers) sit behind a reverse proxy. Without this,
// req.ip resolves to the proxy's IP for every request, and every user ends
// up sharing one rate-limit bucket. `1` trusts exactly one hop — the
// platform's own load balancer — not an arbitrary chain of forwarded-for
// headers an attacker could spoof.
app.set("trust proxy", 1);

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(generalLimiter);

app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
