import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { placeOrder, buyNow } from "../services/order.service";
import useCart from "../hooks/useCart";
import Navbar from "../components/common/Navbar";
import { MapPin, CreditCard, CheckCircle } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, fetchCart } = useCart();

  const isBuyNow = location.state?.buyNow;
  const buyNowProductId = location.state?.productId;
  const buyNowQty = location.state?.quantity || 1;

  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const total = isBuyNow
    ? null
    : cart.items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      toast.error("Please enter a delivery address.");
      return;
    }
    setLoading(true);
    try {
      let response;
      if (isBuyNow) {
        response = await buyNow(buyNowProductId, buyNowQty, address);
      } else {
        response = await placeOrder(address);
      }
      await fetchCart();
      toast.success("Order placed successfully!");
      navigate(`/orders/${response.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <div className="space-y-6">
          {/* Delivery Address */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-orange-500" /> Delivery Address
            </h2>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full delivery address including city, state and pincode..."
              className="input-field resize-none h-28"
              required
            />
          </div>

          {/* Payment */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-orange-500" /> Payment Method
            </h2>
            <div className="flex items-center gap-3 p-3 border-2 border-orange-200 bg-orange-50 rounded-xl">
              <div className="w-5 h-5 rounded-full border-2 border-orange-500 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              </div>
              <span className="font-medium text-sm">Cash on Delivery (COD)</span>
            </div>
          </div>

          {/* Order Summary */}
          {!isBuyNow && cart.items.length > 0 && (
            <div className="card p-6">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm text-gray-600">
                {cart.items.map((item) => (
                  <div key={item.productId._id} className="flex justify-between">
                    <span>{item.productId.name} × {item.quantity}</span>
                    <span>₹{(item.priceAtAdd * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-orange-500">₹{total?.toLocaleString()}</span>
              </div>
            </div>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
