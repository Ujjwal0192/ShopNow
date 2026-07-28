const { Resend } = require("resend");
const env = require("../../config/env");
const logger = require("../../utils/logger");

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// One function, one map — not three near-identical send functions. Adding
// a fourth status later (e.g. PREPARING) is a two-line addition here, not
// a new function plus a new call site plumbed through order.service.js.
const COPY = {
  PLACED: {
    subject: (order) => `Order Confirmed — #${order._id.toString().slice(-8)}`,
    heading: "Your order has been placed",
  },
  DELIVERED: {
    subject: (order) => `Order Delivered — #${order._id.toString().slice(-8)}`,
    heading: "Your order has been delivered",
  },
  CANCELLED: {
    subject: (order) => `Order Cancelled — #${order._id.toString().slice(-8)}`,
    heading: "Your order has been cancelled",
  },
};

const buildItemsHtml = (items) =>
  items
    .map(
      (item) =>
        `<tr><td>${item.name}</td><td>x${item.quantity}</td><td>₹${item.priceAtOrder * item.quantity}</td></tr>`
    )
    .join("");

const buildEmailHtml = (type, order) => {
  const { heading } = COPY[type];
  return `
    <h2>${heading}</h2>
    <p>Order ID: ${order._id.toString()}</p>
    <p>Status: ${order.status}</p>
    <table border="1" cellpadding="6" cellspacing="0">
      <tr><th>Item</th><th>Qty</th><th>Amount</th></tr>
      ${buildItemsHtml(order.items)}
    </table>
    <p><strong>Total: ₹${order.totalAmount}</strong></p>
    <p>Delivery Address: ${order.deliveryAddress}</p>
    <p>Payment Method: ${order.paymentMethod}</p>
  `;
};

/**
 * type must be one of the keys in COPY (PLACED, DELIVERED, CANCELLED).
 * Callers pass the order's *new* status directly — see order.service.js,
 * where this is only invoked after a transition has already been
 * validated against VALID_TRANSITIONS, so an unknown `type` here would
 * mean a bug at the call site, not bad input from a customer.
 */
const sendOrderStatusEmail = async ({ toEmail, toName, order, type }) => {
  const copy = COPY[type];
  if (!copy) {
    logger.error("sendOrderStatusEmail called with unknown type", {
      orderId: order._id.toString(),
      type,
    });
    return { sent: false, reason: "invalid_type" };
  }

  if (!resend) {
    logger.warn(`Skipped ${type} email — RESEND_API_KEY not configured`, {
      orderId: order._id.toString(),
    });
    return { sent: false, reason: "not_configured" };
  }

  try {
    const { error } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: toEmail,
      subject: copy.subject(order),
      html: buildEmailHtml(type, order),
    });

    if (error) {
      // Logged, not thrown — a failed email must never undo or fail an
      // already-committed order/status change (see order.service.js).
      logger.error("Resend send failed", {
        orderId: order._id.toString(),
        type,
        error,
      });
      return { sent: false, reason: "provider_error" };
    }

    logger.info(`${type} email sent`, { orderId: order._id.toString(), toEmail });
    return { sent: true };
  } catch (err) {
    logger.error("Resend request threw", {
      orderId: order._id.toString(),
      type,
      message: err.message,
    });
    return { sent: false, reason: "network_error" };
  }
};

module.exports = { sendOrderStatusEmail };