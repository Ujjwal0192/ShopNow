const Redis = require("ioredis");
const env = require("./env");

// Created eagerly (not inside a function called later) so that ANY module
// requiring config/redis — the rate limiter, a future cache layer — gets a
// real client, not null. `lazyConnect: true` means this doesn't block at
// require-time; the actual TCP handshake happens on the first command.
let redisClient = null;

if (env.REDIS_URL) {
  redisClient = new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
  });

  redisClient.on("connect", () => console.log("Redis connected"));
  redisClient.on("error", (err) => console.error(`Redis error: ${err.message}`));
} else {
  console.warn("REDIS_URL not set — Redis disabled. Rate limiting will use memory store.");
}

// Kept as an explicit step server.js calls during startup so the connection
// attempt (and its logs) happen at a predictable point, not silently at
// import time. Idempotent — just returns the client created above.
const connectRedis = async () => {
  if (redisClient && redisClient.status !== "ready" && redisClient.status !== "connecting") {
    try {
      await redisClient.connect();
    } catch (err) {
      console.error(`Redis initial connection failed: ${err.message}`);
    }
  }
  return redisClient;
};

// The fix: gate on connection status, not just "does a client object
// exist." A client constructed against a dead URL is still a non-null
// object forever — status is the only thing that actually reflects
// whether commands sent through it can succeed. Callers (buildStore in
// rateLimit.middleware.js) treat a null return as "use MemoryStore
// instead," so this is what makes that fallback actually reachable once
// Redis is down, not just at startup.
const getRedis = () => (redisClient && redisClient.status === "ready" ? redisClient : null);

module.exports = { connectRedis, getRedis };