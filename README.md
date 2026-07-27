# ShopNow — Full-Stack E-Commerce Platform

A MERN stack e-commerce application with atomic inventory management (real MongoDB transactions, not just a claim), Redis-backed rate limiting, JWT authentication, role-based access control, and an admin analytics dashboard.

---

## Tech Stack

**Frontend:** React.js, Tailwind CSS, Axios, React Router v6, Vite
**Backend:** Node.js, Express.js, MongoDB (Mongoose), Redis (ioredis), JWT, Winston, Zod, Jest

---

## Architecture
```
Client (React + Vite)
        |
        | HTTP (JWT in Authorization header)
        v
Express Server (/api/v1/*)
        |
   ┌────┴────────────────────────┐
   │                              │
Rate Limiting                Auth Middleware
(Redis, keyed by user         (JWT verify + role)
 ID when authenticated,             │
 IP otherwise)                      │
   │                              │
   └──────────┬───────────────────┘
              |
       Zod Validation (body)
              |
        Feature Modules
┌─────────────────────────────┐
│  auth  │ products │  cart   │
│ orders │  admin   │  users  │
└─────────────────────────────┘
              |
       MongoDB Atlas
  (Users, Products, Orders, Cart)
   — replica set, required for
     the transaction in order
     placement to work
              |
       Redis (Upstash)
   (rate limit counters)
```

---

## Features

**Customer**
- Register and login with JWT authentication
- Browse and filter products by category, price, debounced search
- Add to cart, update quantities, remove items — stock-checked against cumulative cart quantity, not just each individual add
- Checkout with delivery address
- Buy Now — single product direct checkout
- Order history with status tracking
- Atomic inventory — prevents overselling under concurrent requests, wrapped in a real MongoDB transaction

**Admin**
- Dashboard with revenue, order, and customer stats
- Manage products — create, update, delete (validated with Zod)
- Manage orders — view and update order status
- Manage customers — view profiles and order history
- Export customers and orders as CSV — genuinely streamed, not built as one in-memory string

---

## Project Structure
```
ShopNow/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Redis, env validation
│   │   ├── middleware/       # auth, error, rate limiting, role, validation
│   │   ├── models/           # User, Product, Order, Cart
│   │   ├── modules/          # Feature-based: auth, cart, order, product, admin, user
│   │   │   └── {module}/
│   │   │       ├── {module}.controller.js
│   │   │       ├── {module}.service.js
│   │   │       ├── {module}.routes.js
│   │   │       └── {module}.validation.js   # Zod schemas, where applicable
│   │   ├── utils/            # logger, asyncHandler, apiResponse, csvExporter, pagination
│   │   ├── app.js
│   │   └── server.js
│   └── tests/
│       ├── unit/              # pure-function tests — pagination, CSV escaping
│       ├── integration/       # real MongoDB (in-memory replica set) — cart, order/inventory
│       └── setup/             # test DB bootstrap
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── admin/        # AdminLayout
│       │   └── common/       # Navbar, Footer, ProtectedRoute, Skeleton
│       ├── context/          # AuthContext, CartContext
│       ├── hooks/            # useAuth, useCart
│       ├── pages/            # Home, Login, Register, Cart, Checkout, Orders
│       │   └── admin/        # Dashboard, Products, Orders, Customers
│       ├── services/         # API calls per feature
│       └── utils/            # axiosInstance, exportCSV
```

---

## Key Engineering Decisions

**Atomic Inventory with a real MongoDB transaction**
`placeOrderFromCart` and `buyNow` run inside `session.withTransaction`. Each item's stock decrement still uses `findOneAndUpdate` with a `$gte` guard (so two simultaneous requests for the last unit are serialized at the document level — one wins, one gets a clean 409), but the transaction wrapper is what guarantees the *whole operation* — every item's decrement, the order document, clearing the cart — commits or aborts together. An earlier version used manual rollback in a catch block instead of a real transaction; that handled a thrown error correctly but had a real gap if the process crashed between a successful decrement and the rollback running. A transaction closes that gap because the commit/abort is enforced by MongoDB itself, not by application code that has to survive long enough to run a compensating update. Requires a replica set — MongoDB Atlas gives you this by default, a standalone local `mongod` does not.

