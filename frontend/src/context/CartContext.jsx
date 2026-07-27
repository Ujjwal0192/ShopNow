import { createContext, useState, useEffect, useContext } from "react";
import api from "../utils/axiosInstance";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    try {
      setCartLoading(true);
      const { data } = await api.get("/cart");
      setCart(data.data);
    } catch {
      // silent fail — cart stays empty
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, cartLoading, fetchCart, setCart }}>
      {children}
    </CartContext.Provider>
  );
};
