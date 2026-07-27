const app = require("./app");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const env = require("./config/env");
const logger = require("./utils/logger");

const startServer = async () => {
  await connectDB();
  connectRedis();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`, { env: env.NODE_ENV });
  });

  const gracefulShutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully.`);
    server.close(() => {
      logger.info("Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection", { reason: String(reason) });
    server.close(() => process.exit(1));
  });
};

startServer();