**Feature-Based Module Structure**
Each feature (auth, cart, order, product, admin) has its own controller, service, routes, and (where input needs validation) a Zod schema file. Controllers handle HTTP and validation wiring, services own business logic.

**Rate Limiting — Redis-backed, keyed by identity where possible**
Auth routes: 10 requests per 15 minutes. General API: 100 requests per 15 minutes. Order placement: 20 per minute. Backed by Redis via `rate-limit-redis`, falls back to in-memory store only if `REDIS_URL` isn't set. Keyed by `user.id` when the request is authenticated, IP otherwise — this matters because pure IP-based limiting shares one bucket across everyone on the same NAT (a college network, an office), and does nothing against an attacker spreading requests across many IPs. Per-user keying doesn't solve the multi-IP-attacker case either — no app-level rate limiter does; that's what a CDN/WAF layer is for — but it does mean one compromised or hostile account can't hide behind IP rotation.

**Winston Structured Logging**
Timestamp, level, and context on every log line. JSON in production for log aggregators, colorized human-readable format in development.

**CSV Export — actually streamed**
Rows are piped to the response via a Node `Readable` stream as they're generated, not accumulated into one string first. Memory use stays flat regardless of export size, as long as the caller also streams from the DB rather than loading every row into an array up front.

**Input validation with Zod**
Register, login, and product create/update are validated against explicit schemas before hitting a controller, instead of relying only on Mongoose schema-level validation (which doesn't run until the DB call, and doesn't cover everything — e.g., it wouldn't have caught a negative price submitted as a valid number).

**Pagination — capped server-side**
Every list endpoint clamps `limit` to 100 regardless of what the query string asks for, and floors `page` at 1. Previously `?limit=999999` was honored as-is.

---

## Testing
```bash
cd backend
npm test
```
- `tests/unit/` — pure-function tests (pagination clamping, CSV value escaping), no DB required.
- `tests/integration/` — spins up a real in-memory MongoDB replica set (`mongodb-memory-server`) so the transaction-based inventory logic runs against an actual MongoDB, not a mock. Covers: two concurrent requests for the last unit of stock (exactly one should succeed, stock should never go negative), a multi-item cart where one item is out of stock (the whole order should abort, not partially apply), and the cart cumulative-quantity bug fix.

This is new — there was no automated test coverage before. The concurrent-inventory test is the one that actually matters most: it's proving the project's headline claim under two real simultaneous requests, not just asserting it in prose.

---

## Environment Variables

### Backend `.env`
```
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/shopnow
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
REDIS_URL=redis://default:password@your-upstash-endpoint:6379
CLIENT_URL=https://your-frontend.onrender.com
NODE_ENV=production
```

### Frontend `.env`
```
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

---

## Running Locally

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev

# Frontend
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:5000/api/v1
npm run dev
```

---

## API Reference

All routes versioned under `/api/v1/`

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /auth/register | Public | Register new user |
| POST | /auth/login | Public | Login |
| GET | /auth/me | Protected | Get current user |

### Products
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /products | Public | List products with filters |
| GET | /products/:id | Public | Get product detail |
| GET | /products/categories | Public | Get all categories |
| POST | /products | Admin | Create product |
| PATCH | /products/:id | Admin | Update product |
| DELETE | /products/:id | Admin | Delete product |

### Cart
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /cart | Protected | Get user cart |
| POST | /cart/items | Protected | Add item to cart |
| PATCH | /cart/items/:productId | Protected | Update item quantity |
| DELETE | /cart/items/:productId | Protected | Remove item |

### Orders
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /orders | Protected | Place order from cart |
| POST | /orders/buy-now | Protected | Buy single product directly |
| GET | /orders | Protected | Get my orders |
| GET | /orders/:id | Protected | Get order detail |

### Admin
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /admin/dashboard | Admin | Revenue and stats |
| GET | /admin/orders | Admin | All orders with filters |
| PATCH | /admin/orders/:id/status | Admin | Update order status |
| GET | /admin/customers | Admin | All customers |
| GET | /admin/customers/:id | Admin | Customer profile |
| GET | /admin/customers/export | Admin | Export customers CSV |
| GET | /admin/orders/export | Admin | Export orders CSV |

---

## Deployment

- **Backend:** Render Web Service
  - Build Command: `cd backend && npm install`
  - Start Command: `cd backend && node src/server.js`
- **Frontend:** Render Static Site
  - Build Command: `cd frontend && npm install && npm run build`
  - Publish Directory: `frontend/dist`
  - Add Rewrite Rule: `/* → /index.html`
- **Database:** MongoDB Atlas (free M0 cluster — note this is a replica set, which the order-placement transaction requires)
- **Cache:** Upstash Redis (free tier)

---

## Realistic Bugs Encountered During Development

**1. Inventory race condition (~2 hours)**
Initially used `findById` → check stock → `save()`. Under load testing with concurrent requests, multiple orders would decrement the same stock. Fixed by replacing with a single atomic `findOneAndUpdate` with a `$gte` condition — MongoDB document-level atomicity handles it.

**2. Redis crash on missing URL (~30 minutes)**
`ioredis` throws synchronously if given `undefined` as a connection string. The server crashed at startup in staging because `REDIS_URL` wasn't set. Fixed with a null check before initializing the client.

**3. CORS blocking Authorization header (~1 hour)**
Frontend requests were blocked because `cors()` was configured with `origin: '*'`, which browsers reject when `credentials: true` is set. Fixed by setting `origin` to the explicit frontend URL from `CLIENT_URL`.

**4. JWT expiry not clearing localStorage (~45 minutes)**
On token expiry the API returned 401 but the user stayed on protected pages because `localStorage` still held the old token. Fixed with a response interceptor in `axiosInstance` that clears `localStorage` and redirects to `/login` on any 401.

**5. Redis was connected but never actually used (found in a self-review, not caught by tests — because there were no tests)**
The rate limiter was built with `express-rate-limit`'s default in-memory store from day one; a Redis client was wired up separately for "future use" and never connected to it. The README claimed Redis-backed rate limiting for weeks before this was caught. Fixed by wiring `rate-limit-redis` to the existing client, and it's also why the test suite exists now — this specific bug is exactly the kind of thing a test would have caught immediately (assert the limiter's store is a RedisStore, not undefined) and manual review almost didn't.

**6. Rate limiting silently shared across all users on Render**
`req.ip` behind Render's reverse proxy resolves to the proxy's IP unless Express is told to trust it. Every user was sharing one rate-limit bucket in production. Invisible locally because localhost doesn't go through a proxy. Fixed with `app.set('trust proxy', 1)`.

**7. CSV export claimed to stream, actually buffered the whole file in memory**
`csvExporter.js` built the entire CSV as one big string via `.join()` before sending it in a single `res.send()` — the opposite of the "memory efficient" claim in the original README. Rewritten using a real Node `Readable` stream, row by row.

**8. Cart quantity check only validated the incoming amount, not the cart's running total**
Adding 3 units twice against a stock of 4 succeeded both times — each check only compared the *new* quantity against stock, never `existing + new`. Checkout's atomic decrement still caught it, so nothing broke financially, but the UX let a cart claim more stock than existed. Fixed to check the cumulative total.

**The pattern across 5–8:** none of these were caught by tests, because there weren't any. They were caught by a line-by-line review before showing this project in an interview — which is a worse safety net than tests, not a better one. That's the actual reason `tests/` exists now, not as a checkbox.
