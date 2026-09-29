"use client";

import { useCart } from "@/context/CartContext";

export default function ProductCard({ produit }) {
  const { addToCart } = useCart();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="h-44 rounded-2xl bg-slate-100 overflow-hidden mb-4 flex items-center justify-center text-slate-400">
        {produit.image_url ? (
          <img
            src={produit.image_url}
            alt={produit.nom}
            className="w-full h-full object-cover"
          />
        ) : (
          "Photo"
        )}
      </div>
      <h4 className="text-lg font-extrabold text-blue-950 mb-1">
        {produit.nom}
      </h4>
      <p className="text-sm text-slate-500 mb-3 line-clamp-2">
        {produit.description}
      </p>
      <p className="text-orange-500 font-black text-lg mb-4">
        {Number(produit.prix).toLocaleString("fr-FR")} FCFA
      </p>
      <button
        onClick={() => addToCart(produit)}
        className="w-full rounded-full bg-blue-800 text-white py-2.5 text-sm font-bold hover:bg-blue-900 transition"
      >
        Ajouter au panier
      </button>
    </div>
  );
}