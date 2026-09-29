"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import CartIcon from "@/components/CartIcon";
import ProductCard from "@/components/ProductCard";

const WHATSAPP = "221787110707";
const EMAIL = "solartsmart.sn@gmail.com";

export default function Home() {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    chargerProduits();
  }, []);

  async function chargerProduits() {
    setLoading(true);
    setError("");

    try {
      const { data, error: supabaseError } = await supabase
        .from("produits")
        .select("*");

      if (supabaseError) {
        console.error("Erreur Supabase :", supabaseError);

        setError(
          supabaseError.message ||
            "Impossible de charger les produits."
        );

        setProduits([]);
        return;
      }

      const liste = Array.isArray(data) ? data : [];

      liste.sort((a, b) => {
        if (!a?.created_at || !b?.created_at) return 0;

        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
      });

      setProduits(liste);
    } catch (err) {
      console.error("Erreur inattendue :", err);

      setError(
        err?.message ||
          "Une erreur inattendue est survenue."
      );

      setProduits([]);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     OUTILS PRODUITS
  ========================================================= */

  function getCategorie(produit) {
    const categorie =
      produit?.categorie ||
      produit?.category ||
      produit?.type ||
      "";

    const valeur = String(categorie).toLowerCase();

    if (
      valeur.includes("pompage") ||
      valeur.includes("pompe")
    ) {
      return "Pompage solaire";
    }

    if (
      valeur.includes("kit") ||
      valeur.includes("maison")
    ) {
      return "Kit solaire";
    }

    return categorie || "Solution solaire";
  }

  function getNom(produit) {
    return (
      produit?.nom ||
      produit?.name ||
      produit?.titre ||
      produit?.title ||
      "Solution solaire"
    );
  }

  function getDescription(produit) {
    return (
      produit?.description ||
      produit?.details ||
      produit?.description_courte ||
      "Solution solaire adaptée à vos besoins énergétiques."
    );
  }

  function getImage(produit) {
    return (
      produit?.image_url ||
      produit?.image ||
      produit?.photo ||
      produit?.imageUrl ||
      null
    );
  }

  function getPrix(produit) {
    const prix =
      produit?.prix ??
      produit?.price ??
      produit?.montant ??
      null;

    if (
      prix === null ||
      prix === undefined ||
      prix === ""
    ) {
      return null;
    }

    const nombre = Number(prix);

    if (Number.isNaN(nombre)) {
      return String(prix);
    }

    return `${nombre.toLocaleString("fr-FR")} FCFA`;
  }

  function getComposants(produit) {
    const sources = [
      produit?.composants,
      produit?.components,
      produit?.composant,
      produit?.contenu,
      produit?.equipements,
      produit?.elements,
    ];

    const source = sources.find(
      (item) =>
        item !== null &&
        item !== undefined &&
        item !== ""
    );

    if (Array.isArray(source)) {
      return source
        .map((item) => {
          if (typeof item === "string") return item;

          if (item && typeof item === "object") {
            return (
              item.nom ||
              item.name ||
              item.label ||
              item.description ||
              JSON.stringify(item)
            );
          }

          return null;
        })
        .filter(Boolean);
    }

    if (typeof source === "string") {
      const texte = source.trim();

      if (!texte) return [];

      try {
        const parsed = JSON.parse(texte);

        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => {
              if (typeof item === "string") return item;

              if (item && typeof item === "object") {
                return (
                  item.nom ||
                  item.name ||
                  item.label ||
                  item.description ||
                  JSON.stringify(item)
                );
              }

              return null;
            })
            .filter(Boolean);
        }
      } catch {
        // Ce n'est pas du JSON, on continue normalement.
      }

      return texte
        .split(/\r?\n|,|;/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (
      source &&
      typeof source === "object" &&
      !Array.isArray(source)
    ) {
      return Object.entries(source)
        .map(([nom, valeur]) => {
          if (
            valeur === null ||
            valeur === undefined ||
            valeur === ""
          ) {
            return null;
          }

          return `${nom} : ${String(valeur)}`;
        })
        .filter(Boolean);
    }

    const composants = [];

    const champs = [
      ["panneau", "Panneau solaire"],
      ["panneaux", "Panneaux solaires"],
      ["panel", "Panneau solaire"],
      ["panels", "Panneaux solaires"],
      ["batterie", "Batterie"],
      ["batteries", "Batteries"],
      ["onduleur", "Onduleur"],
      ["onduleurs", "Onduleurs"],
      ["inverseur", "Inverseur"],
      ["regulateur", "Régulateur"],
      ["controleur", "Contrôleur"],
      ["contrôleur", "Contrôleur"],
      ["cable", "Câblage"],
      ["cables", "Câblage"],
      ["structure", "Structure"],
      ["pompe", "Pompe solaire"],
      ["reservoir", "Réservoir"],
      ["accessoires", "Accessoires"],
    ];

    champs.forEach(([champ, label]) => {
      const valeur = produit?.[champ];

      if (
        valeur !== undefined &&
        valeur !== null &&
        String(valeur).trim() !== ""
      ) {
        composants.push(
          `${label} : ${String(valeur)}`
        );
      }
    });

    return composants;
  }

  function getCaracteristiques(produit) {
    const result = [];

    const champs = [
      ["puissance", "Puissance"],
      ["puissance_w", "Puissance"],
      ["puissance_kw", "Puissance"],
      ["tension", "Tension"],
      ["capacite", "Capacité"],
      ["capacite_ah", "Capacité"],
      ["debit", "Débit"],
      ["hauteur", "Hauteur manométrique"],
      ["garantie", "Garantie"],
      ["marque", "Marque"],
      ["modele", "Modèle"],
      ["rendement", "Rendement"],
      ["voltage", "Voltage"],
    ];

    const dejaAjoute = new Set();

    champs.forEach(([champ, label]) => {
      const valeur = produit?.[champ];

      if (
        valeur !== undefined &&
        valeur !== null &&
        String(valeur).trim() !== "" &&
        !dejaAjoute.has(label)
      ) {
        result.push({
          label,
          value: String(valeur),
        });

        dejaAjoute.add(label);
      }
    });

    return result;
  }

  const totalProduits = useMemo(
    () => produits.length,
    [produits]
  );

  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-[100] border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-2xl">

        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

          <a
            href="#accueil"
            className="group flex items-center gap-3"
          >
            <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-300 group-hover:scale-105 group-hover:shadow-md">
              <Image
                src="/logo.png"
                alt="Solart Smart"
                fill
                sizes="44px"
                className="object-contain p-1"
              />
            </div>

            <div className="leading-none">
              <h1 className="text-xl font-black tracking-tight">
                <span className="text-blue-800">
                  Solart
                </span>
                <span className="text-orange-500">
                  {" "}Smart
                </span>
              </h1>

              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Énergie solaire
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-1 md:flex">

            <NavLink href="#accueil" active>
              Accueil
            </NavLink>

            <NavLink href="#services">
              Services
            </NavLink>

            <NavLink href="#produits">
              Produits
            </NavLink>

            <a
              href="/estimation"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-800"
            >
              Estimation
            </a>

            <div className="mx-2 h-7 w-px bg-slate-200" />

            <div className="rounded-xl p-1">
              <CartIcon />
            </div>

            <a
              href="#contact"
              className="ml-2 inline-flex items-center gap-2 rounded-full bg-blue-800 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-blue-900"
            >
              Contact
              <span className="text-orange-400">
                →
              </span>
            </a>

          </nav>

          <div className="flex items-center gap-2 md:hidden">

            <CartIcon />

            <button
              onClick={() =>
                setMobileMenu((value) => !value)
              }
              aria-label="Menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl text-blue-900"
            >
              {mobileMenu ? "×" : "☰"}
            </button>

          </div>

        </div>

        {mobileMenu && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 md:hidden">

            <div className="mx-auto flex max-w-7xl flex-col gap-1">

              {[
                ["#accueil", "Accueil"],
                ["#services", "Services"],
                ["#produits", "Produits"],
                ["/estimation", "Estimation"],
                ["#contact", "Contact"],
              ].map(([href, label]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileMenu(false)}
                  className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-800"
                >
                  {label}
                </a>
              ))}

              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 rounded-xl bg-green-500 px-4 py-3 text-center text-sm font-bold text-white"
              >
                WhatsApp
              </a>

            </div>
          </div>
        )}

      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        id="accueil"
        className="relative overflow-hidden bg-slate-950"
      >

        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 sm:py-24 lg:grid-cols-2 lg:px-8 lg:py-32">

          <div className="max-w-2xl">

            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 backdrop-blur-xl">

              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-orange-400 opacity-60" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-orange-400" />
              </span>

              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-100">
                Solutions solaires au Sénégal
              </span>

            </div>

            <h2 className="text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-7xl">

              Votre énergie.

              <span className="block text-orange-400">
                Votre indépendance.
              </span>

            </h2>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Solart Smart conçoit des solutions solaires adaptées à votre
              quotidien : kits solaires résidentiels, équipements et systèmes
              de pompage solaire.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-orange-500 px-7 py-4 text-sm font-extrabold text-white shadow-xl shadow-orange-900/20 transition hover:-translate-y-1 hover:bg-orange-600"
              >
                Discuter sur WhatsApp
                <span>→</span>
              </a>

              <a
                href="#produits"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-7 py-4 text-sm font-bold text-white backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/10"
              >
                Découvrir nos produits
              </a>

            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 border-t border-white/10 pt-7">

              <Stat
                value="100%"
                label="Énergie renouvelable"
              />

              <Stat
                value="24/7"
                label="Énergie disponible"
                border
              />

              <Stat
                value="Sénégal"
                label="Solutions locales"
                border
              />

            </div>

          </div>

          <div className="relative hidden lg:block">

            <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative mx-auto max-w-lg">

              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-3 shadow-2xl backdrop-blur-xl">

                <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 p-8">

                  <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-orange-400/20 blur-2xl" />

                  <div className="relative">

                    <div className="mb-10 flex items-center justify-between">

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-400 text-3xl shadow-lg">
                        ☀️
                      </div>

                      <span className="rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1.5 text-xs font-bold text-green-300">
                        ÉNERGIE PROPRE
                      </span>

                    </div>

                    <div className="relative mx-auto h-48 max-w-sm">

                      <div className="absolute left-1/2 top-1/2 h-28 w-64 -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] rounded-lg border-4 border-slate-400/60 bg-gradient-to-br from-blue-700 to-blue-950 shadow-2xl">

                        <div className="grid h-full grid-cols-4 grid-rows-2">

                          {Array.from({ length: 8 }).map(
                            (_, index) => (
                              <div
                                key={index}
                                className="border border-white/10"
                              />
                            )
                          )}

                        </div>

                      </div>

                      <div className="absolute bottom-1 left-1/2 h-12 w-2 -translate-x-1/2 bg-slate-500/70" />

                      <div className="absolute bottom-0 left-1/2 h-2 w-32 -translate-x-1/2 rounded-full bg-slate-500/60" />

                    </div>

                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                      Solart Smart
                    </p>

                    <h3 className="mt-2 text-2xl font-black text-white">
                      L'énergie solaire,
                      <span className="text-orange-400">
                        {" "}autrement.
                      </span>
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-blue-100/70">
                      Des solutions pensées pour votre maison,
                      votre exploitation et vos besoins énergétiques.
                    </p>

                  </div>

                </div>

              </div>

              <FloatingBadge
                side="left"
                icon="☀️"
                label="Kits Maison"
              />

              <FloatingBadge
                side="right"
                icon="💧"
                label="Pompage solaire"
              />

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          SERVICES
      ====================================================== */}

      <section
        id="services"
        className="relative overflow-hidden bg-slate-50 px-6 py-24 lg:py-28"
      >

        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="absolute -right-32 bottom-20 h-72 w-72 rounded-full bg-orange-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">

          <SectionHeading
            eyebrow="Nos solutions"
            title="Une solution solaire"
            accent="adaptée à votre besoin"
            description="Des solutions conçues pour les particuliers, les habitations et les exploitations au Sénégal."
          />

          <div className="mt-16 grid gap-7 lg:grid-cols-2">

            <ServiceCard
              href="#produits"
              type="Kit solaire"
              title="Kit Maison"
              description="Une solution complète pour alimenter votre maison avec l'énergie solaire et disposer d'une alimentation adaptée à votre consommation."
              icon="☀️"
              color="orange"
            />

            <ServiceCard
              href="#produits"
              type="Solution solaire"
              title="Pompage solaire"
              description="Des systèmes de pompage alimentés par le solaire pour les forages, l'agriculture, l'irrigation et l'approvisionnement en eau."
              icon="💧"
              color="cyan"
            />

          </div>

        </div>
      </section>

      {/* =====================================================
          PRODUITS
      ====================================================== */}

      <section
        id="produits"
        className="relative overflow-hidden bg-white px-6 py-24 lg:py-28"
      >

        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-blue-50 blur-3xl" />

        <div className="absolute -left-40 bottom-10 h-96 w-96 rounded-full bg-orange-50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div className="max-w-2xl">

              <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-blue-800">
                Notre catalogue
              </span>

              <h3 className="mt-5 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl lg:text-5xl">
                Nos solutions
                <span className="block text-orange-500">
                  solaires.
                </span>
              </h3>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Cliquez sur un produit pour découvrir son contenu,
                ses composants et ses caractéristiques.
              </p>

            </div>

            {!loading && !error && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Catalogue
                </p>

                <p className="mt-1 text-sm font-black text-blue-950">
                  {totalProduits}{" "}
                  {totalProduits > 1
                    ? "solutions"
                    : "solution"}{" "}
                  disponible
                  {totalProduits > 1 ? "s" : ""}
                </p>

              </div>
            )}

          </div>

          {/* CHARGEMENT */}

          {loading && (
            <div className="mt-14">

              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
                  >

                    <div className="h-64 animate-pulse bg-slate-100" />

                    <div className="space-y-4 p-6">

                      <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />

                      <div className="h-7 w-3/4 animate-pulse rounded-lg bg-slate-100" />

                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />

                      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />

                    </div>

                  </div>
                ))}

              </div>

              <div className="mt-7 text-center">

                <span className="inline-flex items-center gap-3 rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-500">

                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-700" />

                  Chargement des solutions...

                </span>

              </div>

            </div>
          )}

          {/* ERREUR */}

          {!loading && error && (
            <div className="mx-auto mt-14 max-w-2xl rounded-[2rem] border border-red-200 bg-red-50 p-8 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-600">
                !
              </div>

              <h4 className="mt-5 text-xl font-black text-red-800">
                Impossible de charger les produits
              </h4>

              <p className="mt-2 text-sm leading-6 text-red-600">
                {error}
              </p>

              <button
                onClick={chargerProduits}
                className="mt-6 rounded-full bg-red-600 px-7 py-3 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Réessayer
              </button>

              <p className="mt-5 text-xs text-red-400">
                Vérifiez également que la table{" "}
                <strong>produits</strong> existe dans
                Supabase et que sa politique RLS autorise la lecture
                publique.
              </p>

            </div>
          )}

          {/* AUCUN PRODUIT */}

          {!loading &&
            !error &&
            produits.length === 0 && (
              <div className="mx-auto mt-14 max-w-2xl rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center sm:p-14">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-4xl">
                  ☀️
                </div>

                <h4 className="mt-6 text-2xl font-black text-blue-950">
                  Aucun produit disponible
                </h4>

                <p className="mx-auto mt-3 max-w-md leading-7 text-slate-500">
                  Aucun produit n'est actuellement disponible
                  dans votre catalogue.
                </p>

                <button
                  onClick={chargerProduits}
                  className="mt-7 rounded-full bg-blue-800 px-7 py-3 text-sm font-bold text-white transition hover:bg-blue-900"
                >
                  Actualiser
                </button>

              </div>
            )}

          {/* PRODUITS */}

          {!loading &&
            !error &&
            produits.length > 0 && (
              <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

                {produits.map((produit, index) => {

                  const nom = getNom(produit);
                  const categorie = getCategorie(produit);
                  const prix = getPrix(produit);

                  return (
                    <article
                      key={
                        produit.id ||
                        `${nom}-${index}`
                      }
                      className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:border-blue-200 hover:shadow-2xl"
                    >

                      <div className="absolute left-4 top-4 z-20">
                        <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-900 shadow-sm backdrop-blur">
                          {categorie}
                        </span>
                      </div>

                      <div className="relative overflow-hidden">
                        <ProductCard produit={produit} />
                      </div>

                      <div className="border-t border-slate-100 bg-white p-5">

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <h4 className="truncate text-lg font-black text-blue-950">
                              {nom}
                            </h4>

                            {prix && (
                              <p className="mt-1 text-sm font-extrabold text-orange-500">
                                {prix}
                              </p>
                            )}

                          </div>

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-800 transition group-hover:bg-orange-500 group-hover:text-white">
                            →
                          </div>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedProduct(produit)
                          }
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-800"
                        >
                          Voir les détails du kit
                          <span>→</span>
                        </button>

                      </div>

                    </article>
                  );
                })}

              </div>
            )}

          {/* CTA */}

          {!loading &&
            !error &&
            produits.length > 0 && (
              <div className="mt-14 overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 p-7 shadow-xl sm:p-9">

                <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">

                  <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-2xl shadow-lg">
                      ☀️
                    </div>

                    <div>

                      <p className="font-black text-white">
                        Besoin d'une solution personnalisée ?
                      </p>

                      <p className="mt-1 text-sm text-blue-100/70">
                        Nous pouvons étudier votre consommation.
                      </p>

                    </div>

                  </div>

                  <a
                    href="/estimation"
                    className="rounded-full bg-orange-500 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600"
                  >
                    Estimer ma consommation
                  </a>

                </div>

              </div>
            )}

        </div>
      </section>

      {/* =====================================================
          CONTACT
      ====================================================== */}

      <section
        id="contact"
        className="relative overflow-hidden bg-blue-950 px-6 py-24 lg:py-28"
      >

        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">

          <div className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] shadow-2xl backdrop-blur-xl lg:grid-cols-2">

            <div className="p-8 sm:p-12 lg:p-14">

              <span className="inline-flex rounded-full bg-orange-500/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-400">
                Contactez-nous
              </span>

              <h3 className="mt-6 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                Parlons de votre
                <span className="block text-orange-400">
                  projet solaire.
                </span>
              </h3>

              <p className="mt-6 max-w-xl text-base leading-7 text-blue-100/70 sm:text-lg">
                Vous souhaitez installer un kit solaire ou mettre
                en place une solution de pompage ? Contactez-nous
                pour échanger sur votre projet.
              </p>

              <div className="mt-10 space-y-4">

                <ContactItem
                  href={`https://wa.me/${WHATSAPP}`}
                  icon="◉"
                  title="WhatsApp"
                  value="+221 78 711 07 07"
                  green
                />

                <ContactItem
                  href={`mailto:${EMAIL}`}
                  icon="@"
                  title="Email"
                  value={EMAIL}
                />

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
                    📍
                  </div>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                      Adresse
                    </p>

                    <p className="mt-1 font-bold leading-6 text-white">
                      Pikine Icotaf 3,
                      <br />
                      Tally Mbaye Gakou,
                      <br />
                      en face Sandika — Sénégal
                    </p>

                  </div>

                </div>

              </div>

            </div>

            <div className="relative flex min-h-[500px] items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 to-blue-800 p-8 sm:p-12">

              <div className="relative w-full max-w-md">

                <div className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-7 shadow-2xl backdrop-blur-xl sm:p-9">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-3xl shadow-lg">
                    ☀️
                  </div>

                  <h4 className="mt-7 text-2xl font-black text-white sm:text-3xl">
                    Votre projet commence ici.
                  </h4>

                  <p className="mt-4 leading-7 text-blue-100/70">
                    Une question sur un kit solaire, une installation
                    ou un système de pompage ? Échangez directement
                    avec nous.
                  </p>

                  <a
                    href={`https://wa.me/${WHATSAPP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-green-500 px-6 py-4 font-extrabold text-white shadow-lg transition hover:-translate-y-1 hover:bg-green-600"
                  >
                    Discuter sur WhatsApp
                    <span>→</span>
                  </a>

                  <div className="mt-7 border-t border-white/10 pt-6">

                    <CheckLine>
                      Réponse rapide
                    </CheckLine>

                    <CheckLine>
                      Étude adaptée à votre besoin
                    </CheckLine>

                    <CheckLine>
                      Solutions solaires au Sénégal
                    </CheckLine>

                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="bg-slate-950 text-white">

        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">

          <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-2 lg:grid-cols-3">

            <div>

              <a
                href="#accueil"
                className="text-2xl font-black tracking-tight"
              >
                <span className="text-blue-400">
                  Solart
                </span>
                <span className="text-orange-500">
                  {" "}Smart
                </span>
              </a>

              <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
                Des solutions solaires adaptées à vos besoins au Sénégal :
                kits solaires maison et pompage solaire.
              </p>

              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-600"
              >
                ◉ WhatsApp
              </a>

            </div>

            <div>

              <h3 className="text-sm font-bold uppercase tracking-wider">
                Navigation
              </h3>

              <div className="mt-5 space-y-3">

                <FooterLink href="#accueil">
                  Accueil
                </FooterLink>

                <FooterLink href="#services">
                  Services
                </FooterLink>

                <FooterLink href="#produits">
                  Produits
                </FooterLink>

                <FooterLink href="#contact">
                  Contact
                </FooterLink>

              </div>

            </div>

            <div>

              <h3 className="text-sm font-bold uppercase tracking-wider">
                Contact
              </h3>

              <div className="mt-5 space-y-4 text-sm text-slate-400">

                <a
                  href={`tel:+${WHATSAPP}`}
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

                <p className="leading-6">
                  Pikine Icotaf 3,
                  <br />
                  Tally Mbaye Gakou,
                  <br />
                  en face Sandika — Sénégal
                </p>

              </div>

            </div>

          </div>

          <div className="flex flex-col gap-3 pt-7 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">

            <p>
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-slate-300">
                Solart Smart
              </span>
              . Tous droits réservés.
            </p>

            <p>
              Énergie solaire au Sénégal
            </p>

          </div>

        </div>
      </footer>

      {/* =====================================================
          MODALE DÉTAILS PRODUIT
      ====================================================== */}

      {selectedProduct && (
        <ProductDetailsModal
          produit={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          getNom={getNom}
          getCategorie={getCategorie}
          getDescription={getDescription}
          getImage={getImage}
          getPrix={getPrix}
          getComposants={getComposants}
          getCaracteristiques={getCaracteristiques}
        />
      )}

    </main>
  );
}

/* ===========================================================
   NAVIGATION
=========================================================== */

function NavLink({ href, children, active = false }) {
  return (
    <a
      href={href}
      className={`group relative rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "text-blue-800"
          : "text-slate-600 hover:bg-blue-50 hover:text-blue-800"
      }`}
    >
      {children}

      <span
        className={`absolute bottom-1 left-4 right-4 h-0.5 rounded-full bg-orange-500 transition-transform ${
          active
            ? "scale-x-100"
            : "origin-left scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </a>
  );
}

