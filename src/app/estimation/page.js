
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import CartIcon from "@/components/CartIcon";

const WHATSAPP = "221787110707";
const EMAIL = "solartsmart.sn@gmail.com";

const HEURES_SOLAIRES = 5;
const MARGE_PERTES = 1.3;
const PUISSANCE_PANNEAU = 550;
const RENDEMENT_BATTERIE = 0.8;

const APPAREILS_INITIAUX = [
  { id: "lampe", nom: "Lampe LED", puissance: 10, quantite: 0, jour: 5, nuit: 3, categorie: "Éclairage" },
  { id: "television", nom: "Télévision LED", puissance: 100, quantite: 0, jour: 5, nuit: 2, categorie: "Multimédia" },
  { id: "refrigerateur", nom: "Réfrigérateur", puissance: 180, quantite: 0, jour: 8, nuit: 8, categorie: "Électroménager" },
  { id: "ventilateur", nom: "Ventilateur", puissance: 60, quantite: 0, jour: 6, nuit: 4, categorie: "Confort" },
  { id: "wifi", nom: "Box Internet / Wi-Fi", puissance: 12, quantite: 0, jour: 10, nuit: 14, categorie: "Multimédia" },
  { id: "ordinateur", nom: "Ordinateur portable", puissance: 100, quantite: 0, jour: 6, nuit: 1, categorie: "Multimédia" },
  { id: "clim1", nom: "Climatiseur 1 CV", puissance: 850, quantite: 0, jour: 3, nuit: 4, categorie: "Climatisation" },
  { id: "clim15", nom: "Climatiseur 1,5 CV", puissance: 1250, quantite: 0, jour: 3, nuit: 4, categorie: "Climatisation" },
  { id: "clim2", nom: "Climatiseur 2 CV", puissance: 1600, quantite: 0, jour: 3, nuit: 4, categorie: "Climatisation" },
  { id: "lave-linge", nom: "Lave-linge", puissance: 2000, quantite: 0, jour: 1, nuit: 0, categorie: "Électroménager" },
  { id: "fer", nom: "Fer à repasser", puissance: 1200, quantite: 0, jour: 0.5, nuit: 0, categorie: "Électroménager" },
  { id: "microondes", nom: "Four micro-ondes", puissance: 1400, quantite: 0, jour: 0.25, nuit: 0.05, categorie: "Cuisine" },
  { id: "pompe", nom: "Petite pompe à eau", puissance: 750, quantite: 0, jour: 2, nuit: 0, categorie: "Pompage" },
  { id: "ordinateur-bureau", nom: "Ordinateur de bureau", puissance: 250, quantite: 0, jour: 7, nuit: 0, categorie: "Multimédia" },
];

const fmt = (nombre) =>
  Number(nombre || 0).toLocaleString("fr-FR", {
    maximumFractionDigits: 2,
  });

const FCFA = (nombre) => `${fmt(nombre)} FCFA`;

