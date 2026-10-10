
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import CartIcon from "@/components/CartIcon";

const WHATSAPP = "221787110707";
const EMAIL = "solartsmart.sn@gmail.com";

const ADRESSE =
  "Pikine Icotaf 3, Tally Mbaye Gakou, en face du marché Sandika, Sénégal";

function nomProduit(produit) {
  return (
    produit?.nom ||
    produit?.name ||
    produit?.titre ||
    produit?.title ||
    "Solution solaire"
  );
}

function imageProduit(produit) {
  return (
    produit?.image_url ||
    produit?.image ||
    produit?.photo ||
    null
  );
}

function prixNombre(produit) {
  const valeur =
    produit?.prix ??
    produit?.price ??
    produit?.montant ??
    0;

  if (typeof valeur === "number") {
    return Number.isFinite(valeur) ? valeur : 0;
  }

  const nombre = Number(
    String(valeur).replace(/[^\d,.-]/g, "").replace(",", ".")
  );

  return Number.isFinite(nombre) ? nombre : 0;
}

function quantiteProduit(produit) {
  const valeur = Number(produit?.quantite ?? 1);
  return Number.isFinite(valeur) && valeur > 0
    ? Math.floor(valeur)
    : 1;
}

function formaterPrix(montant) {
  return `${Math.round(montant).toLocaleString("fr-FR")} FCFA`;
}