/* ===========================================================
   STAT
=========================================================== */

function Stat({ value, label, border }) {
  return (
    <div
      className={`pr-4 ${
        border
          ? "border-l border-white/10 px-4"
          : ""
      }`}
    >
      <p className="text-2xl font-black text-white sm:text-3xl">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
        {label}
      </p>
    </div>
  );
}

/* ===========================================================
   BADGE FLOTTANT
=========================================================== */

function FloatingBadge({
  side,
  icon,
  label,
}) {
  return (
    <div
      className={`absolute ${
        side === "left"
          ? "-left-8 bottom-12"
          : "-right-8 top-14"
      } hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xl xl:block`}
    >
      <div className="flex items-center gap-3">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
          {icon}
        </div>

        <div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            SOLAIRE
          </p>

          <p className="text-sm font-black text-blue-950">
            {label}
          </p>

        </div>

      </div>
    </div>
  );
}

/* ===========================================================
   TITRE SECTION
=========================================================== */

function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">

      <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">
        {eyebrow}
      </span>

      <h3 className="mt-5 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl lg:text-5xl">

        {title}

        <span className="block text-orange-500">
          {accent}
        </span>

      </h3>

      <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
        {description}
      </p>

    </div>
  );
}

/* ===========================================================
   SERVICE CARD
=========================================================== */

