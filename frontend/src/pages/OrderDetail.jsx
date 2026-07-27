import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../services/order.service";
import Navbar from "../components/common/Navbar";
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react";

const STATUS_STYLES = {
  PLACED:    "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-yellow-100 text-yellow-700",
  PREPARING: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const STEPS = ["PLACED", "CONFIRMED", "PREPARING", "DELIVERED"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(id)
      .then(({ data }) => setOrder(data.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-40 w-full rounded-xl" />
          <div className="skeleton h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <p className="text-center py-20 text-gray-400">Order not found.</p>
      </div>
    );
  }

  const currentStep = order.status === "CANCELLED" ? -1 : STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/orders" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
          <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${STATUS_STYLES[order.status]}`}>
            {order.status}
          </span>
        </div>

        {/* Progress tracker */}
        {order.status !== "CANCELLED" && (
          <div className="card p-6 mb-4">
            <div className="flex items-center justify-between">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      i <= currentStep ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                      {i < currentStep ? "✓" : i + 1}
                    </div>
                    <span className="text-xs text-gray-500 mt-1 text-center hidden sm:block">{step}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${i < currentStep ? "bg-orange-500" : "bg-gray-100"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="card p-6 mb-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Package size={16} className="text-orange-500" /> Items Ordered
          </h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-sm text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.priceAtOrder.toLocaleString()}</p>
                </div>
                <p className="font-semibold text-sm">₹{(item.priceAtOrder * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-base mt-4 pt-4 border-t border-gray-100">
            <span>Total</span>
            <span className="text-orange-500">₹{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Delivery + Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <MapPin size={14} className="text-orange-500" /> Delivery Address
            </h3>
            <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <CreditCard size={14} className="text-orange-500" /> Payment
            </h3>
            <p className="text-sm text-gray-600">{order.paymentMethod}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
