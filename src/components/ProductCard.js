"use client";

import { useCart } from "@/context/CartContext";

export default function ProductCard({ produit }) {
  const { addToCart } = useCart();

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      
      <div className="relative h-52 w-full overflow-hidden bg-slate-100 sm:h-60">
        {produit.image_url ? (
          <img
            src={produit.image_url}
            alt={produit.nom || "Produit solaire"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            Photo
          </div>
        )}
      </div>

      <div className="min-w-0 p-5 sm:p-6">

        <h4 className="break-words text-lg font-extrabold text-blue-950 sm:text-xl">
          {produit.nom}
        </h4>

        <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-slate-500">
          {produit.description}
        </p>

        <p className="mt-4 break-words text-lg font-black text-orange-500">
          {Number(produit.prix || 0).toLocaleString("fr-FR")} FCFA
        </p>

        <button
          type="button"
          onClick={() => addToCart(produit)}
          className="mt-5 w-full min-w-0 rounded-full bg-blue-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-900"
        >
          Ajouter au panier
        </button>

      </div>
    </div>
  );
}