function ServiceCard({
  href,
  type,
  title,
  description,
  icon,
  color,
}) {
  const isOrange = color === "orange";

  return (
    <a
      href={href}
      className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-2xl"
    >

      <div
        className={`relative h-64 overflow-hidden ${
          isOrange
            ? "bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700"
            : "bg-gradient-to-br from-blue-950 via-blue-800 to-cyan-700"
        }`}
      >

        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute left-7 top-7">

          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
            {type}
          </span>

        </div>

        <div className="absolute bottom-7 left-1/2 flex h-32 w-64 -translate-x-1/2 items-center justify-center rounded-2xl border border-white/20 bg-white/[0.08] text-6xl shadow-2xl backdrop-blur-md transition duration-500 group-hover:scale-105">
          {icon}
        </div>

      </div>

      <div className="p-8">

        <div className="flex items-start justify-between gap-5">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
              {type}
            </p>

            <h4 className="mt-2 text-2xl font-black text-blue-950 sm:text-3xl">
              {title}
            </h4>

          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg text-blue-800 transition group-hover:bg-orange-500 group-hover:text-white">
            →
          </div>

        </div>

        <p className="mt-5 leading-7 text-slate-600">
          {description}
        </p>

        <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-6">

          <span className="text-sm font-bold text-blue-800">
            Découvrir la solution
          </span>

          <span className="text-xl text-orange-500 transition group-hover:translate-x-2">
            →
          </span>

        </div>

      </div>
    </a>
  );
}

