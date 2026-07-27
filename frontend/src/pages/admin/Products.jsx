import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../services/product.service";
import AdminLayout from "../../components/admin/AdminLayout";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

const CATEGORIES = ["Electronics", "Clothing", "Books", "Food", "Home", "Sports", "Other"];

const emptyForm = { name: "", description: "", price: "", category: "Electronics", stock: "", imageUrl: "" };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    getProducts({ limit: 100 })
      .then(({ data }) => setProducts(data.data.products))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingProduct(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, stock: p.stock, imageUrl: p.imageUrl || "" });
    setEditingProduct(p);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) { toast.error("Name, price and stock are required."); return; }
    setSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, form);
        toast.success("Product updated.");
      } else {
        await createProduct(form);
        toast.success("Product created.");
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      toast.success("Product deleted.");
      fetchProducts();
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-lg">{editingProduct ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Name", key: "name", type: "text", placeholder: "Product name" },
                { label: "Price (₹)", key: "price", type: "number", placeholder: "0" },
                { label: "Stock", key: "stock", type: "number", placeholder: "0" },
                { label: "Image URL", key: "imageUrl", type: "text", placeholder: "https://..." },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    className="input-field"
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="input-field">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="input-field resize-none h-24"
                  placeholder="Product description..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Check size={16} /> {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Product", "Category", "Price", "Stock", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-full" /></td>
                    ))}</tr>
                  ))
                : products.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                          <span className="font-medium text-gray-900 max-w-48 truncate">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.category}</td>
                      <td className="px-4 py-3 font-semibold">₹{p.price.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          p.stock === 0 ? "bg-red-100 text-red-600" :
                          p.stock <= 5 ? "bg-orange-100 text-orange-600" :
                          "bg-green-100 text-green-600"
                        }`}>
                          {p.stock === 0 ? "Out" : p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            disabled={deletingId === p._id}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
