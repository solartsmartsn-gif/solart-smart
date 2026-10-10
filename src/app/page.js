
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    chargerProduits();

    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
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
        if (!a?.created_at || !b?.created_at) {
          return 0;
        }

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
      return "Kit Maison";
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
          if (typeof item === "string") {
            return item;
          }

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

      if (!texte) {
        return [];
      }

      try {
        const parsed = JSON.parse(texte);

        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => {
              if (typeof item === "string") {
                return item;
              }

              if (
                item &&
                typeof item === "object"
              ) {
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
        // Texte normal.
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
    <main className="relative min-h-screen w-full bg-white text-slate-900">

      {/* HEADER FIXE : TOUJOURS VISIBLE */}

      <header
        className={`fixed inset-x-0 top-0 z-[100] w-full border-b transition-all duration-300 ${
          scrolled
            ? "border-slate-200/80 bg-white/95 shadow-lg backdrop-blur-2xl"
            : "border-slate-200/60 bg-white/95 shadow-sm backdrop-blur-xl"
        }`}
      >
        <div
          className={`mx-auto flex w-full max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
            scrolled
              ? "h-[64px]"
              : "h-[70px] sm:h-[74px]"
          }`}
        >

          {/* LOGO */}

          <a
            href="#accueil"
            className="group flex min-w-0 items-center gap-2.5"
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition duration-300 group-hover:scale-105 group-hover:shadow-md sm:h-11 sm:w-11">
              <Image
                src="/logo.png"
                alt="Solar Smart"
                fill
                sizes="44px"
                className="object-contain p-1"
              />
            </div>

            <div className="min-w-0 leading-none">
              <h1 className="truncate text-lg font-black tracking-tight sm:text-xl">
                <span className="text-blue-800">
                  Solar
                </span>{" "}
                <span className="text-orange-500">
                  Smart
                </span>
              </h1>

              <p className="mt-1 truncate text-[8px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Énergie solaire
              </p>
            </div>
          </a>

          {/* NAVIGATION DESKTOP */}

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

            <CartIcon />

            <a
              href="#contact"
              className="ml-2 inline-flex items-center gap-2 rounded-full bg-blue-800 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-900 hover:shadow-xl"
            >
              Contact
              <span className="text-orange-400">
                →
              </span>
            </a>

          </nav>

          {/* NAVIGATION MOBILE */}

          <div className="flex items-center gap-2 md:hidden">

            <CartIcon />

            <button
              type="button"
              onClick={() =>
                setMobileMenu((value) => !value)
              }
              aria-label={
                mobileMenu
                  ? "Fermer le menu"
                  : "Ouvrir le menu"
              }
              aria-expanded={mobileMenu}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-blue-900 transition hover:bg-blue-50"
            >
              {mobileMenu ? "×" : "☰"}
            </button>

          </div>
        </div>

        {/* MENU MOBILE */}

        {mobileMenu && (
          <div className="max-h-[calc(100dvh-64px)] animate-menu overflow-y-auto border-t border-slate-100 bg-white px-4 py-3 shadow-xl md:hidden">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-1">

              <MobileNavLink
                href="#accueil"
                onClick={() => setMobileMenu(false)}
              >
                Accueil
              </MobileNavLink>

              <MobileNavLink
                href="#services"
                onClick={() => setMobileMenu(false)}
              >
                Services
              </MobileNavLink>

              <MobileNavLink
                href="#produits"
                onClick={() => setMobileMenu(false)}
              >
                Produits
              </MobileNavLink>

              <MobileNavLink
                href="/estimation"
                onClick={() => setMobileMenu(false)}
              >
                Estimation
              </MobileNavLink>

              <MobileNavLink
                href="#contact"
                onClick={() => setMobileMenu(false)}
              >
                Contact
              </MobileNavLink>

              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenu(false)}
                className="mt-2 rounded-xl bg-green-500 px-4 py-3 text-center text-sm font-bold text-white shadow-md transition hover:bg-green-600"
              >
                Discuter sur WhatsApp
              </a>

            </div>
          </div>
        )}
      </header>

      {/* ESPACE POUR NE PAS CACHER LE DÉBUT DE LA PAGE */}

      <div
        className="h-[70px] sm:h-[74px]"
        aria-hidden="true"
      />

      {/* HERO */}

      <section
        id="accueil"
        className="relative w-full scroll-mt-20 overflow-hidden bg-slate-950"
      >

        <div className="absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-3xl sm:h-[550px] sm:w-[550px]" />

        <div className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-orange-500/10 blur-3xl sm:h-[550px] sm:w-[550px]" />

        <div className="pointer-events-none absolute inset-0 opacity-[0.035] solar-grid" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-32">

          <div className="min-w-0 animate-fade-up">

            <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 backdrop-blur-xl sm:mb-7 sm:px-4">

              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-orange-400 opacity-60" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-orange-400" />
              </span>

              <span className="truncate text-[9px] font-bold uppercase tracking-[0.12em] text-blue-100 sm:text-[11px] sm:tracking-[0.18em]">
                Solutions solaires au Sénégal
              </span>

            </div>

            <h2 className="break-words text-[2.5rem] font-black leading-[1.03] tracking-tight text-white sm:text-5xl lg:text-7xl">

              Votre énergie.

              <span className="block text-orange-400">
                Votre indépendance.
              </span>

            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:mt-7 sm:text-lg sm:leading-8">
              Solar Smart vous accompagne avec des solutions
              solaires adaptées à votre quotidien : kits maison
              et systèmes de pompage solaire.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">

              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="solart-button inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full bg-orange-500 px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-orange-900/20 sm:w-auto sm:px-7"
              >
                Discuter sur WhatsApp
                <span>→</span>
              </a>

              <a
                href="#produits"
                className="solart-button inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-6 py-4 text-sm font-bold text-white backdrop-blur-md sm:w-auto sm:px-7"
              >
                Découvrir nos produits
              </a>

            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 border-t border-white/10 pt-6 sm:mt-12 sm:pt-7">

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

          {/* VISUEL */}

          <div className="relative hidden animate-fade-in lg:block">

            <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative mx-auto w-full max-w-lg">

              <div className="solart-float overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-3 shadow-2xl backdrop-blur-xl">

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
                      Solar Smart
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

      {/* SERVICES */}

      <section
        id="services"
        className="relative w-full scroll-mt-20 overflow-hidden bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28"
      >

        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="absolute -right-32 bottom-20 h-72 w-72 rounded-full bg-orange-100/50 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl">

          <SectionHeading
            eyebrow="Nos solutions"
            title="Une solution solaire"
            accent="adaptée à votre besoin"
            description="Des solutions pensées pour les maisons et les besoins de pompage solaire au Sénégal."
          />

          <div className="mt-10 grid gap-5 sm:mt-16 sm:gap-7 lg:grid-cols-2">

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

      {/* PRODUITS */}

      <section
        id="produits"
        className="relative w-full scroll-mt-20 overflow-hidden bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28"
      >

        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-blue-50 blur-3xl" />

        <div className="absolute -left-40 bottom-10 h-96 w-96 rounded-full bg-orange-50 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div className="max-w-2xl">

              <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-blue-800">
                Notre catalogue
              </span>

              <h3 className="mt-5 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl lg:text-5xl">
                Nos solutions
                <span className="block text-orange-500">
                  solaires.
                </span>
              </h3>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Découvrez nos solutions disponibles et consultez
                les détails de chaque kit.
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
                    ? "solutions disponibles"
                    : "solution disponible"}
                </p>

              </div>
            )}

          </div>

          {/* CHARGEMENT */}

          {loading && (
            <div className="mt-10 sm:mt-14">

              <div className="grid gap-5 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">

                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="h-52 animate-pulse bg-slate-100 sm:h-64" />

                    <div className="space-y-4 p-5 sm:p-6">
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
            <div className="mx-auto mt-10 max-w-2xl rounded-[2rem] border border-red-200 bg-red-50 p-7 text-center sm:mt-14 sm:p-8">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-600">
                !
              </div>

              <h4 className="mt-5 text-xl font-black text-red-800">
                Impossible de charger les produits
              </h4>

              <p className="mt-2 break-words text-sm leading-6 text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={chargerProduits}
                className="mt-6 rounded-full bg-red-600 px-7 py-3 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Réessayer
              </button>

            </div>
          )}

          {/* CATALOGUE VIDE */}

          {!loading && !error && produits.length === 0 && (
            <div className="mx-auto mt-10 max-w-2xl rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center sm:mt-14 sm:p-14">

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
                type="button"
                onClick={chargerProduits}
                className="mt-7 rounded-full bg-blue-800 px-7 py-3 text-sm font-bold text-white transition hover:bg-blue-900"
              >
                Actualiser
              </button>

            </div>
          )}

          {/* LISTE DES PRODUITS */}

          {!loading && !error && produits.length > 0 && (
            <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">

              {produits.map((produit, index) => {
                const nom = getNom(produit);
                const categorie = getCategorie(produit);
                const prix = getPrix(produit);

                return (
                  <article
                    key={produit.id || `${nom}-${index}`}
                    className="solart-hover-card group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
                  >

                    <div className="absolute left-3 top-3 z-20 sm:left-4 sm:top-4">
                      <span className="inline-block max-w-[230px] truncate rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-blue-900 shadow-sm backdrop-blur sm:text-[10px]">
                        {categorie}
                      </span>
                    </div>

                    <div className="overflow-hidden [&>div]:!rounded-none [&>div]:!border-0 [&>div]:!shadow-none">
                      <ProductCard produit={produit} />
                    </div>

                    <div className="border-t border-slate-100 bg-white p-4 sm:p-5">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0 flex-1">
                          <h4 className="break-words text-base font-black text-blue-950 sm:text-lg">
                            {nom}
                          </h4>

                          {prix && (
                            <p className="mt-1 text-sm font-extrabold text-orange-500">
                              {prix}
                            </p>
                          )}
                        </div>

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-800 transition duration-300 group-hover:bg-orange-500 group-hover:text-white">
                          →
                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedProduct(produit)}
                        className="solart-button mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white sm:mt-5"
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

          {/* APPEL À L'ACTION */}

          {!loading && !error && produits.length > 0 && (
            <div className="mt-10 overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 p-5 shadow-xl sm:mt-14 sm:p-9">

              <div className="flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">

                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-2xl shadow-lg sm:h-14 sm:w-14">
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
                  className="solart-button inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-orange-500 px-6 py-3.5 text-sm font-bold text-white sm:w-auto"
                >
                  Estimer ma consommation
                </a>

              </div>
            </div>
          )}

        </div>
      </section>

      {/* CONTACT */}

      <section
        id="contact"
        className="relative w-full scroll-mt-20 overflow-hidden bg-blue-950 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28"
      >

        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl">

          <div className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] shadow-2xl backdrop-blur-xl lg:grid-cols-2">

            <div className="p-6 sm:p-10 lg:p-14">

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

              <div className="mt-8 space-y-4 sm:mt-10">

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

                <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4">

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

            <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 to-blue-800 p-5 sm:min-h-[500px] sm:p-10">

              <div className="relative w-full max-w-md">

                <div className="solart-glass rounded-[2rem] p-6 sm:p-9">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-3xl shadow-lg">
                    ☀️
                  </div>

                  <h4 className="mt-7 text-2xl font-black text-white sm:text-3xl">
                    Votre projet commence ici.
                  </h4>

                  <p className="mt-4 leading-7 text-blue-100/70">
                    Une question sur un kit solaire ou un système
                    de pompage ? Échangez directement avec nous.
                  </p>

                  <a
                    href={`https://wa.me/${WHATSAPP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="solart-button mt-8 flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full bg-green-500 px-6 py-4 font-extrabold text-white shadow-lg"
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

      {/* FOOTER */}

      <footer className="w-full bg-slate-950 text-white">

        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">

          <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-2 lg:grid-cols-3">

            <div>

              <a
                href="#accueil"
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
                  <span className="text-blue-400">
                    Solar
                  </span>{" "}
                  <span className="text-orange-500">
                    Smart
                  </span>
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
                className="mt-6 inline-flex min-h-[46px] items-center gap-2 rounded-full bg-green-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-600"
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

                <FooterLink href="/estimation">
                  Estimation
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
                Solar Smart
              </span>
              . Tous droits réservés.
            </p>

            <p>
              Énergie solaire au Sénégal
            </p>

          </div>

        </div>
      </footer>

      {/* MODALE PRODUIT */}

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

function NavLink({
  href,
  children,
  active = false,
}) {
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
        className={`absolute bottom-1 left-4 right-4 h-0.5 origin-left rounded-full bg-orange-500 transition-transform ${
          active
            ? "scale-x-100"
            : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </a>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-800"
    >
      {children}
    </a>
  );
}

/* ===========================================================
   STATISTIQUES
=========================================================== */

function Stat({
  value,
  label,
  border,
}) {
  return (
    <div
      className={`min-w-0 pr-2 ${
        border
          ? "border-l border-white/10 pl-2 sm:px-4"
          : ""
      }`}
    >
      <p className="break-words text-xl font-black text-white sm:text-3xl">
        {value}
      </p>

      <p className="mt-1 break-words text-[10px] leading-4 text-slate-400 sm:text-sm sm:leading-5">
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
   TITRE DE SECTION
=========================================================== */

function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
}) {
  return (
    <div className="mx-auto w-full max-w-3xl text-center">

      <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-orange-600 sm:tracking-[0.18em]">
        {eyebrow}
      </span>

      <h3 className="mt-5 break-words text-3xl font-black tracking-tight text-blue-950 sm:text-4xl lg:text-5xl">
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
   CARTE SERVICE
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
      className="solart-hover-card group min-w-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
    >

      <div
        className={`relative h-52 overflow-hidden sm:h-64 ${
          isOrange
            ? "bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700"
            : "bg-gradient-to-br from-blue-950 via-blue-800 to-cyan-700"
        }`}
      >

        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute left-5 top-5 sm:left-7 sm:top-7">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md sm:px-4 sm:text-xs">
            {type}
          </span>
        </div>

        <div className="absolute bottom-5 left-1/2 flex h-28 w-[75%] max-w-xs -translate-x-1/2 items-center justify-center rounded-2xl border border-white/20 bg-white/[0.08] text-5xl shadow-2xl backdrop-blur-md transition duration-500 group-hover:scale-105 sm:bottom-7 sm:h-32 sm:text-6xl">
          {icon}
        </div>

      </div>

      <div className="p-5 sm:p-8">

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
              {type}
            </p>

            <h4 className="mt-2 break-words text-2xl font-black text-blue-950 sm:text-3xl">
              {title}
            </h4>

          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg text-blue-800 transition group-hover:bg-orange-500 group-hover:text-white sm:h-11 sm:w-11">
            →
          </div>

        </div>

        <p className="mt-5 leading-7 text-slate-600">
          {description}
        </p>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5 sm:mt-7 sm:pt-6">

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
   ÉLÉMENT DE CONTACT
=========================================================== */

function ContactItem({
  href,
  icon,
  title,
  value,
  green = false,
}) {
  const externe = href.startsWith("https://");

  return (
    <a
      href={href}
      target={externe ? "_blank" : undefined}
      rel={externe ? "noopener noreferrer" : undefined}
      className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3 transition hover:bg-white/[0.1] sm:gap-4 sm:p-4"
    >

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl text-white sm:h-12 sm:w-12 ${
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

        <p className="mt-1 break-all text-sm font-bold text-white sm:text-base">
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
   LIGNE AVEC COCHE
=========================================================== */

function CheckLine({ children }) {
  return (
    <div className="mt-3 flex items-center gap-3">

      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-400/10 text-green-400">
        ✓
      </span>

      <p className="text-sm font-medium text-blue-100">
        {children}
      </p>

    </div>
  );
}

/* ===========================================================
   LIEN DU FOOTER
=========================================================== */

function FooterLink({
  href,
  children,
}) {
  return (
    <a
      href={href}
      className="block py-0.5 text-sm text-slate-400 transition hover:text-orange-400"
    >
      {children}
    </a>
  );
}

/* ===========================================================
   MODALE DÉTAILS DU PRODUIT
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
  const caracteristiques = getCaracteristiques(produit);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center overflow-hidden bg-slate-950/70 p-0 backdrop-blur-md sm:items-center sm:p-4 md:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >

      <div className="relative flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-2xl sm:max-h-[94vh] sm:rounded-[2rem]">

        {/* EN-TÊTE DE LA MODALE */}

        <div className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-xl sm:px-7 sm:py-4">

          <div className="min-w-0">

            <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-orange-500">
              Détails du produit
            </p>

            <h3 className="mt-1 truncate text-base font-black text-blue-950 sm:text-xl">
              {nom}
            </h3>

          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600 transition hover:bg-slate-200"
          >
            ×
          </button>

        </div>

        {/* CONTENU DE LA MODALE */}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">

          <div className="grid lg:grid-cols-2">

            {/* IMAGE DU PRODUIT */}

            <div className="bg-slate-50 p-4 sm:p-8">

              <div className="relative flex min-h-[250px] items-center justify-center overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white sm:min-h-[400px] lg:min-h-[440px]">

                {image ? (
                  <img
                    src={image}
                    alt={nom}
                    className="absolute inset-0 h-full w-full object-contain p-5 sm:p-8"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">

                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl sm:h-24 sm:w-24 sm:text-5xl">
                      ☀️
                    </div>

                    <p className="mt-5 text-sm font-semibold text-slate-400">
                      Solution solaire
                    </p>

                  </div>
                )}

                <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
                  <span className="inline-block max-w-full truncate rounded-full bg-blue-950 px-3 py-2 text-[10px] font-bold text-white shadow-lg sm:px-4">
                    {categorie}
                  </span>
                </div>

              </div>
            </div>

            {/* INFORMATIONS DU PRODUIT */}

            <div className="p-5 sm:p-8 lg:p-10">

              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-500">
                {categorie}
              </p>

              <h2 className="mt-2 break-words text-2xl font-black tracking-tight text-blue-950 sm:text-4xl">
                {nom}
              </h2>

              {prix && (
                <p className="mt-4 text-xl font-black text-orange-500 sm:text-2xl">
                  {prix}
                </p>
              )}

              <div className="mt-6 rounded-2xl bg-slate-50 p-4 sm:p-5">

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

                    {caracteristiques.map((item, index) => (
                      <div
                        key={`${item.label}-${index}`}
                        className="rounded-xl border border-slate-200 bg-white p-4"
                      >

                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          {item.label}
                        </p>

                        <p className="mt-1 break-words text-sm font-bold text-blue-950">
                          {item.value}
                        </p>

                      </div>
                    ))}

                  </div>
                </div>
              )}

              {/* COMPOSANTS DU KIT */}

              <div className="mt-8">

                <div className="flex items-center justify-between gap-3">

                  <h4 className="text-lg font-black text-blue-950">
                    Contenu du kit
                  </h4>

                  <span className="shrink-0 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
                    {composants.length}{" "}
                    {composants.length > 1 ? "éléments" : "élément"}
                  </span>

                </div>

                {composants.length > 0 ? (
                  <div className="mt-4 space-y-3">

                    {composants.map((composant, index) => (
                      <div
                        key={`${composant}-${index}`}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >

                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-black text-green-600">
                          ✓
                        </span>

                        <p className="break-words text-sm font-semibold leading-6 text-slate-700">
                          {composant}
                        </p>

                      </div>
                    ))}

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

              <div className="mt-8 flex flex-col gap-3 pb-2 sm:flex-row">

                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                    `Bonjour Solar Smart, je souhaite avoir plus d'informations sur le produit "${nom}".`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="solart-button flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-4 text-sm font-extrabold text-white shadow-lg"
                >
                  WhatsApp
                  <span>→</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[52px] rounded-full border-2 border-slate-200 px-6 py-4 text-sm font-bold text-slate-700 transition hover:border-blue-800 hover:text-blue-800"
                >
                  Fermer
                </button>

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
