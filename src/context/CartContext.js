"use client";

import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Ajouter un produit au panier
  function addToCart(produit) {
    setCart((panierActuel) => {
      const produitExistant = panierActuel.find(
        (item) => item.id === produit.id
      );

      if (produitExistant) {
        return panierActuel.map((item) =>
          item.id === produit.id
            ? {
                ...item,
                quantite: item.quantite + 1,
              }
            : item
        );
      }

      return [
        ...panierActuel,
        {
          ...produit,
          quantite: 1,
        },
      ];
    });
  }

  // Supprimer un produit
  function removeFromCart(id) {
    setCart((panierActuel) =>
      panierActuel.filter((item) => item.id !== id)
    );
  }

  // Modifier la quantité
  function updateQuantity(id, quantite) {
    const nouvelleQuantite = Number(quantite);

    if (nouvelleQuantite <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((panierActuel) =>
      panierActuel.map((item) =>
        item.id === id
          ? {
              ...item,
              quantite: nouvelleQuantite,
            }
          : item
      )
    );
  }

  // Vider complètement le panier
  function clearCart() {
    setCart([]);
  }

  const value = useMemo(
    () => ({
      cart,
      setCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [cart]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}