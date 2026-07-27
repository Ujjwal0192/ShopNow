import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getCustomerById, getCustomerOrders, exportCustomerOrdersURL } from "../../services/admin.service";
import AdminLayout from "../../components/admin/AdminLayout";
import { ArrowLeft, Download, Mail, Calendar, Package } from "lucide-react";

const STATUS_STYLES = {
  PLACED:    "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-yellow-100 text-yellow-700",
  PREPARING: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminCustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getCustomerById(id)
      .then(({ data }) => setCustomer(data.data))
      .catch(() => toast.error("Customer not found."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setOrdersLoading(true);
    getCustomerOrders(id, { page, limit: 10 })
      .then(({ data }) => {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      })
      .finally(() => setOrdersLoading(false));
  }, [id, page]);

  const handleExportOrders = () => {
    const token = localStorage.getItem("token");
    fetch(exportCustomerOrdersURL(id), { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `customer_${id}_orders.csv`;
        link.click();
      })
      .catch(() => toast.error("Export failed."));
  };

  const totalSpent = orders.reduce((sum, o) => (o.status !== "CANCELLED" ? sum + o.totalAmount : sum), 0);

  return (
    <AdminLayout>
      <Link
        to="/admin/customers"
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
      >
        <ArrowLeft size={16} /> Back to Customers
      </Link>

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-32 w-full rounded-xl" />
          <div className="skeleton h-64 w-full rounded-xl" />
        </div>
      ) : !customer ? (
        <p className="text-center py-20 text-gray-400">Customer not found.</p>
      ) : (
        <>
          {/* Customer Info */}
          <div className="card p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl font-black">
                {customer.name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">{customer.name}</h1>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} /> {customer.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} /> Joined{" "}
                    {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className="flex gap-4 text-center">
                <div className="card px-4 py-3">
                  <p className="text-xl font-black text-gray-900">{pagination.total || 0}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Orders</p>
                </div>
                <div className="card px-4 py-3">
                  <p className="text-xl font-black text-orange-500">₹{totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Total Spent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Package size={18} className="text-orange-500" /> Order History
            </h2>
            <button onClick={handleExportOrders} className="btn-secondary flex items-center gap-2 text-sm">
              <Download size={14} /> Export CSV
            </button>
          </div>

          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card p-4"><div className="skeleton h-12 w-full" /></div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="card p-12 text-center">
              <Package size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">This customer has no orders yet.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Order ID", "Items", "Amount", "Status", "Payment", "Date"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {order.items.length} item{order.items.length > 1 ? "s" : ""}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          ₹{order.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{order.paymentMethod}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === p
                      ? "bg-orange-500 text-white"
                      : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
