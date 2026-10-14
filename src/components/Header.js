"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CartIcon from "@/components/CartIcon";

const WHATSAPP = "221787110707";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/#services", label: "Services" },
  { href: "/#produits", label: "Produits" },
  { href: "/estimation", label: "Estimation" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href) => href === pathname;

  return (
    <header className="fixed inset-x-0 top-0 z-[100] h-[72px] w-full border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LOGO */}
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5"
        >
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition duration-300 group-hover:scale-105 group-hover:shadow-md sm:h-11 sm:w-11">
            <Image
              src="/logo.png"
              alt="Solar Smart"
              fill
              sizes="44px"
              className="object-contain p-1"
              priority
            />
          </div>

          <div className="min-w-0 leading-none">
            <p className="truncate text-lg font-black tracking-tight sm:text-xl">
              <span className="text-blue-800">Solar</span>{" "}
              <span className="text-orange-500">Smart</span>
            </p>

            <p className="mt-1 truncate text-[8px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Énergie solaire
            </p>
          </div>
        </Link>

        {/* NAVIGATION ORDINATEUR */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                isActive(link.href)
                  ? "bg-blue-50 text-blue-800"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-800"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="mx-2 h-7 w-px bg-slate-200" />

          <CartIcon />

          <Link
            href="/#contact"
            className="ml-2 inline-flex items-center gap-2 rounded-full bg-blue-800 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition duration-300 hover:bg-blue-900 hover:shadow-xl"
          >
            Contact
            <span className="text-orange-400">→</span>
          </Link>
        </nav>

        {/* NAVIGATION MOBILE */}
        <div className="flex items-center gap-2 md:hidden">
          <CartIcon />

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-blue-900 transition hover:bg-blue-50"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {/* MENU MOBILE : s'ouvre sous la barre sans la déplacer */}
      {menuOpen && (
        <div className="absolute inset-x-0 top-full max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-slate-100 bg-white px-4 py-3 shadow-xl md:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-1">
            {[...NAV_LINKS, { href: "/#contact", label: "Contact" }].map(
              (link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition hover:bg-blue-50 ${
                    isActive(link.href)
                      ? "bg-blue-50 text-blue-800"
                      : "text-slate-700"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}

            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-xl bg-green-500 px-4 py-3 text-center text-sm font-bold text-white shadow-md transition hover:bg-green-600"
            >
              Discuter sur WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}