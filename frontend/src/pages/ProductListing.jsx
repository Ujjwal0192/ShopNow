import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getProducts, getCategories } from "../services/product.service";
import { addToCart } from "../services/cart.service";
import { ProductCardSkeleton } from "../components/common/Skeleton";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import Navbar from "../components/common/Navbar";
import { ShoppingCart, Search, SlidersHorizontal, X } from "lucide-react";

const StatusBadge = ({ stock }) => {
  if (stock === 0) return <span className="text-xs font-medium text-red-500">Out of Stock</span>;
  if (stock <= 5) return <span className="text-xs font-medium text-orange-500">Only {stock} left</span>;
  return <span className="text-xs font-medium text-green-500">In Stock</span>;
};

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isAdmin } = useAuth();
  const { fetchCart } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    sort: searchParams.get("sort") || "",
    page: Number(searchParams.get("page")) || 1,
  });

  // What's actually in the search box, updated on every keystroke — kept
  // separate from `filters.search` so typing doesn't trigger a fetch itself.
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    getCategories().then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  // Debounce: only push searchInput into filters.search (which IS what
  // triggers a fetch, below) 400ms after the user stops typing. Previously
  // every keystroke updated filters.search directly, so typing "laptop"
  // fired 6 separate API requests.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) =>
        prev.search === searchInput ? prev : { ...prev, search: searchInput, page: 1 }
      );
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.sort) params.sort = filters.sort;
    params.page = filters.page;
    params.limit = 12;
    setSearchParams(params);
    fetchProducts(params);
  }, [filters]);

  const fetchProducts = async (params) => {
    setLoading(true);
    try {
      const { data } = await getProducts(params);
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    } catch {
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) { toast.error("Please login to add items."); return; }
    setAddingId(productId);
    try {
      await addToCart(productId, 1);
      await fetchCart();
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add.");
    } finally {
      setAddingId(null);
    }
  };

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="input-field md:w-48"
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="input-field md:w-44"
          >
            <option value="">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          {(filters.search || filters.category || filters.sort) && (
            <button
              onClick={() => { setSearchInput(""); setFilters({ search: "", category: "", sort: "", page: 1 }); }}
              className="btn-secondary flex items-center gap-2 whitespace-nowrap"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-6">
            Showing {products.length} of {pagination.total || 0} products
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product) => (
                <div key={product._id} className="card overflow-hidden group flex flex-col">
                  <Link to={`/products/${product._id}`} className="block overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <div className="p-4 flex flex-col flex-1">
                    <Link to={`/products/${product._id}`}>
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 hover:text-orange-500 transition-colors mb-1">
                        {product.name}
                      </h3>
                    </Link>
                    <span className="text-xs text-gray-400 mb-2">{product.category}</span>
                    <StatusBadge stock={product.stock} />
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <span className="font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                    </div>
                    {!isAdmin && (
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        disabled={product.stock === 0 || addingId === product._id}
                        className="btn-primary w-full mt-3 text-sm py-2 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={14} />
                        {addingId === product._id ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
        </div>

        {/* Empty */}
        {!loading && products.length === 0 && (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-xl font-semibold text-gray-700">No products found</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                  filters.page === p
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
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
