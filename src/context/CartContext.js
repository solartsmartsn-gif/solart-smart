"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("panier");
    if (saved) setCart(JSON.parse(saved));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("panier", JSON.stringify(cart));
    }
  }, [cart, loaded]);

  function addToCart(produit) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === produit.id);
      if (existing) {
        return prev.map((item) =>
          item.id === produit.id
            ? { ...item, quantite: item.quantite + 1 }
            : item
        );
      }
      return [...prev, { ...produit, quantite: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function updateQuantity(id, quantite) {
    if (quantite < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantite } : item))
    );
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}