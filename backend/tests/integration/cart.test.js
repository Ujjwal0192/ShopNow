const mongoose = require("mongoose");
const { connect, closeDatabase, clearDatabase } = require("../setup/testDb");
const Product = require("../../src/models/product.model");
const User = require("../../src/models/user.model");
const cartService = require("../../src/modules/cart/cart.service");

jest.setTimeout(30000);

beforeAll(async () => await connect());
afterAll(async () => await closeDatabase());
afterEach(async () => await clearDatabase());

const makeUser = async () =>
  User.create({
    name: "Cart Test User",
    email: `cart-${new mongoose.Types.ObjectId()}@test.com`,
    passwordHash: "irrelevant",
  });

const makeProduct = async (stock) =>
  Product.create({
    name: "Limited Widget",
    description: "Only a few in stock",
    price: 50,
    category: "Other",
    stock,
  });

describe("cart.service — cumulative stock check", () => {
  test("adding twice, total within stock, succeeds", async () => {
    const user = await makeUser();
    const product = await makeProduct(4);

    await cartService.addToCart(user._id, product._id, 2);
    const cart = await cartService.addToCart(user._id, product._id, 2);

    expect(cart.items[0].quantity).toBe(4);
  });

  test("adding twice, total EXCEEDS stock, rejects the second add — the fixed bug", async () => {
    // Before the fix: this passed silently. addToCart only checked the
    // incoming amount (2 <= 4 stock) each time, never the running total
    // (2 + 2 + 2 = 6 > 4 stock).
    const user = await makeUser();
    const product = await makeProduct(4);

    await cartService.addToCart(user._id, product._id, 2);
    await cartService.addToCart(user._id, product._id, 2); // now at 4, exactly at stock

    await expect(cartService.addToCart(user._id, product._id, 1)).rejects.toMatchObject({
      statusCode: 400,
    });

    // and the cart should still show 4, not have silently grown to 5
    const cart = await cartService.getCart(user._id);
    expect(cart.items[0].quantity).toBe(4);
  });

  test("a single add exceeding stock outright is rejected", async () => {
    const user = await makeUser();
    const product = await makeProduct(2);

    await expect(cartService.addToCart(user._id, product._id, 5)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
