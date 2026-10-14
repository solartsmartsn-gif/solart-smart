"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";

const WHATSAPP = "221787110707";

export default function EstimationPage() {
  const [compteur, setCompteur] = useState("");
  const [facture, setFacture] = useState(null);
  const [releves, setReleves] = useState({
    "813": "",
    "814": "",
    "820": "",
  });
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ville, setVille] = useState("");
  const [messageComplementaire, setMessageComplementaire] = useState("");
  const [erreur, setErreur] = useState("");

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/#services", label: "Services" },
    { href: "/#produits", label: "Produits" },
    { href: "/estimation", label: "Estimation" },
    { href: "/#contact", label: "Contact" },
  ];

  function envoyerDemande(e) {
    e.preventDefault();
    setErreur("");

    if (!compteur) {
      setErreur("Choisissez d’abord votre type de compteur.");
      return;
    }

    if (!nom.trim() || !telephone.trim()) {
      setErreur(
        "Veuillez renseigner votre nom et votre numéro de téléphone."
      );
      return;
    }

    if (compteur === "Senelec" && !facture) {
      setErreur(
        "Veuillez sélectionner une photo ou un fichier de votre facture Senelec."
      );
      return;
    }

    if (
      compteur === "Woyofal" &&
      !Object.values(releves).some((value) => value.trim())
    ) {
      setErreur(
        "Renseignez au moins un résultat obtenu avec les codes Woyofal."
      );
      return;
    }

    const detailsCompteur =
      compteur === "Senelec"
        ? `Facture Senelec sélectionnée sur l'appareil : ${facture.name}

IMPORTANT : la facture ne sera pas jointe automatiquement. Merci de la joindre manuellement dans WhatsApp.`
        : `Résultats saisis après utilisation des codes du compteur Woyofal :
- Code 813 : ${releves["813"] || "Non renseigné"}
- Code 814 : ${releves["814"] || "Non renseigné"}
- Code 820 : ${releves["820"] || "Non renseigné"}`;

    const texte = `Bonjour Solar Smart, je souhaite demander une étude et un devis pour une installation solaire.

Nom : ${nom.trim()}
Téléphone / WhatsApp : ${telephone.trim()}
Ville / quartier : ${ville.trim() || "Non renseigné"}
Type de compteur : ${compteur}

${detailsCompteur}

Informations complémentaires :
${messageComplementaire.trim() || "Aucune"}

Merci de me contacter pour étudier mon besoin et me proposer une solution adaptée.`;

    window.location.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
      texte
    )}`;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER PARTAGÉ (fixe, 72px) */}
      <Header />
      <div className="h-[72px]" aria-hidden="true" />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-100 sm:text-sm">
            Solar Smart · Sénégal
          </span>

          <h1 className="mt-5 text-3xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Parlons de votre projet
            <span className="mt-1 block text-orange-400">
              solaire.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-blue-100 sm:text-lg">
            Indiquez votre type de compteur et vos coordonnées. Notre équipe
            pourra étudier votre demande et vous orienter vers une solution
            adaptée à vos besoins.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="#formulaire"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-orange-500 px-7 py-4 text-sm font-black text-white shadow-lg transition hover:bg-orange-600"
            >
              Faire ma demande <span className="ml-2">↓</span>
            </a>

            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/20"
            >
              Poser une question
            </a>
          </div>
        </div>
      </section>

      {/* FORMULAIRE */}
      <section
        id="formulaire"
        className="scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
      >
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
          {/* EXPLICATION */}
          <aside className="h-fit rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
              Comment ça marche ?
            </p>

            <h2 className="mt-3 text-2xl font-black text-blue-950 sm:text-3xl">
              Une demande simple, en 3 étapes.
            </h2>

            <div className="mt-7 space-y-6">
              {[
                [
                  "01",
                  "Choisissez votre compteur",
                  "Sélectionnez Senelec ou Woyofal.",
                ],
                [
                  "02",
                  "Ajoutez vos informations",
                  "Joignez votre facture Senelec ou renseignez les résultats des codes Woyofal.",
                ],
                [
                  "03",
                  "Envoyez sur WhatsApp",
                  "Votre message de demande sera préparé pour notre équipe.",
                ],
              ].map(([n, titre, description]) => (
                <div key={n} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-sm font-black text-orange-600">
                    {n}
                  </span>

                  <div>
                    <h3 className="font-extrabold text-blue-950">
                      {titre}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-extrabold text-blue-950">
                À savoir
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Cette page envoie une demande de devis. Elle ne calcule pas
                automatiquement la puissance de votre installation et ne
                garantit pas un prix avant étude technique.
              </p>
            </div>
          </aside>

          {/* FORMULAIRE PRINCIPAL */}
          <form
            onSubmit={envoyerDemande}
            className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8"
          >
            <div className="border-b border-slate-100 pb-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
                Formulaire de demande
              </p>

              <h2 className="mt-2 text-2xl font-black text-blue-950 sm:text-3xl">
                Votre estimation solaire
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Les champs marqués d’un astérisque sont obligatoires.
              </p>
            </div>

            {/* TYPE DE COMPTEUR */}
            <fieldset className="mt-7">
              <legend className="text-base font-extrabold text-blue-950">
                1. Quel est votre type de compteur ? *
              </legend>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    value: "Senelec",
                    titre: "Senelec",
                    desc: "J’ai une facture d’électricité.",
                  },
                  {
                    value: "Woyofal",
                    titre: "Woyofal",
                    desc: "J’utilise un compteur prépayé.",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setCompteur(option.value);
                      setErreur("");
                    }}
                    className={`rounded-2xl border p-5 text-left transition ${
                      compteur === option.value
                        ? "border-orange-400 bg-orange-50 ring-2 ring-orange-200"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                    aria-pressed={compteur === option.value}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-lg font-black text-blue-950">
                        {option.titre}
                      </span>

                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                          compteur === option.value
                            ? "border-orange-500 bg-orange-500 text-white"
                            : "border-slate-300 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                    </span>

                    <span className="mt-2 block text-sm leading-6 text-slate-600">
                      {option.desc}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* FACTURE SENELEC */}
            {compteur === "Senelec" && (
              <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                <label
                  htmlFor="facture"
                  className="block text-sm font-extrabold text-blue-950"
                >
                  2. Ajouter votre facture Senelec *
                </label>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Choisissez une photo ou un fichier de votre facture depuis
                  votre appareil.
                </p>

                <input
                  id="facture"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    setFacture(e.target.files?.[0] || null);
                    setErreur("");
                  }}
                  className="mt-4 block w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm text-slate-700 file:mr-4 file:border-0 file:bg-blue-950 file:px-4 file:py-3 file:font-bold file:text-white hover:file:bg-blue-900"
                />

                {facture && (
                  <p className="mt-3 break-all text-sm font-semibold text-green-700">
                    Fichier sélectionné : {facture.name}
                  </p>
                )}

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Pour protéger votre document, le fichier n’est pas téléversé
                  sur ce site. Après ouverture de WhatsApp, joignez-y
                  manuellement la photo ou le PDF.
                </p>
              </div>
            )}

            {/* WOYOFAL */}
            {compteur === "Woyofal" && (
              <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                <h3 className="text-sm font-extrabold text-blue-950">
                  2. Saisir les résultats Woyofal
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Sur votre compteur, tapez chacun des codes ci-dessous, puis
                  saisissez le résultat affiché. Si vous ne disposez pas d’un
                  résultat, laissez le champ vide.
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {["813", "814", "820"].map((code) => (
                    <div key={code}>
                      <label
                        htmlFor={`code-${code}`}
                        className="block text-sm font-extrabold text-blue-950"
                      >
                        Code {code}
                      </label>

                      <input
                        id={`code-${code}`}
                        type="text"
                        inputMode="text"
                        value={releves[code]}
                        onChange={(e) =>
                          setReleves((prev) => ({
                            ...prev,
                            [code]: e.target.value,
                          }))
                        }
                        placeholder="Résultat affiché"
                        className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Les codes sont affichés tels quels ; leur signification n’est
                  pas interprétée automatiquement sur cette page.
                </p>
              </div>
            )}

            {/* COORDONNÉES */}
            <div className="mt-8 border-t border-slate-100 pt-7">
              <h3 className="text-base font-extrabold text-blue-950">
                3. Vos coordonnées
              </h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="nom"
                    className="block text-sm font-bold text-slate-700"
                  >
                    Nom complet *
                  </label>

                  <input
                    id="nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Votre nom"
                    className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="telephone"
                    className="block text-sm font-bold text-slate-700"
                  >
                    Téléphone / WhatsApp *
                  </label>

                  <input
                    id="telephone"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    required
                    type="tel"
                    autoComplete="tel"
                    placeholder="+221 7X XXX XX XX"
                    className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="ville"
                    className="block text-sm font-bold text-slate-700"
                  >
                    Ville / quartier{" "}
                    <span className="font-normal text-slate-400">
                      (facultatif)
                    </span>
                  </label>

                  <input
                    id="ville"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    autoComplete="address-level2"
                    placeholder="Ex. : Pikine, Dakar"
                    className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="message"
                    className="block text-sm font-bold text-slate-700"
                  >
                    Décrivez votre besoin{" "}
                    <span className="font-normal text-slate-400">
                      (facultatif)
                    </span>
                  </label>

                  <textarea
                    id="message"
                    rows={4}
                    value={messageComplementaire}
                    onChange={(e) =>
                      setMessageComplementaire(e.target.value)
                    }
                    placeholder="Maison, entreprise, pompage solaire, appareils à alimenter, projet neuf ou remplacement…"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
            </div>

            {/* ERREURS */}
            {erreur && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                {erreur}
              </p>
            )}

            {/* ENVOI WHATSAPP */}
            <button
              type="submit"
              className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-4 text-base font-black text-white shadow-lg shadow-green-100 transition hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              Envoyer ma demande sur WhatsApp{" "}
              <span aria-hidden="true">→</span>
            </button>

            <p className="mt-3 text-center text-xs leading-5 text-slate-500">
              WhatsApp s’ouvrira avec votre message prérempli. Vérifiez-le puis
              appuyez sur Envoyer dans WhatsApp.
            </p>
          </form>
        </div>
      </section>

      {/* BANDEAU DE CONTACT */}
      <section className="px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 p-6 sm:p-9 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-400">
              Solar Smart · Sénégal
            </p>

            <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
              Un projet solaire ? Parlons-en.
            </h2>

            <p className="mt-3 text-sm leading-6 text-blue-100/80">
              Notre équipe est disponible pour recevoir votre demande et
              échanger avec vous sur votre projet.
            </p>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-full bg-green-500 px-6 py-4 text-sm font-black text-white transition hover:bg-green-600 sm:w-auto"
          >
            Contacter Solar Smart
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
          <div>
            <Link
              href="/"
              className="flex items-center gap-3 text-2xl font-black tracking-tight"
            >
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white">
                <Image
                  src="/logo.png"
                  alt="Solar Smart"
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                />
              </span>

              <span>
                <span className="text-blue-400">Solar</span>{" "}
                <span className="text-orange-500">Smart</span>
              </span>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
              Des solutions solaires adaptées à vos besoins au Sénégal : kits
              solaires pour maison, entreprise et pompage solaire.
            </p>

            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-green-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-600"
            >
              WhatsApp
            </a>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Navigation
            </h3>

            <div className="mt-5 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-slate-400 transition hover:text-orange-400"
                >
                  {link.label}
                </Link>
              ))}
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
                href="mailto:solarsmart.sn@gmail.com"
                className="block break-all transition hover:text-orange-400"
              >
                solarsmart.sn@gmail.com
              </a>

              <p className="leading-6">
                Pikine Icotaf 3,
                <br />
                Tally Mbaye Gakou,
                <br />
                en face du marché Sandika — Sénégal
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 text-sm text-slate-500 md:col-span-2 lg:col-span-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
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
        </div>
      </footer>
    </main>
  );
}