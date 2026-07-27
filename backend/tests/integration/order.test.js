const mongoose = require("mongoose");
const { connect, closeDatabase, clearDatabase } = require("../setup/testDb");
const Product = require("../../src/models/product.model");
const User = require("../../src/models/user.model");
const Cart = require("../../src/models/cart.model");
const Order = require("../../src/models/order.model");
const orderService = require("../../src/modules/order/order.service");

jest.setTimeout(30000); // spinning up mongodb-memory-server's replset is slow on first run

beforeAll(async () => await connect());
afterAll(async () => await closeDatabase());
afterEach(async () => await clearDatabase());

const makeUser = async (overrides = {}) =>
  User.create({
    name: "Test User",
    email: `user-${new mongoose.Types.ObjectId()}@test.com`,
    passwordHash: "irrelevant-for-these-tests",
    ...overrides,
  });

const makeProduct = async (overrides = {}) =>
  Product.create({
    name: "Test Widget",
    description: "A widget for testing",
    price: 100,
    category: "Other",
    stock: 1,
    ...overrides,
  });

describe("placeOrderFromCart — atomic inventory", () => {
  test("two concurrent orders for the LAST unit of stock: exactly one succeeds", async () => {
    // This is the actual headline claim of the project — verifying it here
    // for real, with two real concurrent requests against a real DB,
    // instead of just asserting it in a README.
    const product = await makeProduct({ stock: 1 });
    const userA = await makeUser();
    const userB = await makeUser();

    await Cart.create({ userId: userA._id, items: [{ productId: product._id, quantity: 1, priceAtAdd: 100 }] });
    await Cart.create({ userId: userB._id, items: [{ productId: product._id, quantity: 1, priceAtAdd: 100 }] });

    const results = await Promise.allSettled([
      orderService.placeOrderFromCart(userA._id, "123 Test St"),
      orderService.placeOrderFromCart(userB._id, "456 Test Ave"),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason.statusCode).toBe(409);

    const finalProduct = await Product.findById(product._id);
    expect(finalProduct.stock).toBe(0); // not -1 — no overselling

    const orderCount = await Order.countDocuments();
    expect(orderCount).toBe(1);
  });

  test("failure after partial stock decrement leaves NO order and stock fully restored", async () => {
    // Cart has two items: one in stock, one NOT in stock. The transaction
    // should decrement nothing permanently — this is exactly the crash-mid-
    // rollback gap the transaction rewrite closes vs. the old manual-rollback
    // version.
    const inStock = await makeProduct({ name: "In Stock Item", stock: 5 });
    const outOfStock = await makeProduct({ name: "Out of Stock Item", stock: 0 });
    const user = await makeUser();

    await Cart.create({
      userId: user._id,
      items: [
        { productId: inStock._id, quantity: 1, priceAtAdd: 100 },
        { productId: outOfStock._id, quantity: 1, priceAtAdd: 50 },
      ],
    });

    await expect(orderService.placeOrderFromCart(user._id, "789 Test Blvd")).rejects.toMatchObject({
      statusCode: 409,
    });

    const stillInStock = await Product.findById(inStock._id);
    expect(stillInStock.stock).toBe(5); // untouched — transaction aborted, not partially applied

    const orderCount = await Order.countDocuments();
    expect(orderCount).toBe(0); // no partial order left behind
  });

  test("successful order clears the cart", async () => {
    const product = await makeProduct({ stock: 10 });
    const user = await makeUser();
    await Cart.create({ userId: user._id, items: [{ productId: product._id, quantity: 2, priceAtAdd: 100 }] });

    await orderService.placeOrderFromCart(user._id, "1 Test Way");

    const cart = await Cart.findOne({ userId: user._id });
    expect(cart.items).toHaveLength(0);
  });

  test("rejects an empty cart", async () => {
    const user = await makeUser();
    await Cart.create({ userId: user._id, items: [] });

    await expect(orderService.placeOrderFromCart(user._id, "1 Test Way")).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});

describe("buyNow — atomic inventory, single item path", () => {
  test("two concurrent buyNow calls for the last unit: exactly one succeeds", async () => {
    const product = await makeProduct({ stock: 1 });
    const userA = await makeUser();
    const userB = await makeUser();

    const results = await Promise.allSettled([
      orderService.buyNow(userA._id, product._id, 1, "A St"),
      orderService.buyNow(userB._id, product._id, 1, "B St"),
    ]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);

    const finalProduct = await Product.findById(product._id);
    expect(finalProduct.stock).toBe(0);
  });
});
