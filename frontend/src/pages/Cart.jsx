import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { updateCartItem, removeFromCart } from "../services/cart.service";
import useCart from "../hooks/useCart";
import Navbar from "../components/common/Navbar";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function Cart() {
  const { cart, cartLoading, fetchCart } = useCart();
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);

  const handleQuantityChange = async (productId, newQty) => {
    setUpdatingId(productId);
    try {
      await updateCartItem(productId, newQty);
      await fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    setUpdatingId(productId);
    try {
      await removeFromCart(productId);
      await fetchCart();
      toast.success("Item removed.");
    } catch {
      toast.error("Failed to remove item.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4 flex gap-4">
              <div className="skeleton w-20 h-20 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <p className="text-7xl mb-4">🛒</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Add some products to get started.</p>
          <Link to="/products" className="btn-primary inline-block">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart ({cart.items.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map((item) => {
              const product = item.productId;
              return (
                <div key={product._id} className="card p-4 flex gap-4 items-center">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${product._id}`}
                      className="font-semibold text-gray-900 hover:text-orange-500 text-sm line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <p className="text-orange-500 font-bold mt-1">₹{item.priceAtAdd.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleQuantityChange(product._id, item.quantity - 1)}
                      disabled={updatingId === product._id}
                      className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(product._id, item.quantity + 1)}
                      disabled={updatingId === product._id || item.quantity >= product.stock}
                      className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-bold text-gray-900 w-20 text-right text-sm flex-shrink-0">
                    ₹{(item.priceAtAdd * item.quantity).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleRemove(product._id)}
                    disabled={updatingId === product._id}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="card p-5 h-fit sticky top-24">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              {cart.items.map((item) => (
                <div key={item.productId._id} className="flex justify-between text-gray-600">
                  <span className="truncate max-w-32">{item.productId.name} × {item.quantity}</span>
                  <span>₹{(item.priceAtAdd * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-orange-500">₹{cart.totalAmount.toLocaleString()}</span>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>
            <Link to="/products" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
