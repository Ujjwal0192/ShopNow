import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-orange-500 tracking-tight">
              ShopNow
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">
              Products
            </Link>

            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1 text-gray-600 hover:text-orange-500 font-medium transition-colors"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/cart"
                      className="relative flex items-center gap-1 text-gray-600 hover:text-orange-500 font-medium transition-colors"
                    >
                      <ShoppingCart size={18} />
                      Cart
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-3 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {cartCount > 9 ? "9+" : cartCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/orders"
                      className="text-gray-600 hover:text-orange-500 font-medium transition-colors"
                    >
                      My Orders
                    </Link>
                  </>
                )}
                <div className="flex items-center gap-3 ml-2">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <User size={14} />
                    {user?.name?.split(" ")[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          <Link to="/products" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium">
            Products
          </Link>
          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <>
                  <Link to="/cart" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium">
                    Cart {cartCount > 0 && `(${cartCount})`}
                  </Link>
                  <Link to="/orders" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium">
                    My Orders
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium">
                  Admin Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="text-left text-red-500 font-medium">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
