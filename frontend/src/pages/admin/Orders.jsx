import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getAllOrders, updateOrderStatus, exportOrdersURL } from "../../services/admin.service";
import AdminLayout from "../../components/admin/AdminLayout";
import { Download, ChevronDown } from "lucide-react";

const STATUS_STYLES = {
  PLACED:    "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-yellow-100 text-yellow-700",
  PREPARING: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const VALID_NEXT = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    getAllOrders(params)
      .then(({ data }) => { setOrders(data.data.orders); setPagination(data.data.pagination); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success("Status updated.");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExport = () => {
    const url = exportOrdersURL(statusFilter);
    const token = localStorage.getItem("token");
    fetch(`${url}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "orders.csv";
        link.click();
      })
      .catch(() => toast.error("Export failed."));
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field w-40"
          >
            <option value="">All Status</option>
            {Object.keys(STATUS_STYLES).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 whitespace-nowrap">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Order ID", "Customer", "Amount", "Items", "Status", "Date", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-full" /></td>
                    ))}</tr>
                  ))
                : orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{order.userId?.name || "—"}</p>
                        <p className="text-xs text-gray-400">{order.userId?.email || ""}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold">₹{order.totalAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-500">{order.items.length}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        {VALID_NEXT[order.status]?.length > 0 ? (
                          <select
                            value=""
                            disabled={updatingId === order._id}
                            onChange={(e) => e.target.value && handleStatusUpdate(order._id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
                          >
                            <option value="">Update →</option>
                            {VALID_NEXT[order.status].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === p ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
