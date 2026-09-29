"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

const WHATSAPP = "221785932525";

export default function Panier() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum + Number(item.prix || 0) * Number(item.quantite || 0),
      0
    );
  }, [cart]);

  const nombreArticles = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + Number(item.quantite || 0),
      0
    );
  }, [cart]);

  const formatPrix = (prix) =>
    Number(prix || 0).toLocaleString("fr-FR");

  const creerMessageWhatsApp = () => {
    const produits = cart
      .map(
        (item) =>
          `• ${item.nom} — quantité : ${Number(
            item.quantite || 1
          )}`
      )
      .join("\n");

    const message = `Bonjour Solart Smart,

Je souhaite obtenir un devis pour les produits suivants :

${produits}

Montant estimatif : ${formatPrix(total)} FCFA

Je souhaite être contacté pour confirmer les détails de mon installation.

Merci.`;

    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
      message
    )}`;
  };

  /* =========================================================
     PANIER VIDE
  ========================================================= */

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Solart Smart"
                width={180}
                height={60}
                className="h-12 w-auto object-contain"
                priority
              />
            </Link>

            <Link
              href="/"
              className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-950 transition hover:border-orange-400 hover:text-orange-500"
            >
              <span className="transition-transform group-hover:-translate-x-1">
                ←
              </span>
              Continuer mes achats
            </Link>
          </div>
        </header>

        <section className="flex min-h-[calc(100vh-85px)] items-center justify-center px-5 py-16">
          <div className="w-full max-w-xl text-center">
            <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white shadow-xl shadow-blue-950/5">
              <div className="absolute inset-0 rounded-[2rem] bg-orange-500/10" />

              <svg
                className="relative h-12 w-12 text-blue-900"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1 5h12m-11 0a2 2 0 104 0m4 0a2 2 0 104 0"
                />
              </svg>
            </div>

            <span className="inline-flex items-center rounded-full bg-orange-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">
              Votre panier
            </span>

            <h1 className="mt-5 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">
              Votre panier est vide
            </h1>

            <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-500">
              Sélectionnez une solution solaire pour préparer votre
              demande de devis.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-blue-900 px-7 py-4 font-extrabold text-white shadow-xl shadow-blue-900/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-950"
            >
              Découvrir nos solutions
              <span className="text-orange-400">→</span>
            </Link>

            <div className="mx-auto mt-12 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-xl">☀️</div>
                <p className="mt-2 text-xs font-bold text-slate-600">
                  Kit Maison
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-xl">💧</div>
                <p className="mt-2 text-xs font-bold text-slate-600">
                  Kit Pompage
                </p>
              </div>

              <div className="col-span-2 rounded-2xl bg-white p-4 shadow-sm sm:col-span-1">
                <div className="text-xl">🛠️</div>
                <p className="mt-2 text-xs font-bold text-slate-600">
                  Étude adaptée
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* =========================================================
     PANIER
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#f6f8fc]">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-80"
          >
            <Image
              src="/logo.png"
              alt="Solart Smart"
              width={190}
              height={65}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-slate-400">
                Votre sélection
              </p>

              <p className="text-sm font-black text-blue-950">
                {nombreArticles} article
                {nombreArticles > 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-900">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1 5h12m-11 0a2 2 0 104 0m4 0a2 2 0 104 0"
                />
              </svg>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* BREADCRUMB */}
        <div className="mb-8 flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/"
            className="font-semibold text-slate-400 transition hover:text-orange-500"
          >
            Accueil
          </Link>

          <span className="text-slate-300">/</span>

          <span className="font-bold text-blue-950">
            Mon panier
          </span>
        </div>

        {/* TITRE */}
        <div className="mb-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-orange-600">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Votre sélection
              </div>

              <h1 className="text-3xl font-black tracking-tight text-blue-950 sm:text-4xl lg:text-5xl">
                Mon panier
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                Vérifiez vos solutions avant de préparer votre
                demande de devis personnalisée.
              </p>
            </div>

            <Link
              href="/"
              className="group inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-blue-950 shadow-sm transition hover:border-orange-300 hover:text-orange-500"
            >
              <span className="transition-transform group-hover:-translate-x-1">
                ←
              </span>
              Continuer mes achats
            </Link>
          </div>
        </div>

        {/* CONTENU */}
        <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
          {/* PRODUITS */}
          <section>
            <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
                <div>
                  <h2 className="text-lg font-black text-blue-950">
                    Produits sélectionnés
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    {nombreArticles} article
                    {nombreArticles > 1 ? "s" : ""} dans votre panier
                  </p>
                </div>

                <div className="hidden rounded-full bg-blue-50 px-4 py-2 text-xs font-extrabold text-blue-800 sm:block">
                  {nombreArticles} produit
                  {nombreArticles > 1 ? "s" : ""}
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {cart.map((item) => {
                  const prixUnitaire = Number(item.prix || 0);
                  const quantite = Math.max(
                    1,
                    Number(item.quantite || 1)
                  );
                  const sousTotal = prixUnitaire * quantite;

                  return (
                    <div
                      key={item.id}
                      className="p-5 transition hover:bg-slate-50/60 sm:p-7"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        {/* IMAGE */}
                        <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 sm:h-28 sm:w-28">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.nom || "Produit solaire"}
                              className="h-full w-full object-cover transition duration-500 hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
                              <span className="text-4xl">☀️</span>
                            </div>
                          )}
                        </div>

                        {/* INFOS */}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-black text-blue-950 sm:text-lg">
                            {item.nom}
                          </h3>

                          <p className="mt-1 text-sm font-semibold text-slate-400">
                            Prix unitaire
                          </p>

                          <p className="text-base font-black text-orange-500">
                            {formatPrix(prixUnitaire)} FCFA
                          </p>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="mt-4 text-sm font-bold text-slate-400 transition hover:text-red-500"
                          >
                            Retirer du panier
                          </button>
                        </div>

                        {/* QUANTITÉ */}
                        <div className="flex items-center justify-between gap-5 sm:block sm:text-center">
                          <p className="mb-2 hidden text-[11px] font-extrabold uppercase tracking-wider text-slate-400 sm:block">
                            Quantité
                          </p>

                          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                            <button
                              type="button"
                              aria-label={`Diminuer la quantité de ${item.nom}`}
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  Math.max(1, quantite - 1)
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-black text-slate-500 transition hover:bg-slate-100 hover:text-blue-900"
                            >
                              −
                            </button>

                            <span className="flex h-9 min-w-10 items-center justify-center px-1 text-sm font-black text-blue-950">
                              {quantite}
                            </span>

                            <button
                              type="button"
                              aria-label={`Augmenter la quantité de ${item.nom}`}
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  quantite + 1
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-black text-slate-500 transition hover:bg-blue-50 hover:text-blue-900"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* SOUS-TOTAL */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4 sm:block sm:min-w-[145px] sm:border-0 sm:pt-0 sm:text-right">
                          <div>
                            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                              Sous-total
                            </p>

                            <p className="text-lg font-black text-blue-950">
                              {formatPrix(sousTotal)}
                            </p>

                            <p className="text-xs font-semibold text-slate-400">
                              FCFA
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* INFORMATIONS */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="text-xl">☀️</div>
                <p className="mt-2 text-xs font-black text-blue-950">
                  Kit Maison
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Solution solaire adaptée à l'habitation
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="text-xl">💧</div>
                <p className="mt-2 text-xs font-black text-blue-950">
                  Kit Pompage
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Solution solaire pour le pompage
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="text-xl">🛠️</div>
                <p className="mt-2 text-xs font-black text-blue-950">
                  Étude personnalisée
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Confirmation avant devis final
                </p>
              </div>
            </div>
          </section>

          {/* RÉSUMÉ */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-[2rem] bg-blue-950 shadow-2xl shadow-blue-950/15">
              <div className="h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />

              <div className="p-6 sm:p-7">
                <div className="mb-7 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-400">
                      Récapitulatif
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-white">
                      Votre demande
                    </h2>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-orange-400">
                    🧾
                  </div>
                </div>

                <div className="space-y-4 border-b border-white/10 pb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-200">
                      Produits
                    </span>

                    <span className="font-bold text-white">
                      {nombreArticles} article
                      {nombreArticles > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-200">
                      Montant estimatif
                    </span>

                    <span className="font-bold text-white">
                      {formatPrix(total)} FCFA
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-200">
                      Étude / devis final
                    </span>

                    <span className="font-bold text-orange-400">
                      Sur demande
                    </span>
                  </div>
                </div>

                <div className="py-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-blue-200">
                        Montant estimatif
                      </p>

                      <p className="mt-1 text-xs text-blue-300/70">
                        Le montant final sera confirmé après étude.
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                        {formatPrix(total)}
                      </p>

                      <p className="text-xs font-bold text-orange-400">
                        FCFA
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/devis"
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-orange-500 px-6 py-4 text-center text-sm font-black text-white shadow-xl shadow-orange-950/20 transition duration-300 hover:-translate-y-0.5 hover:bg-orange-400"
                >
                  Demander mon devis
                  <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <a
                  href={creerMessageWhatsApp()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-white/15"
                >
                  <span className="text-lg">◉</span>
                  Demander sur WhatsApp
                </a>

                <p className="mt-4 text-center text-[11px] leading-5 text-blue-300/70">
                  Votre sélection sera utilisée pour préparer
                  votre demande de devis personnalisé.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-black text-blue-950">
                Besoin d'une précision ?
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Notre équipe peut confirmer les caractéristiques,
                la disponibilité et le dimensionnement de votre
                solution avant le devis final.
              </p>

              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-xs font-extrabold text-orange-500 transition hover:text-orange-600"
              >
                Nous contacter sur WhatsApp →
              </a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}