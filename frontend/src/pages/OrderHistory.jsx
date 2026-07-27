import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../services/order.service";
import { OrderRowSkeleton } from "../components/common/Skeleton";
import Navbar from "../components/common/Navbar";
import { Package, ChevronRight } from "lucide-react";

const STATUS_STYLES = {
  PLACED:    "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-yellow-100 text-yellow-700",
  PREPARING: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getMyOrders({ page, limit: 10 })
      .then(({ data }) => {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <OrderRowSkeleton key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">No orders yet</h2>
            <p className="text-gray-400 mt-2 mb-6">Your order history will appear here.</p>
            <Link to="/products" className="btn-primary inline-block">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow group"
              >
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package size={18} className="text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-gray-900 text-sm">
                    ₹{order.totalAmount.toLocaleString()}
                  </span>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  page === p ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
