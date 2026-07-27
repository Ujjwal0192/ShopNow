import { Link } from "react-router-dom";
import { ShoppingBag, Shield, Truck, RotateCcw } from "lucide-react";

const features = [
  { icon: <Truck size={24} />, title: "Free Delivery", desc: "On orders above ₹999" },
  { icon: <Shield size={24} />, title: "Secure Payments", desc: "100% safe & trusted" },
  { icon: <RotateCcw size={24} />, title: "Easy Returns", desc: "7 day return policy" },
  { icon: <ShoppingBag size={24} />, title: "Wide Selection", desc: "1000+ products" },
];

const categories = [
  { name: "Electronics", emoji: "📱", color: "bg-blue-50 text-blue-600" },
  { name: "Clothing", emoji: "👕", color: "bg-pink-50 text-pink-600" },
  { name: "Books", emoji: "📚", color: "bg-yellow-50 text-yellow-600" },
  { name: "Sports", emoji: "⚽", color: "bg-green-50 text-green-600" },
  { name: "Home", emoji: "🏠", color: "bg-purple-50 text-purple-600" },
  { name: "Food", emoji: "🍎", color: "bg-red-50 text-red-600" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
              Shop Everything<br />You Love
            </h1>
            <p className="text-orange-100 text-lg mb-8 max-w-md">
              Discover thousands of products at unbeatable prices. Fast delivery, easy returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link
                to="/products"
                className="bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors text-center"
              >
                Shop Now
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-colors text-center"
              >
                Join Free
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-64 h-64 bg-orange-400 rounded-full flex items-center justify-center text-9xl shadow-2xl">
              🛍️
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col items-center text-center gap-2 p-4">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
                  {f.icon}
                </div>
                <p className="font-semibold text-sm">{f.title}</p>
                <p className="text-gray-400 text-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold mb-8">Shop by Category</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name}`}
              className={`${cat.color} rounded-2xl p-5 flex flex-col items-center gap-2 hover:scale-105 transition-transform cursor-pointer`}
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-xs font-semibold">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start shopping?</h2>
          <p className="text-gray-400 mb-8">Join thousands of happy customers today.</p>
          <Link
            to="/products"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl transition-colors inline-block"
          >
            Browse All Products
          </Link>
        </div>
      </section>
    </div>
  );
}
