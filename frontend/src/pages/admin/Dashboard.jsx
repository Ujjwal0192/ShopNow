import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../../services/admin.service";
import AdminLayout from "../../components/admin/AdminLayout";
import { Package, Users, ShoppingBag, TrendingUp, AlertTriangle } from "lucide-react";

const STATUS_STYLES = {
  PLACED:    "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-yellow-100 text-yellow-700",
  PREPARING: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: "Total Orders", value: stats.totalOrders, icon: <ShoppingBag size={20} />, color: "bg-blue-50 text-blue-600" },
        { label: "Total Customers", value: stats.totalCustomers, icon: <Users size={20} />, color: "bg-green-50 text-green-600" },
        { label: "Total Products", value: stats.totalProducts, icon: <Package size={20} />, color: "bg-purple-50 text-purple-600" },
        { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <TrendingUp size={20} />, color: "bg-orange-50 text-orange-600" },
      ]
    : [];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5"><div className="skeleton h-16 w-full" /></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="card p-5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                {card.icon}
              </div>
              <p className="text-2xl font-black text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" /> Low Stock Alert
          </h2>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-8 w-full" />)}
            </div>
          ) : stats?.lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-400">All products are well-stocked.</p>
          ) : (
            <div className="space-y-2">
              {stats.lowStockProducts.map((p) => (
                <div key={p._id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700 truncate max-w-48">{p.name}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.stock === 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                    {p.stock === 0 ? "Out of Stock" : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link to="/admin/products" className="text-sm text-orange-500 font-medium mt-3 inline-block hover:underline">
            Manage Products →
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <ShoppingBag size={16} className="text-orange-500" /> Recent Orders
          </h2>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}
            </div>
          ) : stats?.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.recentOrders.map((order) => (
                <Link
                  key={order._id}
                  to="/admin/orders"
                  className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.userId?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400">#{order._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">₹{order.totalAmount.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Link to="/admin/orders" className="text-sm text-orange-500 font-medium mt-3 inline-block hover:underline">
            View All Orders →
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
