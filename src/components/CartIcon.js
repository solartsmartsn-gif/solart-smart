"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartIcon() {
  const { cart } = useCart();

  const totalItems = cart.reduce(
    (total, item) => total + Number(item.quantite || 0),
    0
  );

  return (
    <Link
      href="/panier"
      aria-label={`Panier${totalItems > 0 ? `, ${totalItems} article(s)` : ""}`}
      className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-950 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:shadow-md"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5.5 w-5.5 transition-transform duration-200 group-hover:scale-105"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 4h2l2.4 11.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6"
        />
        <circle cx="9.5" cy="20" r="1.2" />
        <circle cx="18" cy="20" r="1.2" />
      </svg>

      {totalItems > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-black leading-none text-white shadow-sm ring-2 ring-white">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}