"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/AdminGuard";

/* ===========================================================
   CONSTANTES
=========================================================== */

const TYPES_IMAGES_AUTORISES = ["image/jpeg", "image/png", "image/webp"];
const TAILLE_MAX_IMAGE = 5 * 1024 * 1024;

const CATEGORIES_KITS = [
  { value: "kit-complet-maison", label: "Kit complet maison", court: "Maison" },
  {
    value: "kit-complet-pompage",
    label: "Kit complet pompage solaire",
    court: "Pompage",
  },
];

const CATEGORIES_COMPOSANTS = [
  { value: "panneau", label: "Panneau solaire" },
  { value: "batterie", label: "Batterie" },
  { value: "onduleur", label: "Onduleur" },
  { value: "protection", label: "Coffret et protection" },
  { value: "support", label: "Support et structure" },
  { value: "pompe", label: "Pompe solaire" },
  { value: "cable", label: "Câbles et connectique" },
  { value: "autre", label: "Autre équipement" },
];

/* ===========================================================
   STYLES PARTAGÉS
=========================================================== */

const champ =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:bg-slate-100";

const boutonPrincipal =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const boutonSecondaire =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const boutonDanger =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const boutonIcone =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-blue-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-40";

/* ===========================================================
   FONCTIONS UTILES
=========================================================== */

function formatPrix(value) {
  return `${Number(value || 0).toLocaleString("fr-FR", {
    maximumFractionDigits: 0,
  })} FCFA`;
}

function getErrorMessage(error) {
  return error?.message || "Une erreur inconnue est survenue.";
}

function categorieKitLabel(categorie) {
  return (
    CATEGORIES_KITS.find((item) => item.value === categorie)?.label ||
    "Non classé"
  );
}

function categorieComposantLabel(categorie) {
  return (
    CATEGORIES_COMPOSANTS.find((item) => item.value === categorie)?.label ||
    "Autre équipement"
  );
}

function lireComposition(valeur) {
  if (Array.isArray(valeur)) return valeur;

  if (typeof valeur === "string") {
    try {
      const resultat = JSON.parse(valeur);
      return Array.isArray(resultat) ? resultat : [];
    } catch {
      return [];
    }
  }

  return [];
}

let compteurLigne = 0;

function nouvelleLigne(base = {}) {
  compteurLigne += 1;

  return {
    _id: `ligne-${compteurLigne}`,
    nom: "",
    quantite: 1,
    prix: 0,
    ...base,
  };
}

function totalLignes(lignes) {
  return lignes
    .filter((ligne) => ligne.nom.trim())
    .reduce(
      (total, ligne) =>
        total + (Number(ligne.quantite) || 0) * (Number(ligne.prix) || 0),
      0
    );
}

function serialiserKit(etat) {
  return JSON.stringify({
    nom: etat.nom,
    description: etat.description,
    categorie: etat.categorie,
    imageExistante: etat.imageExistante,
    nouvelleImage: etat.nouvelleImage,
    lignes: etat.lignes.map((ligne) => ({
      nom: ligne.nom,
      quantite: ligne.quantite,
      prix: ligne.prix,
    })),
    prixManuelActif: etat.prixManuelActif,
    prixManuel: etat.prixManuel,
  });
}

/* ===========================================================
   ICÔNES
=========================================================== */

const ICONES = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </>
  ),
  box: (
    <>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </>
  ),
  layers: (
    <>
      <path d="m12 2 10 5-10 5L2 7l10-5Z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  close: <path d="M18 6 6 18M6 6l12 12" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  external: (
    <>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </>
  ),
};

function Icone({ nom, className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICONES[nom]}
    </svg>
  );
}

/* ===========================================================
   PETITS COMPOSANTS D'INTERFACE
=========================================================== */

function Panneau({ titre, description, action, children, className = "" }) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white ${className}`}
    >
      {(titre || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-blue-950">{titre}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-slate-500">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function Champ({ label, obligatoire, aide, htmlFor, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
        {obligatoire && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {aide && <p className="mt-1.5 text-xs text-slate-500">{aide}</p>}
    </div>
  );
}

function Interrupteur({ actif, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 ${
        actif ? "bg-green-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          actif ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function Pastille({ children, ton = "gris" }) {
  const tons = {
    gris: "bg-slate-100 text-slate-700",
    bleu: "bg-blue-50 text-blue-800",
    vert: "bg-green-50 text-green-800",
    ambre: "bg-amber-50 text-amber-800",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tons[ton]}`}
    >
      {children}
    </span>
  );
}

