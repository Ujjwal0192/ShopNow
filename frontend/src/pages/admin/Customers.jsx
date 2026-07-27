import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getAllCustomers, exportCustomersURL } from "../../services/admin.service";
import AdminLayout from "../../components/admin/AdminLayout";
import { Download, ChevronRight, Users } from "lucide-react";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getAllCustomers({ page, limit: 20 })
      .then(({ data }) => {
        setCustomers(data.data.customers);
        setPagination(data.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const handleExport = () => {
    const token = localStorage.getItem("token");
    fetch(exportCustomersURL(), { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "customers.csv";
        link.click();
      })
      .catch(() => toast.error("Export failed."));
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {!loading && customers.length === 0 ? (
        <div className="text-center py-24">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No customers yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Name", "Email", "Joined", ""].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 4 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="skeleton h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : customers.map((c) => (
                      <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                              {c.name[0].toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{c.email}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(c.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/admin/customers/${c._id}`}
                            className="flex items-center gap-1 text-orange-500 hover:text-orange-600 font-medium text-xs"
                          >
                            View <ChevronRight size={14} />
                          </Link>
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
    </AdminLayout>
  );
}
