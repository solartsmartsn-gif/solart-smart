"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartIcon() {
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantite, 0);

  return (
    <Link href="/panier" className="relative flex items-center text-2xl">
      🛒
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Link>
  );
}