/* ===========================================================
   CONTACT
=========================================================== */

function ContactItem({
  href,
  icon,
  title,
  value,
  green = false,
}) {
  return (
    <a
      href={href}
      target={
        href.startsWith("https://")
          ? "_blank"
          : undefined
      }
      rel={
        href.startsWith("https://")
          ? "noopener noreferrer"
          : undefined
      }
      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition hover:bg-white/[0.1]"
    >

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl text-white ${
          green
            ? "bg-green-500"
            : "bg-orange-500"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
          {title}
        </p>

        <p className="mt-1 break-all font-bold text-white">
          {value}
        </p>

      </div>

      <span className="text-xl text-orange-400 transition group-hover:translate-x-1">
        →
      </span>

    </a>
  );
}

/* ===========================================================
   CHECK LINE
=========================================================== */

function CheckLine({ children }) {
  return (
    <div className="mt-3 flex items-center gap-3">

      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-400/10 text-green-400">
        ✓
      </span>

      <p className="text-sm font-medium text-blue-100">
        {children}
      </p>

    </div>
  );
}

/* ===========================================================
   FOOTER LINK
=========================================================== */

function FooterLink({ href, children }) {
  return (
    <a
      href={href}
      className="block text-sm text-slate-400 transition hover:text-orange-400"
    >
      {children}
    </a>
  );
}

/* ===========================================================
   MODALE DÉTAILS PRODUIT
=========================================================== */

function ProductDetailsModal({
  produit,
  onClose,
  getNom,
  getCategorie,
  getDescription,
  getImage,
  getPrix,
  getComposants,
  getCaracteristiques,
}) {
  const nom = getNom(produit);
  const categorie = getCategorie(produit);
  const description = getDescription(produit);
  const image = getImage(produit);
  const prix = getPrix(produit);
  const composants = getComposants(produit);
  const caracteristiques =
    getCaracteristiques(produit);

  useEffect(() => {
    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        originalOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-md sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >

      <div className="relative max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem]">

        {/* HEADER */}

        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-7">

          <div>

            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-orange-500">
              Détails du produit
            </p>

            <h3 className="mt-1 text-lg font-black text-blue-950 sm:text-xl">
              {nom}
            </h3>

          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600 transition hover:bg-slate-200"
          >
            ×
          </button>

        </div>

        {/* CONTENU */}

        <div className="grid lg:grid-cols-2">

          {/* IMAGE */}

          <div className="bg-slate-50 p-5 sm:p-8">

            <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white sm:min-h-[440px]">

              {image ? (
                /*
                 * IMPORTANT :
                 * On utilise <img> ici et non <Image>.
                 * L'image vient du Storage Supabase et n'a
                 * donc pas besoin d'être déclarée dans
                 * next.config.js.
                 */
                <img
                  src={image}
                  alt={nom}
                  className="absolute inset-0 h-full w-full object-contain p-8"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center">

                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 text-5xl">
                    ☀️
                  </div>

                  <p className="mt-5 text-sm font-semibold text-slate-400">
                    Solution solaire
                  </p>

                </div>
              )}

              <div className="absolute left-4 top-4">
                <span className="rounded-full bg-blue-950 px-4 py-2 text-xs font-bold text-white shadow-lg">
                  {categorie}
                </span>
              </div>

            </div>

          </div>

          {/* INFORMATIONS */}

          <div className="p-6 sm:p-8 lg:p-10">

            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-500">
              {categorie}
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">
              {nom}
            </h2>

            {prix && (
              <p className="mt-4 text-2xl font-black text-orange-500">
                {prix}
              </p>
            )}

            {/* DESCRIPTION */}

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">

              <p className="text-sm font-bold text-blue-950">
                Description
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                {description}
              </p>

            </div>

            {/* CARACTÉRISTIQUES */}

            {caracteristiques.length > 0 && (
              <div className="mt-7">

                <h4 className="text-lg font-black text-blue-950">
                  Caractéristiques
                </h4>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">

                  {caracteristiques.map(
                    (item, index) => (
                      <div
                        key={`${item.label}-${index}`}
                        className="rounded-xl border border-slate-200 bg-white p-4"
                      >

                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          {item.label}
                        </p>

                        <p className="mt-1 text-sm font-bold text-blue-950">
                          {item.value}
                        </p>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

            {/* COMPOSANTS */}

            <div className="mt-8">

              <div className="flex items-center justify-between gap-3">

                <h4 className="text-lg font-black text-blue-950">
                  Contenu du kit
                </h4>

                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
                  {composants.length}{" "}
                  {composants.length > 1
                    ? "éléments"
                    : "élément"}
                </span>

              </div>

              {composants.length > 0 ? (
                <div className="mt-4 space-y-3">

                  {composants.map(
                    (composant, index) => (
                      <div
                        key={`${composant}-${index}`}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >

                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-black text-green-600">
                          ✓
                        </span>

                        <p className="text-sm font-semibold leading-6 text-slate-700">
                          {composant}
                        </p>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">

                  <p className="text-sm leading-6 text-slate-500">
                    Les composants détaillés de ce kit seront
                    communiqués lors de l'étude de votre besoin.
                  </p>

                </div>
              )}

            </div>

            {/* ACTIONS */}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                  `Bonjour Solart Smart, je souhaite avoir plus d'informations sur le produit "${nom}".`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-4 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-green-600"
              >
                WhatsApp
                <span>→</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full border-2 border-slate-200 px-6 py-4 text-sm font-bold text-slate-700 transition hover:border-blue-800 hover:text-blue-800"
              >
                Fermer
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}