function EtatVide({ titre, texte, action }) {
  return (
    <div className="px-6 py-14 text-center">
      <h3 className="text-base font-semibold text-blue-950">{titre}</h3>
      {texte && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{texte}</p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

function LignesSquelette({ nombre = 4 }) {
  return (
    <ul className="divide-y divide-slate-200">
      {Array.from({ length: nombre }).map((_, index) => (
        <li key={index} className="flex items-center gap-3 px-5 py-4">
          <div className="h-14 w-14 animate-pulse rounded-lg bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ===========================================================
   PAGE ADMIN
=========================================================== */

export default function AdminPage() {
  const [onglet, setOnglet] = useState("dashboard");
  const [menuMobile, setMenuMobile] = useState(false);

  // Données
  const [produits, setProduits] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [chargementProduits, setChargementProduits] = useState(true);
  const [chargementCatalogue, setChargementCatalogue] = useState(true);

  // Actions et retours
  const [toasts, setToasts] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [deconnexion, setDeconnexion] = useState(false);
  const [basculeId, setBasculeId] = useState(null);

  // Liste des kits
  const [rechercheKit, setRechercheKit] = useState("");
  const [filtreKit, setFiltreKit] = useState("tous");
  const [triKit, setTriKit] = useState("recent");

  // Éditeur de kit
  const [vueKit, setVueKit] = useState("liste");
  const [kitId, setKitId] = useState(null);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [categorie, setCategorie] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageExistante, setImageExistante] = useState("");
  const [lignes, setLignes] = useState([]);
  const [derniereLigneId, setDerniereLigneId] = useState(null);
  const [prixManuelActif, setPrixManuelActif] = useState(false);
  const [prixManuel, setPrixManuel] = useState("");
  const [recherchePicker, setRecherchePicker] = useState("");
  const [filtrePicker, setFiltrePicker] = useState("tous");

  // Bibliothèque d'équipements
  const [rechercheComposant, setRechercheComposant] = useState("");
  const [filtreComposant, setFiltreComposant] = useState("tous");
  const [afficherInactifs, setAfficherInactifs] = useState(false);
  const [panneauComposant, setPanneauComposant] = useState(false);
  const [composantId, setComposantId] = useState(null);
  const [nomComposant, setNomComposant] = useState("");
  const [descriptionComposant, setDescriptionComposant] = useState("");
  const [categorieComposant, setCategorieComposant] = useState("autre");
  const [referenceComposant, setReferenceComposant] = useState("");
  const [prixComposant, setPrixComposant] = useState("0");
  const [imageUrlComposant, setImageUrlComposant] = useState("");
  const [actifComposant, setActifComposant] = useState(true);

  const fileInputRef = useRef(null);
  const instantaneInitial = useRef("");

  /* ---------- Données dérivées ---------- */

  const composantsActifs = useMemo(
    () => catalogue.filter((item) => item.actif),
    [catalogue]
  );

  const prixMoyen = useMemo(() => {
    if (!produits.length) return 0;
    const total = produits.reduce(
      (somme, item) => somme + Number(item.prix || 0),
      0
    );
    return total / produits.length;
  }, [produits]);

  const kitsACompleter = useMemo(
    () =>
      produits
        .map((produit) => {
          const problemes = [];

          if (!produit.image_url) problemes.push("pas d'image");
          if (!(produit.description || "").trim())
            problemes.push("pas de description");
          if (!lireComposition(produit.composants).length)
            problemes.push("pas de composition");

          return { produit, problemes };
        })
        .filter((item) => item.problemes.length > 0),
    [produits]
  );

  const utilisationParNom = useMemo(() => {
    const compteur = new Map();

    produits.forEach((produit) => {
      const noms = new Set(
        lireComposition(produit.composants)
          .map((ligne) => String(ligne.nom || "").trim().toLowerCase())
          .filter(Boolean)
      );

      noms.forEach((cle) => compteur.set(cle, (compteur.get(cle) || 0) + 1));
    });

    return compteur;
  }, [produits]);

  const kitsFiltres = useMemo(() => {
    const recherche = rechercheKit.trim().toLowerCase();

    const liste = produits.filter((produit) => {
      const correspondRecherche = `${produit.nom || ""} ${
        produit.description || ""
      }`
        .toLowerCase()
        .includes(recherche);

      const correspondCategorie =
        filtreKit === "tous" || produit.categorie === filtreKit;

      return correspondRecherche && correspondCategorie;
    });

    const tri = [...liste];

    if (triKit === "nom") {
      tri.sort((a, b) => (a.nom || "").localeCompare(b.nom || "", "fr"));
    } else if (triKit === "prix-asc") {
      tri.sort((a, b) => Number(a.prix || 0) - Number(b.prix || 0));
    } else if (triKit === "prix-desc") {
      tri.sort((a, b) => Number(b.prix || 0) - Number(a.prix || 0));
    }

    return tri;
  }, [produits, rechercheKit, filtreKit, triKit]);

  const composantsFiltres = useMemo(() => {
    const recherche = rechercheComposant.trim().toLowerCase();

    return catalogue.filter((item) => {
      const correspondRecherche = `${item.nom || ""} ${
        item.description || ""
      } ${item.reference || ""}`
        .toLowerCase()
        .includes(recherche);

      const correspondCategorie =
        filtreComposant === "tous" || item.categorie === filtreComposant;

      const correspondStatut = afficherInactifs || item.actif;

      return correspondRecherche && correspondCategorie && correspondStatut;
    });
  }, [catalogue, rechercheComposant, filtreComposant, afficherInactifs]);

  const categoriesPicker = useMemo(
    () =>
      CATEGORIES_COMPOSANTS.filter((categorieItem) =>
        composantsActifs.some((item) => item.categorie === categorieItem.value)
      ),
    [composantsActifs]
  );

  const resultatsPicker = useMemo(() => {
    const recherche = recherchePicker.trim().toLowerCase();

    return composantsActifs.filter((item) => {
      const correspondCategorie =
        filtrePicker === "tous" || item.categorie === filtrePicker;

      const correspondRecherche = `${item.nom || ""} ${item.reference || ""} ${
        item.description || ""
      }`
        .toLowerCase()
        .includes(recherche);

      return correspondCategorie && correspondRecherche;
    });
  }, [composantsActifs, recherchePicker, filtrePicker]);

  const quantiteParNom = useMemo(() => {
    const compteur = new Map();

    lignes.forEach((ligne) => {
      const cle = ligne.nom.trim().toLowerCase();
      if (!cle) return;
      compteur.set(cle, (compteur.get(cle) || 0) + (Number(ligne.quantite) || 0));
    });

    return compteur;
  }, [lignes]);

  const totalCalcule = totalLignes(lignes);
  const prixFinal = prixManuelActif ? Number(prixManuel) || 0 : totalCalcule;
  const nombreEquipements = lignes.filter((ligne) => ligne.nom.trim()).length;

  const instantaneActuel = serialiserKit({
    nom,
    description,
    categorie,
    imageExistante,
    nouvelleImage: Boolean(image),
    lignes,
    prixManuelActif,
    prixManuel,
  });

  const kitModifie =
    vueKit === "editeur" && instantaneActuel !== instantaneInitial.current;

  /* ---------- Effets ---------- */

  useEffect(() => {
    chargerProduits();
    chargerCatalogue();
  }, []);

  useEffect(() => {
    if (!kitModifie) return undefined;

    function avantDeQuitter(event) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", avantDeQuitter);

    return () => window.removeEventListener("beforeunload", avantDeQuitter);
  }, [kitModifie]);

  useEffect(() => {
    function surTouche(event) {
      if (event.key !== "Escape") return;

      if (confirmation) {
        setConfirmation(null);
      } else if (panneauComposant) {
        fermerPanneauComposant();
      } else if (menuMobile) {
        setMenuMobile(false);
      }
    }

    window.addEventListener("keydown", surTouche);

    return () => window.removeEventListener("keydown", surTouche);
  }, [confirmation, panneauComposant, menuMobile]);

  /* ---------- Chargement ---------- */

  async function chargerProduits() {
    setChargementProduits(true);

    const { data, error } = await supabase
      .from("produits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      notifier(`Impossible de charger les kits : ${error.message}`, "error");
    } else {
      setProduits(data || []);
    }

    setChargementProduits(false);
  }

  async function chargerCatalogue() {
    setChargementCatalogue(true);

    const { data, error } = await supabase
      .from("composants_catalogue")
      .select("*")
      .order("nom", { ascending: true });

    if (error) {
      notifier(
        `Impossible de charger les équipements : ${error.message}. Vérifie les politiques RLS de composants_catalogue.`,
        "error"
      );
    } else {
      setCatalogue(data || []);
    }

    setChargementCatalogue(false);
  }

  function notifier(texte, type = "success") {
    const id = `${Date.now()}-${Math.random()}`;

    setToasts((anciens) => [...anciens.slice(-3), { id, texte, type }]);

    setTimeout(
      () => setToasts((anciens) => anciens.filter((item) => item.id !== id)),
      type === "error" ? 7000 : 4000
    );
  }

  function fermerToast(id) {
    setToasts((anciens) => anciens.filter((item) => item.id !== id));
  }

  async function validerConfirmation() {
    const courante = confirmation;
    setConfirmation(null);

    if (courante?.onConfirm) await courante.onConfirm();
  }

  /* ---------- Navigation ---------- */

  function allerA(destination) {
    function naviguer() {
      if (vueKit === "editeur") fermerEditeur();
      setOnglet(destination);
      setMenuMobile(false);
      window.scrollTo({ top: 0 });
    }

    if (kitModifie) {
      setConfirmation({
        titre: "Quitter sans enregistrer ?",
        texte:
          "Les modifications du kit en cours seront perdues si tu changes de page.",
        action: "Quitter sans enregistrer",
        danger: true,
        onConfirm: naviguer,
      });
      return;
    }

    naviguer();
  }

  /* ---------- Éditeur de kit ---------- */

  function supprimerImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setImage(null);
    setImagePreview("");

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function retirerImage() {
    supprimerImage();
    setImageExistante("");
  }

  function traiterFichier(fichier) {
    if (!fichier) return;

    if (!TYPES_IMAGES_AUTORISES.includes(fichier.type)) {
      notifier("Format non autorisé. Utilise une image JPG, PNG ou WEBP.", "error");
      return;
    }

    if (fichier.size > TAILLE_MAX_IMAGE) {
      notifier("L'image ne doit pas dépasser 5 Mo.", "error");
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setImage(fichier);
    setImagePreview(URL.createObjectURL(fichier));
  }

  function handleImageChange(event) {
    traiterFichier(event.target.files?.[0]);
    event.target.value = "";
  }

  function ouvrirEditeur(produit = null) {
    supprimerImage();

    const composition = produit
      ? lireComposition(produit.composants).map((item) =>
          nouvelleLigne({
            nom: item.nom || "",
            quantite: Number(item.quantite) || 1,
            prix: Number(item.prix) || 0,
          })
        )
      : [];

    const manuel = produit
      ? Number(produit.prix) > 0 &&
        Number(produit.prix) !== totalLignes(composition)
      : false;

    const etat = {
      nom: produit?.nom || "",
      description: produit?.description || "",
      categorie: produit?.categorie || "",
      imageExistante: produit?.image_url || "",
      nouvelleImage: false,
      lignes: composition,
      prixManuelActif: manuel,
      prixManuel: manuel ? String(produit.prix) : "",
    };

    setKitId(produit?.id ?? null);
    setNom(etat.nom);
    setDescription(etat.description);
    setCategorie(etat.categorie);
    setImageExistante(etat.imageExistante);
    setLignes(etat.lignes);
    setDerniereLigneId(null);
    setPrixManuelActif(etat.prixManuelActif);
    setPrixManuel(etat.prixManuel);
    setRecherchePicker("");
    setFiltrePicker("tous");

    instantaneInitial.current = serialiserKit(etat);

    setOnglet("kits");
    setVueKit("editeur");
    setMenuMobile(false);

    window.scrollTo({ top: 0 });
  }

  function fermerEditeur() {
    supprimerImage();

    setKitId(null);
    setNom("");
    setDescription("");
    setCategorie("");
    setImageExistante("");
    setLignes([]);
    setDerniereLigneId(null);
    setPrixManuelActif(false);
    setPrixManuel("");
    setRecherchePicker("");
    setFiltrePicker("tous");
    setVueKit("liste");

    instantaneInitial.current = "";
  }

  function demanderFermetureEditeur() {
    if (!kitModifie) {
      fermerEditeur();
      return;
    }

    setConfirmation({
      titre: "Abandonner les modifications ?",
      texte: "Les changements apportés à ce kit ne seront pas enregistrés.",
      action: "Abandonner",
      danger: true,
      onConfirm: fermerEditeur,
    });
  }

  function ajouterDepuisBibliotheque(item) {
    setLignes((anciennes) => {
      const cle = item.nom.trim().toLowerCase();
      const index = anciennes.findIndex(
        (ligne) => ligne.nom.trim().toLowerCase() === cle
      );

      if (index >= 0) {
        return anciennes.map((ligne, i) =>
          i === index
            ? { ...ligne, quantite: (Number(ligne.quantite) || 0) + 1 }
            : ligne
        );
      }

      return [
        ...anciennes,
        nouvelleLigne({ nom: item.nom, prix: Number(item.prix) || 0 }),
      ];
    });
  }

  function ajouterLigneManuelle(nomInitial = "") {
    const ligne = nouvelleLigne({ nom: nomInitial });

    setLignes((anciennes) => [...anciennes, ligne]);
    setDerniereLigneId(ligne._id);
  }

  function modifierLigne(id, champLigne, valeur) {
    setLignes((anciennes) =>
      anciennes.map((ligne) => {
        if (ligne._id !== id) return ligne;

        if (champLigne === "nom") return { ...ligne, nom: valeur };

        if (valeur === "") return { ...ligne, [champLigne]: "" };

        const nombre = Math.max(0, Number(valeur) || 0);

        return {
          ...ligne,
          [champLigne]: champLigne === "quantite" ? Math.floor(nombre) : nombre,
        };
      })
    );
  }

  function changerQuantite(id, delta) {
    setLignes((anciennes) =>
      anciennes.map((ligne) =>
        ligne._id === id
          ? {
              ...ligne,
              quantite: Math.max(1, (Number(ligne.quantite) || 0) + delta),
            }
          : ligne
      )
    );
  }

  function retirerLigne(id) {
    setLignes((anciennes) => anciennes.filter((ligne) => ligne._id !== id));
  }

  function ajouterPremierResultat() {
    if (resultatsPicker.length > 0) {
      ajouterDepuisBibliotheque(resultatsPicker[0]);
      setRecherchePicker("");
    }
  }

  async function televerserImageKit() {
    if (!image) return imageExistante || "";

    const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";

    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("produits")
      .upload(filename, image, {
        cacheControl: "3600",
        upsert: false,
        contentType: image.type,
      });

    if (uploadError) {
      throw new Error(`Erreur d'envoi de l'image : ${uploadError.message}`);
    }

    const { data } = supabase.storage.from("produits").getPublicUrl(filename);

    return data?.publicUrl || "";
  }

  async function enregistrerKit(event) {
    event.preventDefault();

    if (!nom.trim()) {
      notifier("Saisis le nom du kit.", "error");
      return;
    }

    if (!categorie) {
      notifier("Choisis la catégorie du kit.", "error");
      return;
    }

    const composition = lignes
      .filter(
        (ligne) =>
          ligne.nom.trim() &&
          Number(ligne.quantite) > 0 &&
          Number(ligne.prix) >= 0
      )
      .map((ligne) => ({
        nom: ligne.nom.trim(),
        quantite: Number(ligne.quantite),
        prix: Number(ligne.prix),
      }));

    if (!composition.length) {
      notifier("Ajoute au moins un équipement au kit.", "error");
      return;
    }

    const total = composition.reduce(
      (somme, ligne) => somme + ligne.quantite * ligne.prix,
      0
    );

    const prixEnvoye = prixManuelActif ? Number(prixManuel) : total;

    if (!Number.isFinite(prixEnvoye) || prixEnvoye <= 0) {
      notifier("Le prix du kit doit être supérieur à 0 FCFA.", "error");
      return;
    }

    setChargement(true);

    try {
      const imageUrl = await televerserImageKit();

      const donnees = {
        nom: nom.trim(),
        description: description.trim(),
        prix: prixEnvoye,
        categorie,
        image_url: imageUrl,
        composants: composition,
      };

      let erreur;

      if (kitId) {
        const resultat = await supabase
          .from("produits")
          .update(donnees)
          .eq("id", kitId);

        erreur = resultat.error;
      } else {
        const resultat = await supabase.from("produits").insert(donnees);
        erreur = resultat.error;
      }

      if (erreur) throw erreur;

      notifier(kitId ? "Kit mis à jour." : "Kit créé.");

      fermerEditeur();
      await chargerProduits();
    } catch (error) {
      notifier(getErrorMessage(error), "error");
    } finally {
      setChargement(false);
    }
  }

  /* ---------- Actions sur les kits ---------- */

  async function dupliquerKit(produit) {
    setChargement(true);

    try {
      const { id, created_at, ...copie } = produit;

      const { data, error } = await supabase
        .from("produits")
        .insert({ ...copie, nom: `${produit.nom} - Copie` })
        .select()
        .single();

      if (error) throw error;

      await chargerProduits();
      ouvrirEditeur(data);
      notifier("Copie créée. Ajuste-la puis enregistre.");
    } catch (error) {
      notifier(getErrorMessage(error), "error");
    } finally {
      setChargement(false);
    }
  }

  function demanderSuppressionKit(produit) {
    setConfirmation({
      titre: "Supprimer ce kit ?",
      texte: `« ${produit.nom} » sera retiré définitivement du site. Cette action est irréversible.`,
      action: "Supprimer le kit",
      danger: true,
      onConfirm: () => supprimerKit(produit),
    });
  }

  async function supprimerKit(produit) {
    setChargement(true);

    try {
      const { error } = await supabase
        .from("produits")
        .delete()
        .eq("id", produit.id);

      if (error) throw error;

      setProduits((anciens) => anciens.filter((item) => item.id !== produit.id));
      notifier("Kit supprimé.");
    } catch (error) {
      notifier(getErrorMessage(error), "error");
    } finally {
      setChargement(false);
    }
  }

  /* ---------- Bibliothèque d'équipements ---------- */

  function ouvrirPanneauComposant(item = null) {
    setComposantId(item?.id ?? null);
    setNomComposant(item?.nom || "");
    setDescriptionComposant(item?.description || "");
    setCategorieComposant(item?.categorie || "autre");
    setReferenceComposant(item?.reference || "");
    setPrixComposant(String(item?.prix ?? 0));
    setImageUrlComposant(item?.image_url || "");
    setActifComposant(item ? Boolean(item.actif) : true);
    setPanneauComposant(true);
  }

  function fermerPanneauComposant() {
    setPanneauComposant(false);
    setComposantId(null);
  }

  async function handleSubmitComposant(event) {
    event.preventDefault();

    if (!nomComposant.trim()) {
      notifier("Saisis le nom de l'équipement.", "error");
      return;
    }

    const prix = Number(prixComposant);

    if (!Number.isFinite(prix) || prix < 0) {
      notifier("Le prix doit être un nombre positif ou nul.", "error");
      return;
    }

    setChargement(true);

    try {
      const donnees = {
        nom: nomComposant.trim(),
        description: descriptionComposant.trim(),
        categorie: categorieComposant,
        reference: referenceComposant.trim() || null,
        prix,
        image_url: imageUrlComposant.trim(),
        actif: actifComposant,
        updated_at: new Date().toISOString(),
      };

      let erreur;

      if (composantId) {
        const resultat = await supabase
          .from("composants_catalogue")
          .update(donnees)
          .eq("id", composantId);

        erreur = resultat.error;
      } else {
        const resultat = await supabase
          .from("composants_catalogue")
          .insert(donnees);

        erreur = resultat.error;
      }

      if (erreur) throw erreur;

      notifier(composantId ? "Équipement mis à jour." : "Équipement ajouté.");

      fermerPanneauComposant();
      await chargerCatalogue();
    } catch (error) {
      notifier(getErrorMessage(error), "error");
    } finally {
      setChargement(false);
    }
  }

  async function changerStatutComposant(item) {
    setBasculeId(item.id);

    try {
      const { error } = await supabase
        .from("composants_catalogue")
        .update({
          actif: !item.actif,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) throw error;

      notifier(item.actif ? "Équipement désactivé." : "Équipement réactivé.");
      await chargerCatalogue();
    } catch (error) {
      notifier(getErrorMessage(error), "error");
    } finally {
      setBasculeId(null);
    }
  }

  function demanderSuppressionComposant(item) {
    const utilisations =
      utilisationParNom.get(String(item.nom || "").trim().toLowerCase()) || 0;

    setConfirmation({
      titre: "Supprimer cet équipement ?",
      texte:
        utilisations > 0
          ? `« ${item.nom} » est utilisé dans ${utilisations} kit(s). Les kits conservent leur composition, mais l'équipement disparaît de la bibliothèque.`
          : `« ${item.nom} » sera supprimé définitivement de la bibliothèque.`,
      action: "Supprimer l'équipement",
      danger: true,
      onConfirm: () => supprimerComposant(item),
    });
  }

  async function supprimerComposant(item) {
    setChargement(true);

    try {
      const { error } = await supabase
        .from("composants_catalogue")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      notifier("Équipement supprimé.");
      await chargerCatalogue();
    } catch (error) {
      notifier(getErrorMessage(error), "error");
    } finally {
      setChargement(false);
    }
  }

  /* ---------- Session ---------- */

  async function handleLogout() {
    setDeconnexion(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setDeconnexion(false);
      notifier(`Erreur de déconnexion : ${error.message}`, "error");
      return;
    }

    window.location.href = "/admin/login";
  }

  /* ---------- Données d'affichage ---------- */

  const navigation = [
    { id: "dashboard", label: "Vue générale", icone: "dashboard" },
    {
      id: "kits",
      label: "Kits solaires",
      icone: "box",
      compteur: produits.length,
    },
    {
      id: "composants",
      label: "Équipements",
      icone: "layers",
      compteur: composantsActifs.length,
    },
  ];

  const titrePage = {
    dashboard: "Vue générale",
    kits:
      vueKit === "editeur"
        ? kitId
          ? "Modifier le kit"
          : "Nouveau kit"
        : "Kits solaires",
    composants: "Bibliothèque d'équipements",
  }[onglet];

  const prixManuelEcart =
    prixManuelActif && prixManuel !== ""
      ? Number(prixManuel) - totalCalcule
      : 0;

  /* ===========================================================
     RENDU
  =========================================================== */

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-100 text-slate-800 lg:pl-64">
        {/* BARRE LATÉRALE */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col bg-blue-950 text-blue-100 transition-transform duration-200 lg:translate-x-0 ${
            menuMobile ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label="Navigation de l'administration"
        >
          <div className="flex h-14 items-center gap-3 border-b border-white/10 px-5">
            <img
              src="/logo.png"
              alt=""
              className="h-8 w-8 rounded-lg bg-white object-contain p-1"
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">
                Solar <span className="text-orange-400">Smart</span>
              </p>
              <p className="text-xs text-blue-300">Administration</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const actif = onglet === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => allerA(item.id)}
                  aria-current={actif ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                    actif
                      ? "bg-white/10 text-white"
                      : "text-blue-200 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icone
                    nom={item.icone}
                    className={`h-[18px] w-[18px] ${
                      actif ? "text-orange-400" : ""
                    }`}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {typeof item.compteur === "number" && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs tabular-nums text-blue-100">
                      {item.compteur}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="space-y-1 border-t border-white/10 px-3 py-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-200 transition hover:bg-white/5 hover:text-white"
            >
              <Icone nom="external" className="h-[18px] w-[18px]" />
              Voir le site
            </a>

            <button
              type="button"
              onClick={handleLogout}
              disabled={deconnexion}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-200 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              <Icone nom="logout" className="h-[18px] w-[18px]" />
              {deconnexion ? "Déconnexion..." : "Se déconnecter"}
            </button>
          </div>
        </aside>

        {menuMobile && (
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMenuMobile(false)}
            className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          />
        )}

        {/* CONTENU */}
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMenuMobile(true)}
              aria-label="Ouvrir le menu"
              className={`${boutonIcone} lg:hidden`}
            >
              <Icone nom="menu" className="h-5 w-5" />
            </button>

            <h1 className="flex-1 truncate text-base font-semibold text-blue-950">
              {titrePage}
            </h1>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-950 sm:inline-flex"
            >
              Voir le site
              <Icone nom="external" className="h-3.5 w-3.5" />
            </a>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">
              {/* ================= VUE GÉNÉRALE ================= */}
              {onglet === "dashboard" && (
                <div className="space-y-6">
                  <div className="grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      {
                        label: "Kits en ligne",
                        valeur: produits.length,
                        aide: "Visibles sur le site",
                      },
                      {
                        label: "Équipements actifs",
                        valeur: composantsActifs.length,
                        aide: `${catalogue.length - composantsActifs.length} inactif(s)`,
                      },
                      {
                        label: "Prix moyen d'un kit",
                        valeur: formatPrix(prixMoyen),
                        aide: "Sur l'ensemble du catalogue",
                      },
                      {
                        label: "Kits à compléter",
                        valeur: kitsACompleter.length,
                        aide:
                          kitsACompleter.length > 0
                            ? "Image, description ou composition manquante"
                            : "Tout est renseigné",
                      },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white p-5">
                        <p className="text-sm text-slate-500">{stat.label}</p>
                        <p className="mt-2 break-words text-2xl font-semibold tabular-nums text-blue-950">
                          {stat.valeur}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {stat.aide}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => ouvrirEditeur()}
                      className={boutonPrincipal}
                    >
                      <Icone nom="plus" />
                      Nouveau kit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOnglet("composants");
                        ouvrirPanneauComposant();
                      }}
                      className={boutonSecondaire}
                    >
                      <Icone nom="plus" />
                      Nouvel équipement
                    </button>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <Panneau
                      titre="Derniers kits"
                      action={
                        <button
                          type="button"
                          onClick={() => allerA("kits")}
                          className="text-sm font-medium text-blue-700 hover:underline"
                        >
                          Voir tous les kits
                        </button>
                      }
                    >
                      {chargementProduits ? (
                        <LignesSquelette nombre={3} />
                      ) : produits.length === 0 ? (
                        <EtatVide
                          titre="Aucun kit pour l'instant"
                          texte="Crée ton premier kit pour l'afficher sur le site."
                        />
                      ) : (
                        <ul className="divide-y divide-slate-200">
                          {produits.slice(0, 5).map((produit) => (
                            <li
                              key={produit.id}
                              className="flex items-center gap-3 px-5 py-3"
                            >
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                                {produit.image_url ? (
                                  <img
                                    src={produit.image_url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Icone nom="image" className="h-4 w-4" />
                                )}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-blue-950">
                                  {produit.nom}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {categorieKitLabel(produit.categorie)}
                                </p>
                              </div>
                              <p className="shrink-0 text-sm font-semibold tabular-nums text-blue-950">
                                {formatPrix(produit.prix)}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Panneau>

                    <Panneau
                      titre="À compléter"
                      description="Kits dont la fiche est incomplète sur le site."
                    >
                      {chargementProduits ? (
                        <LignesSquelette nombre={3} />
                      ) : kitsACompleter.length === 0 ? (
                        <EtatVide
                          titre="Tous les kits sont complets"
                          texte="Chaque kit a une image, une description et une composition."
                        />
                      ) : (
                        <ul className="divide-y divide-slate-200">
                          {kitsACompleter.slice(0, 5).map(
                            ({ produit, problemes }) => (
                              <li
                                key={produit.id}
                                className="flex items-center gap-3 px-5 py-3"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-blue-950">
                                    {produit.nom}
                                  </p>
                                  <p className="text-xs text-amber-700">
                                    {problemes.join(", ")}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => ouvrirEditeur(produit)}
                                  className={boutonSecondaire}
                                >
                                  Compléter
                                </button>
                              </li>
                            )
                          )}
                        </ul>
                      )}
                    </Panneau>
                  </div>
                </div>
              )}

              {/* ================= KITS : LISTE ================= */}
              {onglet === "kits" && vueKit === "liste" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                      <Icone
                        nom="search"
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        value={rechercheKit}
                        onChange={(e) => setRechercheKit(e.target.value)}
                        className={`${champ} pl-9`}
                        placeholder="Rechercher un kit"
                        aria-label="Rechercher un kit"
                      />
                    </div>

                    <div
                      className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5"
                      role="group"
                      aria-label="Filtrer par catégorie"
                    >
                      {[
                        { value: "tous", court: "Tous" },
                        ...CATEGORIES_KITS,
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setFiltreKit(item.value)}
                          aria-pressed={filtreKit === item.value}
                          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                            filtreKit === item.value
                              ? "bg-blue-950 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {item.court}
                        </button>
                      ))}
                    </div>

                    <select
                      value={triKit}
                      onChange={(e) => setTriKit(e.target.value)}
                      className={`${champ} lg:w-48`}
                      aria-label="Trier les kits"
                    >
                      <option value="recent">Plus récents</option>
                      <option value="nom">Nom (A à Z)</option>
                      <option value="prix-asc">Prix croissant</option>
                      <option value="prix-desc">Prix décroissant</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => ouvrirEditeur()}
                      className={boutonPrincipal}
                    >
                      <Icone nom="plus" />
                      Nouveau kit
                    </button>
                  </div>

                  <Panneau>
                    <div className="hidden grid-cols-[minmax(0,2.2fr)_150px_110px_140px_120px] gap-4 border-b border-slate-200 px-5 py-3 text-xs font-medium text-slate-500 md:grid">
                      <span>Kit</span>
                      <span>Catégorie</span>
                      <span>Composition</span>
                      <span>Prix</span>
                      <span className="text-right">Actions</span>
                    </div>

                    {chargementProduits ? (
                      <LignesSquelette nombre={4} />
                    ) : produits.length === 0 ? (
                      <EtatVide
                        titre="Aucun kit pour l'instant"
                        texte="Un kit regroupe des équipements de la bibliothèque et s'affiche sur le site avec son prix."
                        action={
                          <button
                            type="button"
                            onClick={() => ouvrirEditeur()}
                            className={boutonPrincipal}
                          >
                            <Icone nom="plus" />
                            Créer le premier kit
                          </button>
                        }
                      />
                    ) : kitsFiltres.length === 0 ? (
                      <EtatVide
                        titre="Aucun kit ne correspond"
                        texte="Modifie la recherche ou le filtre de catégorie."
                      />
                    ) : (
                      <ul className="divide-y divide-slate-200">
                        {kitsFiltres.map((produit) => (
                          <li
                            key={produit.id}
                            className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,2.2fr)_150px_110px_140px_120px] md:items-center md:gap-4"
                          >
                            <button
                              type="button"
                              onClick={() => ouvrirEditeur(produit)}
                              className="flex min-w-0 items-center gap-3 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                            >
                              <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                                {produit.image_url ? (
                                  <img
                                    src={produit.image_url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Icone nom="image" className="h-5 w-5" />
                                )}
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold text-blue-950">
                                  {produit.nom}
                                </span>
                                <span className="block truncate text-xs text-slate-500">
                                  {produit.description || "Pas de description"}
                                </span>
                              </span>
                            </button>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 md:contents">
                              <div>
                                <Pastille ton="bleu">
                                  {categorieKitLabel(produit.categorie)}
                                </Pastille>
                              </div>
                              <p className="text-sm text-slate-600">
                                {lireComposition(produit.composants).length}{" "}
                                équipement(s)
                              </p>
                              <p className="text-sm font-semibold tabular-nums text-blue-950">
                                {formatPrix(produit.prix)}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 md:justify-end">
                              <button
                                type="button"
                                onClick={() => ouvrirEditeur(produit)}
                                className={boutonIcone}
                                aria-label={`Modifier ${produit.nom}`}
                                title="Modifier"
                              >
                                <Icone nom="edit" />
                              </button>
                              <button
                                type="button"
                                onClick={() => dupliquerKit(produit)}
                                disabled={chargement}
                                className={boutonIcone}
                                aria-label={`Dupliquer ${produit.nom}`}
                                title="Dupliquer"
                              >
                                <Icone nom="copy" />
                              </button>
                              <button
                                type="button"
                                onClick={() => demanderSuppressionKit(produit)}
                                disabled={chargement}
                                className={`${boutonIcone} hover:bg-red-50 hover:text-red-600`}
                                aria-label={`Supprimer ${produit.nom}`}
                                title="Supprimer"
                              >
                                <Icone nom="trash" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Panneau>

                  {!chargementProduits && produits.length > 0 && (
                    <p className="text-sm text-slate-500">
                      {kitsFiltres.length} kit(s) affiché(s) sur {produits.length}
                    </p>
                  )}
                </div>
              )}

              {/* ================= KITS : ÉDITEUR ================= */}
              {onglet === "kits" && vueKit === "editeur" && (
                <form
                  onSubmit={enregistrerKit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target.tagName === "INPUT") {
                      e.preventDefault();
                    }
                  }}
                  noValidate
                >
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={demanderFermetureEditeur}
                      className={boutonSecondaire}
                    >
                      <Icone nom="arrowLeft" />
                      Retour aux kits
                    </button>
                    <p className="text-sm text-slate-500">
                      {kitId
                        ? "Modifie les informations, la composition ou le prix."
                        : "Renseigne le kit, ajoute ses équipements puis enregistre."}
                    </p>
                  </div>

                  <div className="grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                    {/* Colonne gauche : informations et prix */}
                    <div className="space-y-6 xl:sticky xl:top-20">
                      <Panneau titre="Informations">
                        <div className="space-y-4 p-5">
                          <Champ label="Nom du kit" obligatoire htmlFor="kit-nom">
                            <input
                              id="kit-nom"
                              value={nom}
                              onChange={(e) => setNom(e.target.value)}
                              className={champ}
                              placeholder="Ex. Kit solaire maison 5 kVA"
                              disabled={chargement}
                              autoFocus={!kitId}
                            />
                          </Champ>

                          <Champ label="Catégorie" obligatoire>
                            <div
                              className="grid grid-cols-2 gap-2"
                              role="group"
                              aria-label="Catégorie du kit"
                            >
                              {CATEGORIES_KITS.map((item) => (
                                <button
                                  key={item.value}
                                  type="button"
                                  onClick={() => setCategorie(item.value)}
                                  aria-pressed={categorie === item.value}
                                  disabled={chargement}
                                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                                    categorie === item.value
                                      ? "border-blue-950 bg-blue-950 text-white"
                                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                  }`}
                                >
                                  {item.court}
                                </button>
                              ))}
                            </div>
                          </Champ>

                          <Champ
                            label="Description"
                            htmlFor="kit-description"
                            aide="Affichée sur la fiche du kit, dans le catalogue du site."
                          >
                            <textarea
                              id="kit-description"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              className={`${champ} resize-y`}
                              rows={4}
                              placeholder="Ce que fait le kit, pour quel besoin."
                              disabled={chargement}
                            />
                          </Champ>

                          <Champ label="Image du kit">
                            {imagePreview || imageExistante ? (
                              <div className="overflow-hidden rounded-lg border border-slate-200">
                                <img
                                  src={imagePreview || imageExistante}
                                  alt="Aperçu du kit"
                                  className="aspect-video w-full bg-slate-50 object-cover"
                                />
                                <div className="flex gap-2 border-t border-slate-200 p-2">
                                  <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={chargement}
                                    className={`${boutonSecondaire} flex-1`}
                                  >
                                    Remplacer
                                  </button>
                                  <button
                                    type="button"
                                    onClick={retirerImage}
                                    disabled={chargement}
                                    className={boutonDanger}
                                  >
                                    Retirer
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  traiterFichier(e.dataTransfer.files?.[0]);
                                }}
                                disabled={chargement}
                                className="flex w-full flex-col items-center gap-1 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-blue-500 hover:bg-blue-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                              >
                                <Icone
                                  nom="image"
                                  className="h-6 w-6 text-slate-400"
                                />
                                <span className="text-sm font-medium text-blue-950">
                                  Ajouter une image
                                </span>
                                <span className="text-xs text-slate-500">
                                  Glisse un fichier ici ou clique. JPG, PNG ou
                                  WEBP, 5 Mo maximum.
                                </span>
                              </button>
                            )}

                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleImageChange}
                              className="hidden"
                              disabled={chargement}
                            />
                          </Champ>
                        </div>
                      </Panneau>

                      <Panneau titre="Prix du kit">
                        <div className="space-y-4 p-5">
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-sm text-slate-500">
                              Somme des équipements
                            </span>
                            <span className="text-sm font-semibold tabular-nums text-blue-950">
                              {formatPrix(totalCalcule)}
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-4 border-t border-slate-200 pt-4">
                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                Fixer un prix de vente
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                Utile pour une remise, une marge ou un prix
                                arrondi.
                              </p>
                            </div>
                            <Interrupteur
                              actif={prixManuelActif}
                              onChange={() => {
                                setPrixManuelActif((valeur) => {
                                  if (!valeur && prixManuel === "") {
                                    setPrixManuel(String(totalCalcule || ""));
                                  }
                                  return !valeur;
                                });
                              }}
                              label="Fixer un prix de vente"
                              disabled={chargement}
                            />
                          </div>

                          {prixManuelActif && (
                            <Champ
                              label="Prix de vente (FCFA)"
                              htmlFor="kit-prix-manuel"
                              aide={
                                prixManuel !== "" && prixManuelEcart !== 0
                                  ? `${
                                      prixManuelEcart < 0
                                        ? "Remise"
                                        : "Supplément"
                                    } de ${formatPrix(
                                      Math.abs(prixManuelEcart)
                                    )} par rapport à la somme des équipements.`
                                  : undefined
                              }
                            >
                              <input
                                id="kit-prix-manuel"
                                type="number"
                                min="0"
                                step="1"
                                value={prixManuel}
                                onChange={(e) => setPrixManuel(e.target.value)}
                                className={champ}
                                disabled={chargement}
                              />
                            </Champ>
                          )}
                        </div>
                      </Panneau>
                    </div>

                    {/* Colonne droite : bibliothèque et composition */}
                    <div className="min-w-0 space-y-6">
                      <Panneau
                        titre="Ajouter depuis la bibliothèque"
                        description="Clique sur un équipement pour l'ajouter. Un deuxième clic augmente la quantité."
                      >
                        <div className="space-y-3 p-5">
                          <div className="relative">
                            <Icone
                              nom="search"
                              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              value={recherchePicker}
                              onChange={(e) => setRecherchePicker(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  ajouterPremierResultat();
                                }
                              }}
                              className={`${champ} pl-9`}
                              placeholder="Rechercher un équipement (Entrée pour ajouter le premier résultat)"
                              aria-label="Rechercher dans la bibliothèque"
                              disabled={chargement}
                            />
                          </div>

                          {categoriesPicker.length > 1 && (
                            <div className="flex flex-wrap gap-2">
                              {[
                                { value: "tous", label: "Tous" },
                                ...categoriesPicker,
                              ].map((item) => (
                                <button
                                  key={item.value}
                                  type="button"
                                  onClick={() => setFiltrePicker(item.value)}
                                  aria-pressed={filtrePicker === item.value}
                                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                    filtrePicker === item.value
                                      ? "border-blue-950 bg-blue-950 text-white"
                                      : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          )}

                          {chargementCatalogue ? (
                            <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
                          ) : composantsActifs.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                              <p className="text-sm text-slate-600">
                                La bibliothèque est vide. Ajoute d'abord tes
                                équipements pour les réutiliser dans les kits.
                              </p>
                              <button
                                type="button"
                                onClick={() => allerA("composants")}
                                className={`${boutonSecondaire} mt-3`}
                              >
                                Ouvrir la bibliothèque
                              </button>
                            </div>
                          ) : resultatsPicker.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                              <p className="text-sm text-slate-600">
                                Aucun équipement ne correspond à cette
                                recherche.
                              </p>
                              {recherchePicker.trim() && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    ajouterLigneManuelle(recherchePicker.trim());
                                    setRecherchePicker("");
                                  }}
                                  className={`${boutonSecondaire} mt-3`}
                                >
                                  Ajouter « {recherchePicker.trim()} » comme
                                  ligne manuelle
                                </button>
                              )}
                            </div>
                          ) : (
                            <ul className="max-h-72 divide-y divide-slate-200 overflow-y-auto rounded-lg border border-slate-200">
                              {resultatsPicker.map((item) => {
                                const dansLeKit =
                                  quantiteParNom.get(
                                    item.nom.trim().toLowerCase()
                                  ) || 0;

                                return (
                                  <li key={item.id}>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        ajouterDepuisBibliotheque(item)
                                      }
                                      disabled={chargement}
                                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-blue-50/60 focus:outline-none focus-visible:bg-blue-50 disabled:opacity-50"
                                    >
                                      <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium text-blue-950">
                                          {item.nom}
                                        </span>
                                        <span className="block truncate text-xs text-slate-500">
                                          {categorieComposantLabel(
                                            item.categorie
                                          )}
                                          {item.reference
                                            ? ` · Réf. ${item.reference}`
                                            : ""}
                                        </span>
                                      </span>

                                      {dansLeKit > 0 && (
                                        <Pastille ton="vert">
                                          Dans le kit : {dansLeKit}
                                        </Pastille>
                                      )}

                                      <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700">
                                        {formatPrix(item.prix)}
                                      </span>

                                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                                        <Icone nom="plus" className="h-4 w-4" />
                                      </span>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </Panneau>

                      <Panneau
                        titre="Composition du kit"
                        description={`${nombreEquipements} équipement(s)`}
                        action={
                          <button
                            type="button"
                            onClick={() => ajouterLigneManuelle()}
                            disabled={chargement}
                            className={boutonSecondaire}
                          >
                            <Icone nom="plus" />
                            Ligne manuelle
                          </button>
                        }
                      >
                        {lignes.length === 0 ? (
                          <EtatVide
                            titre="Le kit est vide"
                            texte="Choisis des équipements dans la bibliothèque ci-dessus, ou ajoute une ligne manuelle."
                          />
                        ) : (
                          <div>
                            <div className="hidden grid-cols-[minmax(0,1fr)_132px_130px_130px_40px] gap-3 border-b border-slate-200 px-5 py-3 text-xs font-medium text-slate-500 md:grid">
                              <span>Équipement</span>
                              <span>Quantité</span>
                              <span>Prix unitaire</span>
                              <span className="text-right">Sous-total</span>
                              <span />
                            </div>

                            <ul className="divide-y divide-slate-200">
                              {lignes.map((ligne) => (
                                <li
                                  key={ligne._id}
                                  className="grid grid-cols-2 gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_132px_130px_130px_40px] md:items-center"
                                >
                                  <div className="col-span-2 md:col-span-1">
                                    <label className="mb-1 block text-xs text-slate-500 md:hidden">
                                      Équipement
                                    </label>
                                    <input
                                      value={ligne.nom}
                                      onChange={(e) =>
                                        modifierLigne(
                                          ligne._id,
                                          "nom",
                                          e.target.value
                                        )
                                      }
                                      className={champ}
                                      placeholder="Nom de l'équipement"
                                      aria-label="Nom de l'équipement"
                                      disabled={chargement}
                                      autoFocus={ligne._id === derniereLigneId}
                                    />
                                  </div>

                                  <div>
                                    <label className="mb-1 block text-xs text-slate-500 md:hidden">
                                      Quantité
                                    </label>
                                    <div className="flex items-center">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          changerQuantite(ligne._id, -1)
                                        }
                                        disabled={
                                          chargement ||
                                          (Number(ligne.quantite) || 0) <= 1
                                        }
                                        className="flex h-10 w-9 shrink-0 items-center justify-center rounded-l-lg border border-r-0 border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                                        aria-label="Diminuer la quantité"
                                      >
                                        <Icone
                                          nom="minus"
                                          className="h-3.5 w-3.5"
                                        />
                                      </button>
                                      <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={ligne.quantite}
                                        onChange={(e) =>
                                          modifierLigne(
                                            ligne._id,
                                            "quantite",
                                            e.target.value
                                          )
                                        }
                                        className="h-10 w-full min-w-0 border border-slate-300 bg-white px-1 text-center text-sm tabular-nums text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                                        aria-label="Quantité"
                                        disabled={chargement}
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          changerQuantite(ligne._id, 1)
                                        }
                                        disabled={chargement}
                                        className="flex h-10 w-9 shrink-0 items-center justify-center rounded-r-lg border border-l-0 border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                                        aria-label="Augmenter la quantité"
                                      >
                                        <Icone
                                          nom="plus"
                                          className="h-3.5 w-3.5"
                                        />
                                      </button>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="mb-1 block text-xs text-slate-500 md:hidden">
                                      Prix unitaire
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      step="1"
                                      value={ligne.prix}
                                      onChange={(e) =>
                                        modifierLigne(
                                          ligne._id,
                                          "prix",
                                          e.target.value
                                        )
                                      }
                                      className={`${champ} tabular-nums`}
                                      aria-label="Prix unitaire"
                                      disabled={chargement}
                                    />
                                  </div>

                                  <div className="md:text-right">
                                    <p className="mb-1 text-xs text-slate-500 md:hidden">
                                      Sous-total
                                    </p>
                                    <p className="text-sm font-semibold tabular-nums text-blue-950">
                                      {formatPrix(
                                        (Number(ligne.quantite) || 0) *
                                          (Number(ligne.prix) || 0)
                                      )}
                                    </p>
                                  </div>

                                  <div className="flex justify-end md:justify-center">
                                    <button
                                      type="button"
                                      onClick={() => retirerLigne(ligne._id)}
                                      disabled={chargement}
                                      className={`${boutonIcone} hover:bg-red-50 hover:text-red-600`}
                                      aria-label="Retirer cet équipement"
                                      title="Retirer"
                                    >
                                      <Icone nom="trash" />
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>

                            <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3">
                              <span className="text-sm text-slate-600">
                                Total des équipements
                              </span>
                              <span className="text-sm font-semibold tabular-nums text-blue-950">
                                {formatPrix(totalCalcule)}
                              </span>
                            </div>
                          </div>
                        )}
                      </Panneau>
                    </div>
                  </div>

                  {/* Barre d'enregistrement */}
                  <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">
                          Prix du kit{prixManuelActif ? " (fixé manuellement)" : ""}
                        </p>
                        <p className="text-xl font-semibold tabular-nums text-blue-950">
                          {formatPrix(prixFinal)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {kitModifie && (
                          <span className="text-xs font-medium text-amber-700">
                            Modifications non enregistrées
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={demanderFermetureEditeur}
                          disabled={chargement}
                          className={boutonSecondaire}
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={chargement}
                          className={boutonPrincipal}
                        >
                          {chargement
                            ? "Enregistrement..."
                            : kitId
                              ? "Enregistrer les modifications"
                              : "Créer le kit"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* ================= ÉQUIPEMENTS ================= */}
              {onglet === "composants" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                      <Icone
                        nom="search"
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        value={rechercheComposant}
                        onChange={(e) => setRechercheComposant(e.target.value)}
                        className={`${champ} pl-9`}
                        placeholder="Rechercher par nom, référence ou description"
                        aria-label="Rechercher un équipement"
                      />
                    </div>

                    <select
                      value={filtreComposant}
                      onChange={(e) => setFiltreComposant(e.target.value)}
                      className={`${champ} lg:w-56`}
                      aria-label="Filtrer par catégorie"
                    >
                      <option value="tous">Toutes les catégories</option>
                      {CATEGORIES_COMPOSANTS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>

                    <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-slate-600">
                      <Interrupteur
                        actif={afficherInactifs}
                        onChange={() => setAfficherInactifs((valeur) => !valeur)}
                        label="Afficher les équipements inactifs"
                      />
                      Afficher les inactifs
                    </label>

                    <button
                      type="button"
                      onClick={() => ouvrirPanneauComposant()}
                      className={boutonPrincipal}
                    >
                      <Icone nom="plus" />
                      Nouvel équipement
                    </button>
                  </div>

                  <Panneau>
                    <div className="hidden grid-cols-[minmax(0,2fr)_170px_130px_120px_88px] gap-4 border-b border-slate-200 px-5 py-3 text-xs font-medium text-slate-500 md:grid">
                      <span>Équipement</span>
                      <span>Catégorie</span>
                      <span>Prix unitaire</span>
                      <span>Statut</span>
                      <span className="text-right">Actions</span>
                    </div>

                    {chargementCatalogue ? (
                      <LignesSquelette nombre={5} />
                    ) : catalogue.length === 0 ? (
                      <EtatVide
                        titre="La bibliothèque est vide"
                        texte="Ajoute tes panneaux, batteries, onduleurs et autres équipements une seule fois, puis réutilise-les dans tous tes kits."
                        action={
                          <button
                            type="button"
                            onClick={() => ouvrirPanneauComposant()}
                            className={boutonPrincipal}
                          >
                            <Icone nom="plus" />
                            Ajouter le premier équipement
                          </button>
                        }
                      />
                    ) : composantsFiltres.length === 0 ? (
                      <EtatVide
                        titre="Aucun équipement ne correspond"
                        texte="Modifie la recherche, la catégorie, ou affiche aussi les équipements inactifs."
                      />
                    ) : (
                      <ul className="divide-y divide-slate-200">
                        {composantsFiltres.map((item) => {
                          const utilisations =
                            utilisationParNom.get(
                              String(item.nom || "").trim().toLowerCase()
                            ) || 0;

                          return (
                            <li
                              key={item.id}
                              className={`grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,2fr)_170px_130px_120px_88px] md:items-center md:gap-4 ${
                                item.actif ? "" : "bg-slate-50"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => ouvrirPanneauComposant(item)}
                                className="flex min-w-0 items-center gap-3 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                              >
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                                  {item.image_url ? (
                                    <img
                                      src={item.image_url}
                                      alt=""
                                      className="h-full w-full object-contain p-1"
                                    />
                                  ) : (
                                    <Icone nom="layers" className="h-5 w-5" />
                                  )}
                                </span>
                                <span className="min-w-0">
                                  <span
                                    className={`block truncate text-sm font-semibold ${
                                      item.actif
                                        ? "text-blue-950"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    {item.nom}
                                  </span>
                                  <span className="block truncate text-xs text-slate-500">
                                    {item.reference
                                      ? `Réf. ${item.reference}`
                                      : "Sans référence"}
                                    {utilisations > 0
                                      ? ` · Dans ${utilisations} kit(s)`
                                      : ""}
                                  </span>
                                </span>
                              </button>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:contents">
                                <div>
                                  <Pastille>
                                    {categorieComposantLabel(item.categorie)}
                                  </Pastille>
                                </div>

                                <p className="text-sm font-semibold tabular-nums text-blue-950">
                                  {formatPrix(item.prix)}
                                </p>

                                <div className="flex items-center gap-2">
                                  <Interrupteur
                                    actif={Boolean(item.actif)}
                                    onChange={() => changerStatutComposant(item)}
                                    label={
                                      item.actif
                                        ? `Désactiver ${item.nom}`
                                        : `Réactiver ${item.nom}`
                                    }
                                    disabled={basculeId === item.id}
                                  />
                                  <span className="text-xs text-slate-600">
                                    {item.actif ? "Actif" : "Inactif"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 md:justify-end">
                                <button
                                  type="button"
                                  onClick={() => ouvrirPanneauComposant(item)}
                                  className={boutonIcone}
                                  aria-label={`Modifier ${item.nom}`}
                                  title="Modifier"
                                >
                                  <Icone nom="edit" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    demanderSuppressionComposant(item)
                                  }
                                  disabled={chargement}
                                  className={`${boutonIcone} hover:bg-red-50 hover:text-red-600`}
                                  aria-label={`Supprimer ${item.nom}`}
                                  title="Supprimer"
                                >
                                  <Icone nom="trash" />
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </Panneau>

                  {!chargementCatalogue && catalogue.length > 0 && (
                    <p className="text-sm text-slate-500">
                      {composantsFiltres.length} équipement(s) affiché(s) sur{" "}
                      {catalogue.length}. Les kits déjà créés gardent leur
                      composition même si tu modifies un équipement ici.
                    </p>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>

        {/* PANNEAU LATÉRAL : ÉQUIPEMENT */}
        {panneauComposant && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <button
              type="button"
              aria-label="Fermer le panneau"
              onClick={fermerPanneauComposant}
              className="absolute inset-0 bg-slate-950/50"
            />

            <form
              onSubmit={handleSubmitComposant}
              noValidate
              role="dialog"
              aria-modal="true"
              aria-label={
                composantId ? "Modifier l'équipement" : "Nouvel équipement"
              }
              className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-blue-950">
                    {composantId ? "Modifier l'équipement" : "Nouvel équipement"}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Réutilisable dans tous les kits.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fermerPanneauComposant}
                  className={boutonIcone}
                  aria-label="Fermer"
                >
                  <Icone nom="close" className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                <Champ label="Nom" obligatoire htmlFor="composant-nom">
                  <input
                    id="composant-nom"
                    value={nomComposant}
                    onChange={(e) => setNomComposant(e.target.value)}
                    className={champ}
                    placeholder="Ex. Panneau solaire Jinko 620 W"
                    disabled={chargement}
                    autoFocus
                  />
                </Champ>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Champ label="Catégorie" htmlFor="composant-categorie">
                    <select
                      id="composant-categorie"
                      value={categorieComposant}
                      onChange={(e) => setCategorieComposant(e.target.value)}
                      className={champ}
                      disabled={chargement}
                    >
                      {CATEGORIES_COMPOSANTS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </Champ>

                  <Champ label="Référence" htmlFor="composant-reference">
                    <input
                      id="composant-reference"
                      value={referenceComposant}
                      onChange={(e) => setReferenceComposant(e.target.value)}
                      className={champ}
                      placeholder="Ex. PAN-620W"
                      disabled={chargement}
                    />
                  </Champ>
                </div>

                <Champ
                  label="Prix unitaire (FCFA)"
                  obligatoire
                  htmlFor="composant-prix"
                >
                  <input
                    id="composant-prix"
                    type="number"
                    min="0"
                    step="1"
                    value={prixComposant}
                    onChange={(e) => setPrixComposant(e.target.value)}
                    className={`${champ} tabular-nums`}
                    disabled={chargement}
                  />
                </Champ>

                <Champ label="Description" htmlFor="composant-description">
                  <textarea
                    id="composant-description"
                    value={descriptionComposant}
                    onChange={(e) => setDescriptionComposant(e.target.value)}
                    className={`${champ} resize-y`}
                    rows={3}
                    placeholder="Puissance, capacité, caractéristiques"
                    disabled={chargement}
                  />
                </Champ>

                <Champ
                  label="Adresse de l'image"
                  htmlFor="composant-image"
                  aide="Facultatif. Colle l'adresse d'une image publique."
                >
                  <input
                    id="composant-image"
                    type="url"
                    value={imageUrlComposant}
                    onChange={(e) => setImageUrlComposant(e.target.value)}
                    className={champ}
                    placeholder="https://"
                    disabled={chargement}
                  />
                </Champ>

                {imageUrlComposant && (
                  <img
                    src={imageUrlComposant}
                    alt="Aperçu de l'équipement"
                    className="max-h-44 w-full rounded-lg border border-slate-200 bg-slate-50 object-contain"
                  />
                )}

                <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Équipement actif
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Seuls les équipements actifs apparaissent dans la
                      bibliothèque de l'éditeur de kit.
                    </p>
                  </div>
                  <Interrupteur
                    actif={actifComposant}
                    onChange={() => setActifComposant((valeur) => !valeur)}
                    label="Équipement actif"
                    disabled={chargement}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
                <button
                  type="button"
                  onClick={fermerPanneauComposant}
                  disabled={chargement}
                  className={boutonSecondaire}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={chargement}
                  className={boutonPrincipal}
                >
                  {chargement
                    ? "Enregistrement..."
                    : composantId
                      ? "Enregistrer les modifications"
                      : "Ajouter l'équipement"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* CONFIRMATION */}
        {confirmation && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Annuler"
              onClick={() => setConfirmation(null)}
              className="absolute inset-0 bg-slate-950/50"
            />

            <div
              role="alertdialog"
              aria-modal="true"
              aria-label={confirmation.titre}
              className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            >
              <h2 className="text-base font-semibold text-blue-950">
                {confirmation.titre}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {confirmation.texte}
              </p>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmation(null)}
                  className={boutonSecondaire}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={validerConfirmation}
                  autoFocus
                  className={
                    confirmation.danger
                      ? "inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      : boutonPrincipal
                  }
                >
                  {confirmation.action}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        <div
          className="pointer-events-none fixed right-4 top-16 z-[80] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
          role="status"
          aria-live="polite"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-lg border bg-white p-3 pl-4 shadow-lg ${
                toast.type === "error"
                  ? "border-red-200"
                  : "border-green-200"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${
                  toast.type === "error" ? "bg-red-600" : "bg-green-600"
                }`}
              >
                <Icone
                  nom={toast.type === "error" ? "close" : "check"}
                  className="h-3 w-3"
                />
              </span>
              <p className="flex-1 text-sm text-slate-700">{toast.texte}</p>
              <button
                type="button"
                onClick={() => fermerToast(toast.id)}
                className="text-slate-400 transition hover:text-slate-700"
                aria-label="Fermer la notification"
              >
                <Icone nom="close" className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminGuard>
  );
}