function nombreValide(valeur) {
  const n = Number(valeur);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function nomProduit(produit) {
  return (
    produit?.nom ||
    produit?.name ||
    produit?.titre ||
    produit?.title ||
    "Solution solaire"
  );
}

function categorieProduit(produit) {
  return String(
    produit?.categorie ||
      produit?.category ||
      produit?.type ||
      ""
  ).toLowerCase();
}

function estPompage(produit) {
  const categorie = categorieProduit(produit);
  return categorie.includes("pompage") || categorie.includes("pompe");
}

function estKit(produit) {
  const categorie = categorieProduit(produit);
  return (
    categorie.includes("kit") ||
    categorie.includes("maison") ||
    categorie.includes("entreprise") ||
    categorie.includes("pompage")
  );
}

function prixProduit(produit) {
  const valeur = produit?.prix ?? produit?.price ?? produit?.montant;
  if (valeur === null || valeur === undefined || valeur === "") return null;

  const n = Number(valeur);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function energieProduit(produit) {
  const valeur =
    produit?.kwh_jour ??
    produit?.consommation_kwh_jour ??
    produit?.consommation_journaliere ??
    produit?.capacite_kwh_jour;

  const n = Number(valeur);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function puissancePanneauxProduit(produit) {
  const valeur =
    produit?.puissance_panneaux_wc ??
    produit?.puissance_pv_wc ??
    produit?.puissance_panneaux ??
    produit?.puissance_solaire_wc;

  const n = Number(valeur);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function batterieProduit(produit) {
  const valeur =
    produit?.batterie_kwh ??
    produit?.capacite_batterie_kwh ??
    produit?.stockage_kwh;

  const n = Number(valeur);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function onduleurProduit(produit) {
  const valeur =
    produit?.onduleur_kw ??
    produit?.puissance_onduleur_kw ??
    produit?.puissance_onduleur;

  const n = Number(valeur);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function SectionTitre({ numero, titre, description }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-800 text-lg font-black text-white">
        {numero}
      </div>
      <div className="min-w-0">
        <h2 className="text-xl font-black text-blue-950 sm:text-2xl">
          {titre}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function Champ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  min,
  max,
  step,
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label} {required && <span className="text-orange-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        className="min-h-[48px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function ChoixCarte({ actif, onClick, icone, titre, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={`min-w-0 rounded-2xl border p-4 text-left transition sm:p-5 ${
        actif
          ? "border-blue-700 bg-blue-50 ring-2 ring-blue-100"
          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
      }`}
    >
      <span className="text-2xl">{icone}</span>
      <span className="mt-3 block font-black text-blue-950">{titre}</span>
      <span className="mt-1 block text-sm leading-5 text-slate-500">
        {description}
      </span>
      <span
        className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
          actif ? "bg-blue-800 text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        {actif ? "Sélectionné" : "Choisir"}
      </span>
    </button>
  );
}

function BarreProgression({ etape }) {
  const etapes = ["Votre profil", "Votre compteur", "Vos appareils", "Vos coordonnées"];

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-black text-blue-950">
          Étape {etape} sur 4
        </span>
        <span className="text-xs font-bold text-slate-400">
          {Math.round((etape / 4) * 100)} % complété
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-800 to-orange-500 transition-all duration-300"
          style={{ width: `${(etape / 4) * 100}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {etapes.map((nom, index) => (
          <div key={nom} className="min-w-0">
            <div
              className={`mb-2 h-1 rounded-full ${
                etape >= index + 1 ? "bg-orange-500" : "bg-slate-200"
              }`}
            />
            <p
              className={`break-words text-[10px] font-bold sm:text-xs ${
                etape === index + 1 ? "text-blue-900" : "text-slate-400"
              }`}
            >
              {nom}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EstimationPage() {
  const [etape, setEtape] = useState(1);
  const [profil, setProfil] = useState("residentiel");
  const [compteur, setCompteur] = useState("woyofal");
  const [typeAbonnement, setTypeAbonnement] = useState("inconnu");

  const [montantWoyofal, setMontantWoyofal] = useState("");
  const [kwhWoyofal, setKwhWoyofal] = useState("");

  const [tranches, setTranches] = useState([
    { montant: "", kwh: "" },
    { montant: "", kwh: "" },
    { montant: "", kwh: "" },
  ]);

  const [appareils, setAppareils] = useState(APPAREILS_INITIAUX);

  const [appareilPersonnalise, setAppareilPersonnalise] = useState({
    nom: "",
    puissance: "500",
    quantite: "1",
    jour: "4",
    nuit: "0",
  });

  const [appareilsPerso, setAppareilsPerso] = useState([]);

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ville, setVille] = useState("");
  const [email, setEmail] = useState("");
  const [precision, setPrecision] = useState("");

  const [produits, setProduits] = useState([]);
  const [loadingProduits, setLoadingProduits] = useState(true);
  const [erreurProduits, setErreurProduits] = useState("");

  const [resultatVisible, setResultatVisible] = useState(false);
  const [erreurFormulaire, setErreurFormulaire] = useState("");

  useEffect(() => {
    let actif = true;

    async function chargerProduits() {
      setLoadingProduits(true);
      setErreurProduits("");

      try {
        const { data, error } = await supabase.from("produits").select("*");

        if (error) throw error;

        if (actif) {
          setProduits(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Chargement du catalogue :", error);

        if (actif) {
          setErreurProduits(
            "Le catalogue n'est pas accessible pour le moment. Vous pouvez tout de même calculer vos besoins."
          );
        }
      } finally {
        if (actif) setLoadingProduits(false);
      }
    }

    chargerProduits();

    return () => {
      actif = false;
    };
  }, []);

  const appareilsTous = useMemo(
    () => [...appareils, ...appareilsPerso],
    [appareils, appareilsPerso]
  );

  // Calcul énergétique à partir des appareils.
  const calcul = useMemo(() => {
    let jourWh = 0;
    let nuitWh = 0;
    let puissanceTotale = 0;
    let nombreAppareils = 0;

    appareilsTous.forEach((appareil) => {
      const q = nombreValide(appareil.quantite);
      const w = nombreValide(appareil.puissance);
      const hJour = Math.min(24, nombreValide(appareil.jour));
      const hNuit = Math.min(24, nombreValide(appareil.nuit));

      if (q > 0 && w > 0) {
        nombreAppareils += q;
        jourWh += q * w * hJour;
        nuitWh += q * w * hNuit;
        puissanceTotale += q * w;
      }
    });

    const kwhJour = (jourWh + nuitWh) / 1000;

    return {
      jourWh,
      nuitWh,
      kwhJour,
      kwhMois: kwhJour * 30,
      nombreAppareils,
      puissanceTotale,
      energieNuitKwh: nuitWh / 1000,
    };
  }, [appareilsTous]);

  // Consommation de référence issue du compteur.
  // Le montant en FCFA seul ne permet pas de calculer précisément les kWh.
  const consommationDeclaree = useMemo(() => {
    if (compteur === "woyofal") {
      return nombreValide(kwhWoyofal);
    }

    if (compteur === "senelec") {
      return tranches.reduce(
        (total, tranche) => total + nombreValide(tranche.kwh),
        0
      );
    }

    return 0;
  }, [compteur, kwhWoyofal, tranches]);

  const montantDeclare = useMemo(() => {
    if (compteur === "woyofal") {
      return nombreValide(montantWoyofal);
    }

    if (compteur === "senelec") {
      return tranches.reduce(
        (total, tranche) => total + nombreValide(tranche.montant),
        0
      );
    }

    return 0;
  }, [compteur, montantWoyofal, tranches]);

  // Si la consommation du compteur est connue, on l'utilise comme référence.
  // On ne l'ajoute jamais une deuxième fois à la consommation des appareils.
  const kwhJourFinal =
    consommationDeclaree > 0
      ? consommationDeclaree / 30
      : calcul.kwhJour;

  const kwhMoisFinal = kwhJourFinal * 30;

  const kwcFinal =
    kwhJourFinal > 0
      ? (kwhJourFinal * MARGE_PERTES) / HEURES_SOLAIRES
      : 0;

  const panneauxFinal =
    kwcFinal > 0
      ? Math.ceil((kwcFinal * 1000) / PUISSANCE_PANNEAU)
      : 0;

  // Le besoin de nuit est estimé à partir des appareils renseignés.
  // Si aucun horaire nocturne n'est indiqué, on utilise une hypothèse
  // de 50 % de la consommation quotidienne pour un premier calcul.
  const energieNuitEstimee =
    calcul.energieNuitKwh > 0
      ? calcul.energieNuitKwh
      : kwhJourFinal * 0.5;

  const batterieFinale =
    energieNuitEstimee > 0
      ? energieNuitEstimee / RENDEMENT_BATTERIE
      : 0;

  const puissanceOnduleurFinale =
    calcul.puissanceTotale > 0
      ? (calcul.puissanceTotale * 1.25) / 1000
      : 0;

  // Recommandation des produits : profil compatible, capacité journalière
  // renseignée et suffisante, et vérification des caractéristiques techniques
  // lorsque ces informations existent dans la base.
  const evaluationProduits = useMemo(() => {
    if (kwhJourFinal <= 0) {
      return { recommandes: [], insuffisants: [], nonVerifiables: [] };
    }

    const kits = produits.filter(estKit);

    const profilCompatible = kits.filter((produit) => {
      const categorie = categorieProduit(produit);

      if (profil === "pompage") {
        return estPompage(produit);
      }

      if (profil === "entreprise") {
        return (
          !estPompage(produit) &&
          (categorie.includes("entreprise") || categorie.includes("maison"))
        );
      }

      return categorie.includes("maison") && !estPompage(produit);
    });

    const avecEnergie = profilCompatible
      .map((produit) => ({
        produit,
        energie: energieProduit(produit),
      }))
      .filter((item) => item.energie !== null);

    const nonVerifiables = profilCompatible.filter(
      (produit) => energieProduit(produit) === null
    );

    const suffisants = avecEnergie
      .filter(({ energie }) => energie >= kwhJourFinal * 1.1)
      .filter(({ produit }) => {
        const pv = puissancePanneauxProduit(produit);
        const batterie = batterieProduit(produit);
        const onduleur = onduleurProduit(produit);

        // Si la donnée technique est disponible, elle doit satisfaire
        // le besoin calculé. Si elle est absente, on ne la devine pas.
        if (pv !== null && pv < kwcFinal * 1000) return false;
        if (batterie !== null && batterie < batterieFinale) return false;
        if (
          onduleur !== null &&
          puissanceOnduleurFinale > 0 &&
          onduleur < puissanceOnduleurFinale
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => a.energie - b.energie);

    const insuffisants = avecEnergie
      .filter(({ energie }) => energie < kwhJourFinal * 1.1)
      .sort((a, b) => b.energie - a.energie)
      .map(({ produit }) => produit);

    return {
      recommandes: suffisants.slice(0, 3).map(({ produit }) => produit),
      insuffisants,
      nonVerifiables,
    };
  }, [
    produits,
    profil,
    kwhJourFinal,
    kwcFinal,
    batterieFinale,
    puissanceOnduleurFinale,
  ]);

  const produitsRecommandes = evaluationProduits.recommandes;

  function modifierAppareil(id, champ, valeur) {
    setAppareils((precedents) =>
      precedents.map((appareil) =>
        appareil.id === id ? { ...appareil, [champ]: valeur } : appareil
      )
    );

    setResultatVisible(false);
  }

  function modifierTranche(index, champ, valeur) {
    setTranches((precedentes) =>
      precedentes.map((tranche, i) =>
        i === index ? { ...tranche, [champ]: valeur } : tranche
      )
    );

    setResultatVisible(false);
  }

  function ajouterAppareil() {
    const puissance = nombreValide(appareilPersonnalise.puissance);
    const quantite = nombreValide(appareilPersonnalise.quantite);
    const jour = nombreValide(appareilPersonnalise.jour);
    const nuit = nombreValide(appareilPersonnalise.nuit);

    if (
      !appareilPersonnalise.nom.trim() ||
      puissance <= 0 ||
      quantite <= 0 ||
      jour > 24 ||
      nuit > 24
    ) {
      setErreurFormulaire(
        "Indique le nom, une puissance et une quantité valides. Les heures doivent être comprises entre 0 et 24."
      );
      return;
    }

    setAppareilsPerso((precedents) => [
      ...precedents,
      {
        id: `personnalise-${Date.now()}-${precedents.length}`,
        nom: appareilPersonnalise.nom.trim(),
        puissance,
        quantite,
        jour,
        nuit,
        categorie: "Personnalisé",
        personnalise: true,
      },
    ]);

    setAppareilPersonnalise({
      nom: "",
      puissance: "500",
      quantite: "1",
      jour: "4",
      nuit: "0",
    });

    setErreurFormulaire("");
    setResultatVisible(false);
  }

  function supprimerAppareil(id) {
    setAppareilsPerso((precedents) =>
      precedents.filter((appareil) => appareil.id !== id)
    );

    setResultatVisible(false);
  }

  // Important : aucun scroll vers le haut lors d'un changement d'étape.
  function allerEtapeSuivante() {
    setErreurFormulaire("");

    if (
      etape === 3 &&
      calcul.nombreAppareils === 0 &&
      consommationDeclaree === 0
    ) {
      setErreurFormulaire(
        "Ajoute au moins un appareil ou indique une consommation connue au compteur."
      );
      return;
    }

    setEtape((precedente) => Math.min(4, precedente + 1));
  }

  function allerEtapePrecedente() {
    setErreurFormulaire("");
    setEtape((precedente) => Math.max(1, precedente - 1));
  }

  function calculerDimensionnement(event) {
    event.preventDefault();
    setErreurFormulaire("");

    if (!nom.trim() || !telephone.trim()) {
      setErreurFormulaire("Le nom et le téléphone/WhatsApp sont obligatoires.");
      return;
    }

    if (calcul.nombreAppareils === 0 && consommationDeclaree === 0) {
      setErreurFormulaire(
        "Renseigne tes appareils ou la consommation électrique de ton compteur."
      );
      setEtape(3);
      return;
    }

    if (kwhJourFinal <= 0) {
      setErreurFormulaire(
        "La consommation calculée est nulle. Vérifie les quantités, les puissances et les consommations renseignées."
      );
      return;
    }

    setResultatVisible(true);

    // Le défilement se fait uniquement vers les résultats après le calcul.
    window.setTimeout(() => {
      document.getElementById("resultat-dimensionnement")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  }

  function messageDevis() {
    const listeAppareils = appareilsTous
      .filter((appareil) => nombreValide(appareil.quantite) > 0)
      .map(
        (appareil) =>
          `- ${appareil.nom} : ${appareil.quantite} x ${appareil.puissance} W, ${appareil.jour} h/jour et ${appareil.nuit} h/nuit`
      )
      .join("\n");

    const listeProduits = produitsRecommandes.length
      ? produitsRecommandes
          .map((produit) => `- ${nomProduit(produit)}`)
          .join("\n")
      : "Aucun kit n'a pu être confirmé automatiquement.";

    return [
      "Bonjour Solar Smart, je souhaite recevoir un devis pour mon installation solaire.",
      "",
      `Nom : ${nom}`,
      `Téléphone : ${telephone}`,
      `Ville/quartier : ${ville || "Non renseigné"}`,
      `E-mail : ${email || "Non renseigné"}`,
      `Profil : ${profil === "residentiel" ? "Résidentiel" : profil === "entreprise" ? "Entreprise" : "Pompage solaire"}`,
      `Compteur : ${compteur === "woyofal" ? "Woyofal" : compteur === "senelec" ? "Senelec" : "Aucun compteur"}`,
      `Abonnement : ${typeAbonnement}`,
      `Montant déclaré : ${FCFA(montantDeclare)}`,
      `Consommation déclarée au compteur : ${fmt(consommationDeclaree)} kWh/mois`,
      `Consommation calculée par les appareils : ${fmt(calcul.kwhMois)} kWh/mois`,
      `Consommation de référence retenue : ${fmt(kwhMoisFinal)} kWh/mois`,
      `Puissance photovoltaïque indicative : ${fmt(kwcFinal)} kWc`,
      `Panneaux de 550 W indicatifs : ${panneauxFinal}`,
      `Stockage indicatif : ${fmt(batterieFinale)} kWh`,
      `Onduleur indicatif : ${fmt(puissanceOnduleurFinale)} kW`,
      "",
      "Appareils renseignés :",
      listeAppareils || "Aucun appareil détaillé",
      "",
      "Kits répondant aux critères renseignés :",
      listeProduits,
      "",
      `Précisions : ${precision || "Aucune"}`,
      "",
      "Merci de vérifier les caractéristiques techniques et de me proposer un devis adapté.",
    ].join("\n");
  }

  const urlWhatsAppDevis =
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(messageDevis())}`;

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      {/* NAVIGATION */}
      <header className="fixed inset-x-0 top-0 z-[100] border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-2xl">
        <div className="mx-auto flex h-[70px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
              <Image
                src="/logo.png"
                alt="Solar Smart"
                fill
                sizes="40px"
                className="object-contain p-1"
              />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-black tracking-tight">
                <span className="text-blue-800">Solar</span>{" "}
                <span className="text-orange-500">Smart</span>
              </span>
              <span className="block text-[8px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Énergie solaire
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-800">
              Accueil
            </Link>
            <Link href="/#services" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-800">
              Services
            </Link>
            <Link href="/#produits" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-800">
              Produits
            </Link>
            <Link href="/estimation" className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-800">
              Estimation
            </Link>
            <span className="mx-2 h-7 w-px bg-slate-200" />
            <CartIcon />
            <Link href="/#contact" className="ml-2 rounded-full bg-blue-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-900">
              Contact <span className="ml-1 text-orange-400">→</span>
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <CartIcon />
            <Link href="/" className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-blue-900">
              Accueil
            </Link>
          </div>
        </div>
      </header>

      <div className="h-[70px]" />

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="absolute -right-36 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-100 sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              Simulateur solaire Solar Smart
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Trouvez une solution solaire
              <span className="mt-2 block text-orange-400">
                adaptée à vos besoins.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Renseignez vos appareils et votre consommation. Le simulateur
              calcule vos besoins et recherche les kits du catalogue qui
              répondent aux critères techniques disponibles.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-blue-100">
                Maison et entreprise
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-blue-100">
                Pompage solaire
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-blue-100">
                Devis WhatsApp
              </span>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 p-8">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-3xl">
                    ☀️
                  </span>
                  <span className="rounded-full bg-green-400/10 px-3 py-2 text-xs font-bold text-green-300">
                    ÉNERGIE PROPRE
                  </span>
                </div>
                <p className="mt-9 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                  Votre projet
                </p>
                <p className="mt-2 text-3xl font-black text-white">
                  Du soleil à l'électricité.
                </p>
                <p className="mt-4 text-sm leading-7 text-blue-100/70">
                  Une étude structurée de vos besoins avant validation du
                  matériel par notre équipe.
                </p>
                <div className="mt-7 grid grid-cols-3 gap-3">
                  {[
                    ["01", "Profil"],
                    ["02", "Énergie"],
                    ["03", "Solution"],
                  ].map(([n, label]) => (
                    <div key={n} className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
                      <p className="text-xs font-black text-orange-400">{n}</p>
                      <p className="mt-1 text-xs font-bold text-white">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SIMULATEUR */}
      <section className="bg-slate-50 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl items-start gap-7 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-7 lg:p-9">
            <BarreProgression etape={etape} />

            {/* ÉTAPE 1 */}
            {etape === 1 && (
              <div>
                <SectionTitre
                  numero="01"
                  titre="Votre profil"
                  description="Choisissez l'usage principal de votre future installation."
                />

                <div className="grid gap-3 sm:grid-cols-3">
                  <ChoixCarte
                    actif={profil === "residentiel"}
                    onClick={() => setProfil("residentiel")}
                    icone="🏠"
                    titre="Résidentiel"
                    description="Maison, appartement ou villa."
                  />
                  <ChoixCarte
                    actif={profil === "entreprise"}
                    onClick={() => setProfil("entreprise")}
                    icone="🏢"
                    titre="Entreprise"
                    description="Bureau, commerce ou atelier."
                  />
                  <ChoixCarte
                    actif={profil === "pompage"}
                    onClick={() => setProfil("pompage")}
                    icone="💧"
                    titre="Pompage"
                    description="Forage, irrigation et eau."
                  />
                </div>

                {profil === "pompage" && (
                  <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                    <p className="font-bold text-cyan-950">
                      Informations nécessaires au pompage
                    </p>
                    <p className="mt-2 text-sm leading-6 text-cyan-900/80">
                      Le dimensionnement d'une pompe dépend aussi du débit
                      souhaité, de la profondeur du forage, de la hauteur de
                      refoulement et des heures de pompage. Ces informations
                      devront être vérifiées par un spécialiste.
                    </p>
                  </div>
                )}

                <div className="mt-8 rounded-2xl bg-slate-50 p-4 sm:p-5">
                  <h3 className="font-black text-blue-950">
                    Comment fonctionne le simulateur ?
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {[
                      ["1", "Décrire", "Indique ton profil et ton compteur."],
                      ["2", "Calculer", "Renseigne tes appareils et leurs horaires."],
                      ["3", "Comparer", "Consulte les kits correspondant aux données disponibles."],
                    ].map(([n, titre, description]) => (
                      <div key={n} className="flex gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-sm font-black text-orange-600">
                          {n}
                        </span>
                        <div>
                          <p className="text-sm font-black text-blue-950">{titre}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 */}
            {etape === 2 && (
              <div>
                <SectionTitre
                  numero="02"
                  titre="Votre compteur"
                  description="Utilisez les données du compteur lorsqu'elles sont disponibles. Sinon, les appareils serviront de base."
                />

                <div className="grid gap-3 sm:grid-cols-3">
                  <ChoixCarte
                    actif={compteur === "woyofal"}
                    onClick={() => setCompteur("woyofal")}
                    icone="🎫"
                    titre="Woyofal"
                    description="Compteur prépayé."
                  />
                  <ChoixCarte
                    actif={compteur === "senelec"}
                    onClick={() => setCompteur("senelec")}
                    icone="🧾"
                    titre="Senelec"
                    description="Compteur à facture."
                  />
                  <ChoixCarte
                    actif={compteur === "aucun"}
                    onClick={() => setCompteur("aucun")}
                    icone="⚡"
                    titre="Sans compteur"
                    description="Installation isolée ou nouveau projet."
                  />
                </div>

                {compteur !== "aucun" && (
                  <div className="mt-6">
                    <p className="mb-3 text-sm font-bold text-slate-700">
                      Type d'abonnement
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        ["monophase", "Monophasé"],
                        ["triphase", "Triphasé"],
                        ["inconnu", "Je ne sais pas"],
                      ].map(([valeur, label]) => (
                        <button
                          type="button"
                          key={valeur}
                          onClick={() => setTypeAbonnement(valeur)}
                          className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${
                            typeAbonnement === valeur
                              ? "border-blue-700 bg-blue-50 text-blue-900"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {compteur === "woyofal" && (
                  <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">
                    <h3 className="font-black text-orange-950">
                      Informations Woyofal
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-orange-950/80">
                      Les codes 813, 814 et 820 sont affichés comme repères.
                      Leur fonction peut varier selon le compteur : vérifie les
                      instructions de ton appareil avant de les utiliser.
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {["813", "814", "820"].map((code) => (
                        <div key={code} className="rounded-xl border border-orange-200 bg-white p-3">
                          <p className="text-2xl font-black text-orange-600">{code}</p>
                          <p className="mt-1 text-[10px] leading-4 text-slate-500">
                            Code de référence
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <Champ
                        label="Montant habituel des recharges (FCFA)"
                        value={montantWoyofal}
                        onChange={setMontantWoyofal}
                        type="number"
                        min="0"
                        placeholder="Ex. : 25000"
                      />
                      <Champ
                        label="Consommation connue (kWh/mois)"
                        value={kwhWoyofal}
                        onChange={setKwhWoyofal}
                        type="number"
                        min="0"
                        placeholder="Facultatif"
                      />
                    </div>

                    <p className="mt-3 text-xs leading-5 text-orange-900/70">
                      Le montant acheté ne permet pas, à lui seul, de déduire
                      précisément les kWh consommés. Si tu ne connais pas ta
                      consommation, renseigne tes appareils à l'étape suivante.
                    </p>
                  </div>
                )}

                {compteur === "senelec" && (
                  <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                    <h3 className="font-black text-blue-950">
                      Consommation sur votre facture
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-blue-900/80">
                      Saisis les kWh et les montants indiqués sur ta facture.
                      Laisse à zéro toute tranche absente. Le calcul ne suppose
                      aucun tarif fixe par kWh.
                    </p>

                    <div className="mt-5 space-y-4">
                      {tranches.map((tranche, index) => (
                        <div key={index} className="rounded-xl border border-blue-100 bg-white p-4">
                          <p className="mb-3 text-sm font-black text-blue-950">
                            Tranche {index + 1}
                          </p>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Champ
                              label="Montant (FCFA)"
                              value={tranche.montant}
                              onChange={(value) => modifierTranche(index, "montant", value)}
                              type="number"
                              min="0"
                              placeholder="Montant"
                            />
                            <Champ
                              label="Consommation (kWh)"
                              value={tranche.kwh}
                              onChange={(value) => modifierTranche(index, "kwh", value)}
                              type="number"
                              min="0"
                              placeholder="kWh"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {compteur === "aucun" && (
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="font-black text-blue-950">
                      Pas de consommation connue ?
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Aucun problème. Le calcul reposera sur la puissance et
                      la durée d'utilisation des appareils renseignés à l'étape suivante.
                    </p>
                  </div>
                )}

                {montantDeclare > 0 && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
                    <span className="text-slate-500">Montant total déclaré : </span>
                    <strong className="text-blue-950">{FCFA(montantDeclare)}</strong>
                    {consommationDeclaree > 0 && (
                      <p className="mt-1 text-slate-500">
                        Consommation déclarée : {fmt(consommationDeclaree)} kWh/mois
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 3 */}
            {etape === 3 && (
              <div>
                <SectionTitre
                  numero="03"
                  titre="Vos appareils électriques"
                  description="Indique la quantité, la puissance et les heures d'utilisation de chaque appareil."
                />

                <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm leading-6 text-blue-950/80">
                    Les puissances sont des valeurs moyennes. Si tu connais la
                    puissance inscrite sur l'étiquette de ton appareil, utilise
                    cette valeur. Les heures de jour et de nuit sont modifiables.
                    Le même appareil ne doit pas être compté deux fois.
                  </p>
                </div>

                <div className="space-y-4">
                  {appareils.map((appareil) => (
                    <div key={appareil.id} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {appareil.categorie}
                          </span>
                          <h3 className="mt-2 font-black text-blue-950">{appareil.nom}</h3>
                          <p className="mt-1 text-xs text-slate-500">
                            Puissance unitaire : {fmt(appareil.puissance)} W
                          </p>
                        </div>

                        <div className="w-full sm:max-w-[140px]">
                          <label className="mb-2 block text-xs font-bold text-slate-600">
                            Quantité
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              aria-label={`Diminuer ${appareil.nom}`}
                              onClick={() =>
                                modifierAppareil(
                                  appareil.id,
                                  "quantite",
                                  Math.max(0, nombreValide(appareil.quantite) - 1)
                                )
                              }
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-xl font-bold text-blue-900 hover:bg-blue-50"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="0"
                              max="999"
                              value={appareil.quantite}
                              onChange={(event) =>
                                modifierAppareil(appareil.id, "quantite", event.target.value)
                              }
                              className="h-11 w-full min-w-0 rounded-xl border border-slate-200 px-2 text-center text-sm font-black outline-none focus:border-blue-600"
                            />
                            <button
                              type="button"
                              aria-label={`Augmenter ${appareil.nom}`}
                              onClick={() =>
                                modifierAppareil(
                                  appareil.id,
                                  "quantite",
                                  nombreValide(appareil.quantite) + 1
                                )
                              }
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-xl font-bold text-blue-900 hover:bg-blue-50"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <label className="block">
                          <span className="mb-2 block text-xs font-bold text-slate-600">
                            Puissance (W)
                          </span>
                          <input
                            type="number"
                            min="1"
                            value={appareil.puissance}
                            onChange={(event) =>
                              modifierAppareil(appareil.id, "puissance", event.target.value)
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-600"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-xs font-bold text-slate-600">
                            Heures de jour
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.25"
                            value={appareil.jour}
                            onChange={(event) =>
                              modifierAppareil(appareil.id, "jour", event.target.value)
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-600"
                          />
                        </label>

                        <label className="col-span-2 block sm:col-span-1">
                          <span className="mb-2 block text-xs font-bold text-slate-600">
                            Heures de nuit
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.25"
                            value={appareil.nuit}
                            onChange={(event) =>
                              modifierAppareil(appareil.id, "nuit", event.target.value)
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-600"
                          />
                        </label>
                      </div>

                      {nombreValide(appareil.quantite) > 0 && (
                        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                          Énergie quotidienne :{" "}
                          <span className="text-blue-900">
                            {fmt(
                              (nombreValide(appareil.quantite) *
                                nombreValide(appareil.puissance) *
                                (Math.min(24, nombreValide(appareil.jour)) +
                                  Math.min(24, nombreValide(appareil.nuit)))) /
                                1000
                            )}{" "}
                            kWh
                          </span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {appareilsPerso.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-3 font-black text-blue-950">
                      Vos appareils personnalisés
                    </h3>
                    <div className="space-y-3">
                      {appareilsPerso.map((appareil) => (
                        <div key={appareil.id} className="flex items-start justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
                          <div className="min-w-0">
                            <p className="break-words font-bold text-blue-950">{appareil.nom}</p>
                            <p className="mt-1 text-xs text-slate-600">
                              {appareil.quantite} × {appareil.puissance} W · jour : {appareil.jour} h · nuit : {appareil.nuit} h
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => supprimerAppareil(appareil.id)}
                            className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                          >
                            Supprimer
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-7 rounded-[1.5rem] border border-dashed border-blue-300 bg-blue-50/50 p-5 sm:p-6">
                  <h3 className="text-lg font-black text-blue-950">
                    Un appareil manque ?
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Ajoute-le avec sa puissance et ses heures d'utilisation.
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Champ
                      label="Nom de l'appareil"
                      value={appareilPersonnalise.nom}
                      onChange={(value) =>
                        setAppareilPersonnalise((p) => ({ ...p, nom: value }))
                      }
                      placeholder="Ex. : Pompe de piscine"
                    />
                    <Champ
                      label="Puissance unitaire (W)"
                      value={appareilPersonnalise.puissance}
                      onChange={(value) =>
                        setAppareilPersonnalise((p) => ({ ...p, puissance: value }))
                      }
                      type="number"
                      min="1"
                    />
                    <Champ
                      label="Quantité"
                      value={appareilPersonnalise.quantite}
                      onChange={(value) =>
                        setAppareilPersonnalise((p) => ({ ...p, quantite: value }))
                      }
                      type="number"
                      min="1"
                    />
                    <Champ
                      label="Heures de jour"
                      value={appareilPersonnalise.jour}
                      onChange={(value) =>
                        setAppareilPersonnalise((p) => ({ ...p, jour: value }))
                      }
                      type="number"
                      min="0"
                      max="24"
                      step="0.25"
                    />
                    <Champ
                      label="Heures de nuit"
                      value={appareilPersonnalise.nuit}
                      onChange={(value) =>
                        setAppareilPersonnalise((p) => ({ ...p, nuit: value }))
                      }
                      type="number"
                      min="0"
                      max="24"
                      step="0.25"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={ajouterAppareil}
                    className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-blue-800 bg-white px-5 py-3 text-sm font-bold text-blue-800 hover:bg-blue-50 sm:w-auto"
                  >
                    + Ajouter cet appareil
                  </button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-blue-950 p-4 text-white">
                    <p className="text-xs font-bold text-blue-200">Énergie / jour</p>
                    <p className="mt-2 text-2xl font-black">
                      {fmt(calcul.kwhJour)} <span className="text-sm">kWh</span>
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-bold text-slate-500">Énergie / mois</p>
                    <p className="mt-2 text-2xl font-black text-blue-950">
                      {fmt(calcul.kwhMois)} <span className="text-sm">kWh</span>
                    </p>
                  </div>
                  <div className="rounded-2xl bg-orange-50 p-4 ring-1 ring-orange-100">
                    <p className="text-xs font-bold text-orange-700">Appareils utilisés</p>
                    <p className="mt-2 text-2xl font-black text-blue-950">
                      {calcul.nombreAppareils}
                    </p>
                  </div>
                </div>

                {consommationDeclaree > 0 && (
                  <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
                    La consommation du compteur ({fmt(consommationDeclaree)} kWh/mois)
                    sera utilisée comme référence. Elle ne sera pas ajoutée une
                    deuxième fois à la consommation des appareils.
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 4 */}
            {etape === 4 && (
              <form onSubmit={calculerDimensionnement}>
                <SectionTitre
                  numero="04"
                  titre="Vos coordonnées"
                  description="Pour recevoir votre étude et demander un devis personnalisé."
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Champ
                    label="Nom et prénom"
                    value={nom}
                    onChange={setNom}
                    placeholder="Votre nom complet"
                    required
                  />
                  <Champ
                    label="Téléphone / WhatsApp"
                    value={telephone}
                    onChange={setTelephone}
                    placeholder="Ex. : +221 78 000 00 00"
                    required
                  />
                  <Champ
                    label="Ville / quartier"
                    value={ville}
                    onChange={setVille}
                    placeholder="Ex. : Pikine, Dakar"
                  />
                  <Champ
                    label="E-mail (facultatif)"
                    value={email}
                    onChange={setEmail}
                    type="email"
                    placeholder="vous@exemple.com"
                  />
                </div>

                <label className="mt-5 block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Précisions sur votre projet
                  </span>
                  <textarea
                    value={precision}
                    onChange={(event) => setPrecision(event.target.value)}
                    rows={4}
                    placeholder="Budget, autonomie souhaitée, coupures, profondeur du forage, besoins particuliers..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <h3 className="font-black text-blue-950">
                    Récapitulatif avant calcul
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-slate-500">Profil</p>
                      <p className="mt-1 text-sm font-black text-blue-950">
                        {profil === "residentiel" ? "Résidentiel" : profil === "entreprise" ? "Entreprise" : "Pompage"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Compteur</p>
                      <p className="mt-1 text-sm font-black text-blue-950">
                        {compteur === "woyofal" ? "Woyofal" : compteur === "senelec" ? "Senelec" : "Aucun"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Référence retenue</p>
                      <p className="mt-1 text-sm font-black text-blue-950">
                        {fmt(kwhJourFinal)} kWh/j
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Appareils utilisés</p>
                      <p className="mt-1 text-sm font-black text-blue-950">
                        {calcul.nombreAppareils}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Les résultats sont des calculs préliminaires. Le choix final
                  doit être confirmé en fonction des caractéristiques réelles
                  des appareils, des équipements solaires et du site.
                </p>

                <button
                  type="submit"
                  className="mt-6 flex min-h-[54px] w-full items-center justify-center gap-3 rounded-full bg-orange-500 px-6 py-4 text-sm font-black text-white shadow-lg shadow-orange-900/10 transition hover:bg-orange-600"
                >
                  Calculer mon dimensionnement <span>→</span>
                </button>
              </form>
            )}

            {erreurFormulaire && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700"
              >
                {erreurFormulaire}
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={allerEtapePrecedente}
                disabled={etape === 1}
                className="min-h-[48px] rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition hover:border-blue-700 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Étape précédente
              </button>

              {etape < 4 && (
                <button
                  type="button"
                  onClick={allerEtapeSuivante}
                  className="min-h-[48px] rounded-full bg-blue-800 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition hover:bg-blue-900"
                >
                  Continuer →
                </button>
              )}
            </div>
          </div>

          {/* PANNEAU LATÉRAL */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="rounded-[1.75rem] bg-blue-950 p-6 text-white shadow-xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-400">
                Votre consommation
              </p>
              <p className="mt-4 text-4xl font-black">{fmt(calcul.kwhJour)}</p>
              <p className="mt-1 text-sm text-blue-200">kWh calculés par jour</p>

              <div className="my-5 h-px bg-white/10" />

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-blue-200">Énergie mensuelle</span>
                <strong className="text-sm">{fmt(calcul.kwhMois)} kWh</strong>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-sm text-blue-200">Appareils sélectionnés</span>
                <strong className="text-sm">{calcul.nombreAppareils}</strong>
              </div>

              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-xs leading-5 text-blue-100/80">
                  Le résultat évolue lorsque tu modifies les puissances,
                  les quantités ou les durées d'utilisation.
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
              <h3 className="font-black text-blue-950">Besoin d'aide ?</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Notre équipe peut t'aider à préciser tes besoins et à vérifier
                le choix du matériel.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Bonjour Solar Smart, j'ai besoin d'aide pour mon estimation solaire.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-3 text-sm font-black text-white transition hover:bg-green-600"
              >
                WhatsApp <span>→</span>
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="mt-3 block break-all text-center text-sm font-semibold text-blue-800 hover:text-orange-500"
              >
                {EMAIL}
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* RÉSULTATS */}
      {resultatVisible && (
        <section
          id="resultat-dimensionnement"
          className="scroll-mt-24 bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white sm:p-10 lg:p-12">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <span className="inline-flex rounded-full bg-orange-500/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-orange-400">
                    Résultat de votre calcul
                  </span>
                  <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                    Votre dimensionnement
                    <span className="block text-orange-400">préliminaire.</span>
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                    Bonjour {nom}. Voici les besoins calculés à partir des
                    données renseignées. Les caractéristiques du matériel
                    devront être validées avant de choisir définitivement un kit.
                  </p>
                </div>

                <a
                  href={urlWhatsAppDevis}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-green-500 px-7 py-4 text-sm font-black text-white transition hover:bg-green-600"
                >
                  Demander mon devis sur WhatsApp <span>→</span>
                </a>
              </div>

              <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  [
                    "Énergie quotidienne",
                    `${fmt(kwhJourFinal)} kWh`,
                    "Besoin énergétique de référence par jour.",
                  ],
                  [
                    "Énergie mensuelle",
                    `${fmt(kwhMoisFinal)} kWh`,
                    "Référence mensuelle utilisée pour le calcul.",
                  ],
                  [
                    "Panneaux de 550 W",
                    `${panneauxFinal}`,
                    "Quantité indicative selon les hypothèses solaires.",
                  ],
                  [
                    "Puissance photovoltaïque",
                    `${fmt(kwcFinal)} kWc`,
                    "Puissance théorique du champ de panneaux.",
                  ],
                  [
                    "Batterie",
                    `${fmt(batterieFinale)} kWh`,
                    "Capacité nominale indicative selon l'énergie nocturne estimée.",
                  ],
                  [
                    "Onduleur",
                    `${fmt(puissanceOnduleurFinale)} kW`,
                    "Base calculée à partir de la puissance cumulée des appareils renseignés.",
                  ],
                ].map(([titre, valeur, description]) => (
                  <div key={titre} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                    <p className="text-xs font-bold leading-5 text-blue-200">{titre}</p>
                    <p className="mt-3 break-words text-2xl font-black text-white sm:text-3xl">{valeur}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 sm:p-8">
                <h3 className="text-xl font-black text-blue-950">
                  Comprendre le résultat
                </h3>

                <div className="mt-6 space-y-5">
                  <div>
                    <p className="font-bold text-blue-950">1. Panneaux solaires</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Le calcul utilise cinq heures solaires équivalentes par
                      jour et une marge de 30 % pour les pertes. Ces hypothèses
                      ne remplacent pas une étude d'ensoleillement, d'orientation
                      et d'ombrage du site.
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-blue-950">2. Batterie</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Le stockage estimé dépend de la consommation nocturne
                      déclarée. Si les horaires ne sont pas renseignés, une
                      hypothèse de 50 % de la consommation journalière est utilisée.
                      L'autonomie réelle doit être définie avec le client.
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-blue-950">3. Onduleur</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      La puissance affichée repose sur la somme des puissances
                      nominales avec une marge de 25 %. Les appels de courant
                      des moteurs, climatiseurs et pompes doivent être vérifiés.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-orange-200 bg-orange-50 p-6 sm:p-8">
                <h3 className="text-xl font-black text-blue-950">
                  Validation technique nécessaire
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Le calcul est un pré-dimensionnement et non un devis ferme.
                  Le choix final doit tenir compte des fiches techniques,
                  de l'autonomie, des protections électriques, des câbles,
                  des appels de courant et des conditions du site.
                </p>

                <div className="mt-5 space-y-3 text-sm font-semibold text-blue-950">
                  {[
                    "Vérifier les puissances et la consommation réelle.",
                    "Vérifier le champ photovoltaïque.",
                    "Vérifier l'onduleur et la batterie.",
                    "Confirmer la disponibilité du kit proposé.",
                  ].map((ligne) => (
                    <div key={ligne} className="flex items-start gap-3">
                      <span className="mt-0.5 text-orange-500">✓</span>
                      <span>{ligne}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={urlWhatsAppDevis}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-blue-800 px-6 py-4 text-sm font-black text-white transition hover:bg-blue-900"
                >
                  Faire vérifier mon installation <span>→</span>
                </a>
              </div>
            </div>

            {/* PRODUITS DU CATALOGUE */}
            <div className="mt-12">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-orange-600">
                    Catalogue Solar Smart
                  </span>
                  <h3 className="mt-4 text-2xl font-black text-blue-950 sm:text-3xl">
                    Kits correspondant à votre besoin
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Les propositions automatiques utilisent le profil et la
                    capacité énergétique déclarée dans le catalogue. Les autres
                    caractéristiques doivent aussi être confirmées.
                  </p>
                </div>

                <Link href="/#produits" className="text-sm font-black text-blue-800 hover:text-orange-500">
                  Voir tout le catalogue →
                </Link>
              </div>

              {loadingProduits && (
                <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-sm font-semibold text-slate-500">
                  Chargement du catalogue...
                </div>
              )}

              {!loadingProduits && erreurProduits && (
                <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm leading-6 text-orange-900">
                  {erreurProduits}{" "}
                  <Link href="/#produits" className="font-black underline">
                    Consulter le catalogue.
                  </Link>
                </div>
              )}

              {!loadingProduits &&
                !erreurProduits &&
                produitsRecommandes.length === 0 && (
                  <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7">
                    <p className="font-black text-blue-950">
                      Aucun kit n'a pu être confirmé automatiquement.
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Cela peut signifier qu'aucun kit du profil choisi ne
                      possède une capacité déclarée suffisante, ou que les
                      caractéristiques du catalogue sont incomplètes. Nous
                      préférons ne pas présenter un kit inadapté comme compatible.
                    </p>
                    <a
                      href={urlWhatsAppDevis}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex rounded-full bg-green-500 px-5 py-3 text-sm font-bold text-white hover:bg-green-600"
                    >
                      Demander une étude personnalisée
                    </a>
                  </div>
                )}

              {!loadingProduits && produitsRecommandes.length > 0 && (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {produitsRecommandes.map((produit, index) => {
                    const nomKit = nomProduit(produit);
                    const prix = prixProduit(produit);
                    const energie = energieProduit(produit);
                    const pv = puissancePanneauxProduit(produit);
                    const batterie = batterieProduit(produit);
                    const onduleur = onduleurProduit(produit);
                    const image =
                      produit?.image_url ||
                      produit?.image ||
                      produit?.photo;

                    const detailsConnus = [
                      energie !== null,
                      pv !== null,
                      batterie !== null,
                      onduleur !== null,
                    ].filter(Boolean).length;

                    return (
                      <article
                        key={produit.id || `${nomKit}-${index}`}
                        className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div className="relative flex h-48 items-center justify-center overflow-hidden bg-slate-50">
                          {image ? (
                            <img
                              src={image}
                              alt={nomKit}
                              loading="lazy"
                              className="h-full w-full object-contain p-5"
                            />
                          ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl">
                              ☀️
                            </div>
                          )}

                          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-900 shadow">
                            {estPompage(produit) ? "Pompage solaire" : "Kit solaire"}
                          </span>
                        </div>

                        <div className="p-5">
                          <h4 className="break-words text-lg font-black text-blue-950">
                            {nomKit}
                          </h4>

                          {prix !== null && (
                            <p className="mt-2 text-base font-black text-orange-500">
                              {FCFA(prix)}
                            </p>
                          )}

                          {energie !== null && (
                            <p className="mt-3 text-sm font-semibold text-slate-600">
                              Capacité déclarée : {fmt(energie)} kWh/jour
                            </p>
                          )}

                          {pv !== null && (
                            <p className="mt-2 text-xs text-slate-500">
                              Panneaux : {fmt(pv)} Wc
                            </p>
                          )}

                          {batterie !== null && (
                            <p className="mt-1 text-xs text-slate-500">
                              Batterie : {fmt(batterie)} kWh
                            </p>
                          )}

                          {onduleur !== null && (
                            <p className="mt-1 text-xs text-slate-500">
                              Onduleur : {fmt(onduleur)} kW
                            </p>
                          )}

                          <div className="mt-4 rounded-xl bg-blue-50 p-3">
                            <p className="text-xs font-bold text-blue-950">
                              Besoin estimé : {fmt(kwhJourFinal)} kWh/jour
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-600">
                              {detailsConnus === 4
                                ? "Les principales caractéristiques sont renseignées. Une validation technique finale reste nécessaire."
                                : "Certaines caractéristiques sont absentes du catalogue. Leur compatibilité doit être vérifiée avant de confirmer ce kit."}
                            </p>
                          </div>

                          <a
                            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                              `Bonjour Solar Smart, je souhaite étudier le kit "${nomKit}". Mon besoin estimé est de ${fmt(kwhJourFinal)} kWh/jour, avec une puissance photovoltaïque théorique de ${fmt(kwcFinal)} kWc. Merci de vérifier la compatibilité, le stockage, l'onduleur et le prix.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-blue-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                          >
                            Demander un devis <span>→</span>
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CONTACT FINAL */}
            <div className="mt-12 overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 p-6 sm:p-9">
              <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div className="max-w-2xl">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-400">
                    Solar Smart · Sénégal
                  </p>
                  <h3 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                    Passons de votre calcul à votre projet.
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-blue-100/75">
                    Transmettez vos résultats à notre équipe pour une étude
                    technique et un devis personnalisé.
                  </p>
                </div>

                <a
                  href={urlWhatsAppDevis}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[52px] w-full shrink-0 items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-4 text-sm font-black text-white transition hover:bg-green-600 sm:w-auto"
                >
                  Envoyer mes résultats <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="w-full bg-slate-950 text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Link href="/" className="flex items-center gap-3 text-2xl font-black tracking-tight">
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
                Des solutions solaires adaptées à vos besoins au Sénégal :
                kits solaires pour maison, entreprise et pompage solaire.
              </p>

              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-[46px] items-center gap-2 rounded-full bg-green-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-600"
              >
                WhatsApp
              </a>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Navigation
              </h3>
              <div className="mt-5 space-y-3">
                <Link href="/" className="block text-sm text-slate-400 transition hover:text-orange-400">
                  Accueil
                </Link>
                <Link href="/#services" className="block text-sm text-slate-400 transition hover:text-orange-400">
                  Services
                </Link>
                <Link href="/#produits" className="block text-sm text-slate-400 transition hover:text-orange-400">
                  Produits
                </Link>
                <Link href="/estimation" className="block text-sm text-slate-400 transition hover:text-orange-400">
                  Estimation
                </Link>
                <Link href="/#contact" className="block text-sm text-slate-400 transition hover:text-orange-400">
                  Contact
                </Link>
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
                  en face du marché Sandika — Sénégal
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-7 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-slate-300">Solar Smart</span>.
              Tous droits réservés.
            </p>
            <p>Énergie solaire au Sénégal</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
