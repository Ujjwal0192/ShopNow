import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getProductById } from "../services/product.service";
import { addToCart } from "../services/cart.service";
import { ProductDetailSkeleton } from "../components/common/Skeleton";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import Navbar from "../components/common/Navbar";
import { ShoppingCart, Zap, ArrowLeft, Package } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { fetchCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingCart, setAddingCart] = useState(false);

  useEffect(() => {
    getProductById(id)
      .then(({ data }) => setProduct(data.data))
      .catch(() => toast.error("Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error("Please login first."); navigate("/login"); return; }
    setAddingCart(true);
    try {
      await addToCart(product._id, quantity);
      await fetchCart();
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add.");
    } finally {
      setAddingCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) { toast.error("Please login first."); navigate("/login"); return; }
    navigate("/checkout", { state: { buyNow: true, productId: product._id, quantity } });
  };

  if (loading) return <div><Navbar /><ProductDetailSkeleton /></div>;
  if (!product) return <div><Navbar /><p className="text-center py-20 text-gray-400">Product not found.</p></div>;

  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="card overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <span className="text-sm text-orange-500 font-medium mb-2">{product.category}</span>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              {inStock ? (
                lowStock ? (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-orange-500">
                    <Package size={14} /> Only {product.stock} left!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-green-500">
                    <Package size={14} /> In Stock ({product.stock} available)
                  </span>
                )
              ) : (
                <span className="text-sm font-medium text-red-500">Out of Stock</span>
              )}
            </div>

            <p className="text-3xl font-black text-gray-900 mb-4">
              ₹{product.price.toLocaleString()}
            </p>

            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* Quantity */}
            {inStock && !isAdmin && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            {!isAdmin && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || addingCart}
                  className="btn-secondary flex items-center justify-center gap-2 flex-1"
                >
                  <ShoppingCart size={16} />
                  {addingCart ? "Adding..." : "Add to Cart"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  className="btn-primary flex items-center justify-center gap-2 flex-1"
                >
                  <Zap size={16} />
                  Buy Now
                </button>
              </div>
            )}

            {!inStock && (
              <div className="bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-lg">
                This product is currently out of stock.
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 space-y-2 text-sm text-gray-500">
              <p>✅ Cash on Delivery available</p>
              <p>✅ 7-day easy return policy</p>
              <p>✅ Secure checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
