import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="text-2xl font-black text-orange-500">ShopNow</Link>
          <p className="text-sm">© {new Date().getFullYear()} ShopNow. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link to="/products" className="hover:text-white transition-colors">Products</Link>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
