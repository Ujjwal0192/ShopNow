import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import {
  LayoutDashboard, Package, ShoppingBag, Users, LogOut, Menu, X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { path: "/admin/products", label: "Products", icon: <Package size={18} /> },
  { path: "/admin/orders", label: "Orders", icon: <ShoppingBag size={18} /> },
  { path: "/admin/customers", label: "Customers", icon: <Users size={18} /> },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const Sidebar = () => (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-full">
      <div className="p-5 border-b border-gray-700">
        <Link to="/" className="text-xl font-black text-orange-500">ShopNow</Link>
        <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-orange-500 text-white" : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 mb-3 truncate">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="flex flex-col">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100">
          <span className="text-lg font-black text-orange-500">ShopNow Admin</span>
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