function Icone({ type, className = "h-5 w-5" }) {
  const props = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const dessins = {
    panier: (
      <>
        <path d="M3 3h2l2.4 11.5a2 2 0 0 0 2 1.5h8.8a2 2 0 0 0 2-1.6L22 7H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
    poubelle: (
      <>
        <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6" />
        <path d="M10 10v6m4-6v6" />
      </>
    ),
    plus: <path d="M12 5v14m-7-7h14" />,
    moins: <path d="M5 12h14" />,
    livraison: (
      <>
        <path d="M3 6h11v12H3z" />
        <path d="M14 10h4l3 4v4h-7z" />
        <circle cx="7.5" cy="18" r="1.5" />
        <circle cx="17.5" cy="18" r="1.5" />
      </>
    ),
    securite: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    fleche: <path d="M5 12h14m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    retour: <path d="m15 18-6-6 6-6" />,
    telephone: (
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.2 10a16 16 0 0 0 6 6l1.5-1.8a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.5 2.8Z" />
    ),
  };

  return (
    <svg {...props}>
      {dessins[type] || dessins.check}
    </svg>
  );
}

function BoutonLien({ href, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-800"
    >
      {children}
    </Link>
  );
}

export default function PanierPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [coordonnees, setCoordonnees] = useState({
    nom: "",
    telephone: "",
    email: "",
    adresse: "",
    ville: "Dakar",
    instructions: "",
  });

  const [erreur, setErreur] = useState("");

  const articles = Array.isArray(cart) ? cart : [];

  const totalArticles = useMemo(
    () =>
      articles.reduce(
        (total, produit) =>
          total + quantiteProduit(produit),
        0
      ),
    [articles]
  );

  const sousTotal = useMemo(
    () =>
      articles.reduce(
        (total, produit) =>
          total +
          prixNombre(produit) * quantiteProduit(produit),
        0
      ),
    [articles]
  );

  function modifierCoordonnees(event) {
    const { name, value } = event.target;

    setCoordonnees((precedent) => ({
      ...precedent,
      [name]: value,
    }));
  }

  function modifierQuantite(produit, nouvelleQuantite) {
    const id = produit?.id;

    if (id === undefined || id === null) return;

    if (nouvelleQuantite < 1) return;

    updateQuantity(id, nouvelleQuantite);
  }

  function envoyerCommande(event) {
    event.preventDefault();
    setErreur("");

    if (articles.length === 0) {
      setErreur("Ton panier est vide.");
      return;
    }

    if (
      !coordonnees.nom.trim() ||
      !coordonnees.telephone.trim() ||
      !coordonnees.adresse.trim() ||
      !coordonnees.ville.trim()
    ) {
      setErreur(
        "Renseigne ton nom, ton téléphone, ton adresse et ta ville."
      );
      return;
    }

    const lignes = articles.map((produit, index) => {
      const nom = nomProduit(produit);
      const quantite = quantiteProduit(produit);
      const prix = prixNombre(produit);

      return (
        `${index + 1}. ${nom}\n` +
        `   Quantité : ${quantite}\n` +
        `   Prix unitaire : ${formaterPrix(prix)}\n` +
        `   Sous-total : ${formaterPrix(prix * quantite)}`
      );
    });

    const message = [
      "Bonjour Solar Smart, je souhaite passer une commande.",
      "",
      "=== MA COMMANDE ===",
      ...lignes,
      "",
      `Nombre total d'articles : ${totalArticles}`,
      `Sous-total des produits : ${formaterPrix(sousTotal)}`,
      "Livraison : à confirmer avec Solar Smart.",
      "Total définitif : à confirmer avec Solar Smart.",
      "",
      "=== COORDONNÉES DU CLIENT ===",
      `Nom : ${coordonnees.nom.trim()}`,
      `Téléphone : ${coordonnees.telephone.trim()}`,
      `E-mail : ${coordonnees.email.trim() || "Non renseigné"}`,
      `Adresse : ${coordonnees.adresse.trim()}`,
      `Ville : ${coordonnees.ville.trim()}`,
      `Instructions : ${coordonnees.instructions.trim() || "Aucune"}`,
      "",
      "Merci de confirmer la disponibilité des produits, les frais de livraison et le montant définitif.",
    ].join("\n");

    const url =
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-white text-slate-900">
      {/* NAVIGATION FIXE */}

      <header className="fixed inset-x-0 top-0 z-[100] border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-2xl">
        <div className="mx-auto flex h-[70px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2.5"
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition group-hover:scale-105 sm:h-11 sm:w-11">
              <Image
                src="/logo.png"
                alt="Solar Smart"
                fill
                sizes="44px"
                className="object-contain p-1"
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

          <nav className="hidden items-center gap-1 md:flex">
            <BoutonLien href="/">Accueil</BoutonLien>
            <BoutonLien href="/#services">Services</BoutonLien>
            <BoutonLien href="/#produits">Produits</BoutonLien>
            <BoutonLien href="/estimation">Estimation</BoutonLien>

            <div className="mx-2 h-7 w-px bg-slate-200" />

            <CartIcon />

            <Link
              href="/#contact"
              className="ml-2 inline-flex items-center gap-2 rounded-full bg-blue-800 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-blue-900"
            >
              Contact
              <span className="text-orange-400">→</span>
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <CartIcon />

            <button
              type="button"
              onClick={() => setMobileMenu((value) => !value)}
              aria-label={mobileMenu ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileMenu}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-blue-900 transition hover:bg-blue-50"
            >
              {mobileMenu ? "×" : "☰"}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="max-h-[calc(100dvh-70px)] overflow-y-auto border-t border-slate-100 bg-white px-4 py-3 shadow-xl md:hidden">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-1">
              <BoutonLien
                href="/"
                onClick={() => setMobileMenu(false)}
              >
                Accueil
              </BoutonLien>
              <BoutonLien
                href="/#services"
                onClick={() => setMobileMenu(false)}
              >
                Services
              </BoutonLien>
              <BoutonLien
                href="/#produits"
                onClick={() => setMobileMenu(false)}
              >
                Produits
              </BoutonLien>
              <BoutonLien
                href="/estimation"
                onClick={() => setMobileMenu(false)}
              >
                Estimation
              </BoutonLien>
              <BoutonLien
                href="/#contact"
                onClick={() => setMobileMenu(false)}
              >
                Contact
              </BoutonLien>

              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenu(false)}
                className="mt-2 rounded-xl bg-green-500 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-green-600"
              >
                Discuter sur WhatsApp
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ESPACE SOUS LE HEADER FIXE */}

      <div className="h-[70px]" aria-hidden="true" />

      {/* BANDEAU DU PANIER */}

      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <nav
            aria-label="Fil d’Ariane"
            className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 sm:text-sm"
          >
            <Link href="/" className="transition hover:text-white">
              Accueil
            </Link>
            <span>/</span>
            <span className="text-orange-400">Mon panier</span>
          </nav>

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-100 sm:text-xs">
                <span className="h-2 w-2 rounded-full bg-orange-400" />
                Votre sélection solaire
              </span>

              <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Mon panier<span className="text-orange-400">.</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Retrouvez vos solutions solaires, ajustez les quantités
                et préparez votre demande de commande auprès de Solar Smart.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white">
                <Icone type="panier" className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Votre sélection
                </p>
                <p className="mt-1 text-lg font-black text-white">
                  {totalArticles}{" "}
                  {totalArticles > 1 ? "articles" : "article"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}

      <section className="bg-slate-50 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-500">
                Votre commande
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-blue-950 sm:text-3xl">
                Récapitulatif des produits
              </h2>
            </div>

            <Link
              href="/#produits"
              className="inline-flex min-h-[44px] items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-blue-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
            >
              <Icone type="retour" className="h-4 w-4" />
              Continuer les achats
            </Link>
          </div>

          {erreur && (
            <div
              role="alert"
              className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold leading-6 text-red-700"
            >
              {erreur}
            </div>
          )}

          {articles.length === 0 ? (
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-14 text-center sm:px-10 sm:py-20">
                <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-blue-50 text-blue-800">
                  <Icone type="panier" className="h-11 w-11" />
                </div>

                <span className="mt-7 rounded-full bg-orange-50 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-orange-600">
                  Aucun produit sélectionné
                </span>

                <h3 className="mt-4 text-2xl font-black text-blue-950 sm:text-3xl">
                  Votre panier est vide
                </h3>

                <p className="mt-4 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
                  Découvrez nos kits solaires maison et nos solutions de
                  pompage solaire. Ajoutez les produits qui vous intéressent
                  pour préparer votre demande.
                </p>

                <Link
                  href="/#produits"
                  className="mt-8 inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-orange-500 px-7 py-4 text-sm font-extrabold text-white shadow-lg shadow-orange-900/10 transition hover:-translate-y-0.5 hover:bg-orange-600"
                >
                  Découvrir nos produits
                  <Icone type="fleche" className="h-5 w-5" />
                </Link>

                <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <Icone type="securite" className="h-4 w-4 text-blue-700" />
                    Demande de commande
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Icone type="telephone" className="h-4 w-4 text-blue-700" />
                    Contact direct
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_370px] xl:gap-9">
              {/* LISTE DES PRODUITS */}

              <div className="min-w-0 space-y-4">
                {articles.map((produit, index) => {
                  const nom = nomProduit(produit);
                  const image = imageProduit(produit);
                  const prix = prixNombre(produit);
                  const quantite = quantiteProduit(produit);
                  const id = produit?.id ?? `${nom}-${index}`;

                  return (
                    <article
                      key={id}
                      className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md sm:rounded-[2rem]"
                    >
                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-6 sm:p-6">
                        {/* IMAGE */}

                        <Link
                          href="/#produits"
                          className="relative flex h-48 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 sm:h-36 sm:w-36"
                          aria-label={`Voir le catalogue : ${nom}`}
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={nom}
                              className="h-full w-full object-contain p-3"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-blue-800">
                              <span className="text-4xl">☀️</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Solar Smart
                              </span>
                            </div>
                          )}
                        </Link>

                        {/* DÉTAILS */}

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-800">
                              Produit solaire
                            </span>
                            {produit?.categorie && (
                              <span className="text-xs font-medium text-slate-400">
                                {produit.categorie}
                              </span>
                            )}
                          </div>

                          <h3 className="mt-3 break-words text-lg font-black text-blue-950 sm:text-xl">
                            {nom}
                          </h3>

                          {produit?.description && (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                              {produit.description}
                            </p>
                          )}

                          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Prix unitaire
                              </p>
                              <p className="mt-1 text-base font-black text-orange-500">
                                {formaterPrix(prix)}
                              </p>
                            </div>

                            <div>
                              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Quantité
                              </p>

                              <div className="flex h-10 items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                                <button
                                  type="button"
                                  aria-label={`Diminuer la quantité de ${nom}`}
                                  disabled={quantite <= 1}
                                  onClick={() =>
                                    modifierQuantite(produit, quantite - 1)
                                  }
                                  className="flex h-full w-10 items-center justify-center text-slate-600 transition hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  <Icone type="moins" className="h-4 w-4" />
                                </button>

                                <span className="flex h-full min-w-10 items-center justify-center border-x border-slate-200 px-3 text-sm font-black text-blue-950">
                                  {quantite}
                                </span>

                                <button
                                  type="button"
                                  aria-label={`Augmenter la quantité de ${nom}`}
                                  onClick={() =>
                                    modifierQuantite(produit, quantite + 1)
                                  }
                                  className="flex h-full w-10 items-center justify-center text-slate-600 transition hover:bg-blue-50 hover:text-blue-800"
                                >
                                  <Icone type="plus" className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                            <button
                              type="button"
                              onClick={() => {
                                removeFromCart(produit.id);
                                setErreur("");
                              }}
                              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 transition hover:text-red-600"
                            >
                              <Icone type="poubelle" className="h-4 w-4" />
                              Supprimer
                            </button>

                            <div className="text-right">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Sous-total
                              </p>
                              <p className="mt-1 text-lg font-black text-blue-950">
                                {formaterPrix(prix * quantite)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {/* INFORMATIONS DE CONFIANCE */}

                <div className="grid gap-3 pt-1 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                      <Icone type="telephone" className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-blue-950">
                        Besoin d’un conseil ?
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Échangez avec Solar Smart sur votre projet.
                      </p>
                      <a
                        href={`https://wa.me/${WHATSAPP}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs font-bold text-green-600 hover:underline"
                      >
                        Contacter notre équipe →
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <Icone type="livraison" className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-blue-950">
                        Livraison à confirmer
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Les frais et délais seront confirmés lors de la demande.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RÉCAPITULATIF ET FORMULAIRE */}

              <aside className="min-w-0 space-y-5 lg:sticky lg:top-[90px]">
                <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                  <div className="bg-blue-950 px-5 py-5 text-white sm:px-6">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                      Votre commande
                    </p>
                    <h3 className="mt-2 text-xl font-black">
                      Récapitulatif
                    </h3>
                    <p className="mt-2 text-sm text-blue-100/70">
                      Vérifiez votre sélection avant de nous l’envoyer.
                    </p>
                  </div>

                  <div className="space-y-4 p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-500">
                        Articles ({totalArticles})
                      </span>
                      <span className="font-bold text-blue-950">
                        {formaterPrix(sousTotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-500">Livraison</span>
                      <span className="text-right text-xs font-semibold text-slate-500">
                        À confirmer
                      </span>
                    </div>

                    <div className="border-t border-dashed border-slate-200 pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-blue-950">
                            Sous-total
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            Hors livraison éventuelle
                          </p>
                        </div>
                        <p className="text-right text-xl font-black text-orange-500">
                          {formaterPrix(sousTotal)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-800">
                      Le montant définitif, la disponibilité et les conditions
                      de livraison seront confirmés par notre équipe.
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={envoyerCommande}
                  className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm"
                >
                  <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                    <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-orange-500">
                      Étape suivante
                    </p>
                    <h3 className="mt-2 text-xl font-black text-blue-950">
                      Vos coordonnées
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Indiquez comment vous contacter pour confirmer votre
                      commande.
                    </p>
                  </div>

                  <div className="space-y-4 p-5 sm:p-6">
                    <Champ
                      label="Nom complet"
                      name="nom"
                      value={coordonnees.nom}
                      onChange={modifierCoordonnees}
                      placeholder="Votre nom et prénom"
                      required
                    />

                    <Champ
                      label="Téléphone"
                      name="telephone"
                      value={coordonnees.telephone}
                      onChange={modifierCoordonnees}
                      placeholder="+221 7X XXX XX XX"
                      type="tel"
                      required
                    />

                    <Champ
                      label="Adresse e-mail"
                      name="email"
                      value={coordonnees.email}
                      onChange={modifierCoordonnees}
                      placeholder="vous@exemple.com"
                      type="email"
                    />

                    <Champ
                      label="Adresse de livraison"
                      name="adresse"
                      value={coordonnees.adresse}
                      onChange={modifierCoordonnees}
                      placeholder="Quartier, rue, repère..."
                      required
                    />

                    <Champ
                      label="Ville"
                      name="ville"
                      value={coordonnees.ville}
                      onChange={modifierCoordonnees}
                      placeholder="Votre ville"
                      required
                    />

                    <div>
                      <label
                        htmlFor="instructions"
                        className="mb-2 block text-xs font-bold text-slate-700"
                      >
                        Instructions complémentaires
                        <span className="font-medium text-slate-400">
                          {" "}(facultatif)
                        </span>
                      </label>
                      <textarea
                        id="instructions"
                        name="instructions"
                        value={coordonnees.instructions}
                        onChange={modifierCoordonnees}
                        rows={3}
                        placeholder="Précisions utiles pour votre demande..."
                        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex min-h-[54px] w-full items-center justify-center gap-3 rounded-full bg-green-500 px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-green-900/10 transition hover:-translate-y-0.5 hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-200"
                    >
                      Envoyer sur WhatsApp
                      <Icone type="fleche" className="h-5 w-5" />
                    </button>

                    <p className="text-center text-xs leading-5 text-slate-400">
                      WhatsApp s’ouvrira avec le récapitulatif prérempli.
                      Vérifiez puis envoyez le message pour transmettre votre
                      demande à Solar Smart.
                    </p>

                    <div className="flex items-start gap-2 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
                      <Icone
                        type="securite"
                        className="mt-0.5 h-4 w-4 shrink-0 text-blue-700"
                      />
                      <p>
                        Cette étape transmet une demande de commande. Aucun
                        paiement n’est effectué sur cette page.
                      </p>
                    </div>
                  </div>
                </form>
              </aside>
            </div>
          )}
        </div>
      </section>

      {/* CONTACT RAPIDE */}

      <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-5 rounded-[1.75rem] bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 p-5 sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-2xl">
              ☀️
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Un projet solaire particulier ?
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100/70">
                Notre équipe peut vous aider à préciser votre besoin en kit
                solaire ou en pompage.
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600 sm:w-auto"
          >
            Contacter Solar Smart
            <Icone type="fleche" className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* PIED DE PAGE COMPLET */}

      <footer className="w-full bg-slate-950 text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-2 lg:grid-cols-3">
            {/* IDENTITÉ */}

            <div>
              <Link
                href="/"
                className="flex items-center gap-3 text-2xl font-black tracking-tight"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white">
                  <Image
                    src="/logo.png"
                    alt="Solar Smart"
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                  />
                </div>
                <span>
                  <span className="text-blue-400">Solar</span>{" "}
                  <span className="text-orange-500">Smart</span>
                </span>
              </Link>

              <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
                Des solutions solaires adaptées à vos besoins au Sénégal :
                kits solaires maison et systèmes de pompage solaire.
              </p>

              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-[46px] items-center gap-2 rounded-full bg-green-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-600"
              >
                <Icone type="telephone" className="h-4 w-4" />
                WhatsApp
              </a>
            </div>

            {/* LIENS */}

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Navigation
              </h3>

              <div className="mt-5 space-y-3">
                <LienFooter href="/">Accueil</LienFooter>
                <LienFooter href="/#services">Services</LienFooter>
                <LienFooter href="/#produits">Produits</LienFooter>
                <LienFooter href="/estimation">Estimation</LienFooter>
                <LienFooter href="/panier">Mon panier</LienFooter>
                <LienFooter href="/#contact">Contact</LienFooter>
              </div>
            </div>

            {/* COORDONNÉES */}

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Contact
              </h3>

              <div className="mt-5 space-y-4 text-sm text-slate-400">
                <a
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition hover:text-orange-400"
                >
                  +221 78 711 07 07
                </a>

                <a
                  href={`mailto:${EMAIL}`}
                  className="block break-all transition hover:text-orange-400"
                >
                  {EMAIL}
                </a>

                <p className="leading-6">{ADRESSE}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-7 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-slate-300">
                Solar Smart
              </span>
              . Tous droits réservés.
            </p>
            <p>Énergie solaire au Sénégal</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Champ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-bold text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-orange-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={
          name === "nom"
            ? "name"
            : name === "telephone"
              ? "tel"
              : name === "email"
                ? "email"
                : name === "adresse"
                  ? "street-address"
                  : "address-level2"
        }
        className="min-h-[46px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function LienFooter({ href, children }) {
  return (
    <Link
      href={href}
      className="block py-0.5 text-sm text-slate-400 transition hover:text-orange-400"
    >
      {children}
    </Link>
  );
}
