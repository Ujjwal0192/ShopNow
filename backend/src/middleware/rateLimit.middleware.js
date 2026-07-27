const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { getRedis } = require("../config/redis");
const { sendError } = require("../utils/apiResponse");

// Key by authenticated user ID when we have one (set by `protect`, which
// runs before this on any route that uses it), fall back to IP otherwise.
// This matters for two reasons: (1) it's a real identity, not a proxy for
// one, so an attacker rotating IPs against one account still gets capped;
// (2) it means users on shared NAT (a college network, an office) don't
// share a bucket with everyone else on that network once they're logged in.
// Pre-auth routes (login, register, anonymous browsing) have no user yet,
// so IP is the only option there — a known, accepted limitation.
const keyGenerator = (req) => req.user?._id?.toString() || req.ip;

// Built once per limiter, not per request — rate-limit-redis expects a
// stable sendCommand function bound to the ioredis client.
const buildStore = () => {
  const client = getRedis();
  if (!client) return undefined; // express-rate-limit defaults to MemoryStore
  return new RedisStore({
    sendCommand: (...args) => client.call(...args),
  });
};

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    store: buildStore(),
    handler: (req, res) => sendError(res, 429, message),
  });

const authLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many login attempts. Please try again after 15 minutes."
);

const orderLimiter = createLimiter(
  60 * 1000,
  20,
  "Too many order requests. Please slow down."
);

const generalLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  "Too many requests. Please try again later."
);

module.exports = { authLimiter, orderLimiter, generalLimiter };
