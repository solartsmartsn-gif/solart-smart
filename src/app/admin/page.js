"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/AdminGuard";

const COMPOSANT_VIDE = {
  nom: "",
  quantite: 1,
  prix: 0,
};

const APPAREIL_VIDE = {
  nom: "",
  puissance: 0,
  quantite: 1,
  heures: 1,
};

const TYPES_IMAGES_AUTORISES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const inputStyle =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100";

/* ============================================================
   TYPES D'INSTALLATION
============================================================ */

const INSTALLATIONS = {
  residentiel: {
    label: "Résidentiel",
    icon: "🏠",
    description: "Maison, appartement, villa",
  },

  commercial: {
    label: "Commercial",
    icon: "🏪",
    description: "Boutique, magasin, bureau",
  },

  industriel: {
    label: "Industriel",
    icon: "🏭",
    description: "Atelier, usine, production",
  },
};

/* ============================================================
   APPAREILS PAR TYPE D'INSTALLATION
============================================================ */

const APPAREILS = {
  residentiel: [
    ["Lampe LED", 10],
    ["Télévision LED", 100],
    ["Ventilateur", 60],
    ["Réfrigérateur", 150],
    ["Congélateur", 180],
    ["Climatiseur", 1200],
    ["Ordinateur portable", 65],
    ["Routeur Wi-Fi", 12],
    ["Machine à laver", 500],
    ["Fer à repasser", 1200],
    ["Micro-ondes", 1200],
    ["Pompe à eau", 750],
    ["Bouilloire", 1500],
    ["Ventilateur plafond", 75],
    ["Chargeur téléphone", 10],
  ],

  commercial: [
    ["Éclairage LED commercial", 20],
    ["Télévision", 120],
    ["Climatiseur", 1500],
    ["Réfrigérateur commercial", 300],
    ["Congélateur commercial", 350],
    ["Vitrine réfrigérée", 800],
    ["Ordinateur", 150],
    ["Imprimante", 500],
    ["Caisse / POS", 80],
    ["Routeur", 20],
    ["Enseigne lumineuse", 200],
    ["Machine à café", 1500],
    ["Micro-ondes", 1500],
    ["Pompe à eau", 1000],
    ["Chambre froide", 2500],
    ["Ventilateur industriel", 250],
  ],

  industriel: [
    ["Éclairage industriel LED", 100],
    ["Moteur électrique", 3000],
    ["Pompe industrielle", 5000],
    ["Compresseur", 5000],
    ["Machine de production", 7500],
    ["Machine-outil", 5000],
    ["Poste à souder", 5000],
    ["Convoyeur", 3000],
    ["Ventilateur industriel", 750],
    ["Climatisation industrielle", 5000],
    ["Groupe frigorifique", 7500],
    ["Chambre froide industrielle", 10000],
    ["Tour industriel", 7500],
    ["Machine CNC", 10000],
  ],
};

/* ============================================================
   TARIFS SENELEC
============================================================ */

const TARIFS = {
  DPP: {
    label: "DPP — Domestique Petite Puissance",
    tranches: [
      [150, 82],
      [250, 136.49],
      [Infinity, 159.36],
    ],

    woyofal: [
      [150, 82],
      [250, 136.49],
      [Infinity, 136.49],
    ],
  },

  DMP: {
    label: "DMP — Domestique Moyenne Puissance",
    tranches: [
      [50, 111.23],
      [300, 143.54],
      [Infinity, 158.46],
    ],

    woyofal: [
      [50, 111.23],
      [300, 143.54],
      [Infinity, 143.54],
    ],
  },

  PPP: {
    label: "PPP — Professionnel Petite Puissance",
    tranches: [
      [50, 147.43],
      [500, 189.84],
      [Infinity, 208.63],
    ],

    woyofal: [
      [50, 147.43],
      [500, 189.84],
      [Infinity, 189.84],
    ],
  },

  PMP: {
    label: "PMP — Professionnel Moyenne Puissance",
    tranches: [
      [100, 165.01],
      [500, 191.01],
      [Infinity, 210.81],
    ],

    woyofal: [
      [100, 165.01],
      [500, 191.01],
      [Infinity, 191.01],
    ],
  },

  DGP: {
    label: "DGP — Domestique Grande Puissance",
    grandePuissance: true,
    horsPointe: 118.37,
    pointe: 170.53,
    fixe: 956.13,
  },

  PGP: {
    label: "PGP — Professionnel Grande Puissance",
    grandePuissance: true,
    horsPointe: 140.74,
    pointe: 232.23,
    fixe: 2868.39,
  },
};

/* ============================================================
   FONCTIONS UTILITAIRES
============================================================ */

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error?.message) {
    return error.message;
  }

  return "Une erreur inconnue est survenue.";
}

function formatPrix(value) {
  return `${Number(value || 0).toLocaleString("fr-FR", {
    maximumFractionDigits: 0,
  })} FCFA`;
}

function formatKwh(value) {
  return Number(value || 0).toLocaleString("fr-FR", {
    maximumFractionDigits: 2,
  });
}

/* ============================================================
   CALCUL TARIFAIRE
============================================================ */

function calculerCoutProgressif(kwh, tranches) {
  let restant = Math.max(0, Number(kwh) || 0);
  let precedent = 0;
  let total = 0;

  for (const [limite, prix] of tranches) {
    if (restant <= 0) {
      break;
    }

    const largeur =
      limite === Infinity
        ? restant
        : limite - precedent;

    const energie = Math.min(restant, largeur);

    total += energie * prix;

    restant -= energie;

    if (limite !== Infinity) {
      precedent = limite;
    }
  }

  return total;
}

function calculerDetailsTranches(kwh, tranches) {
  const details = [];

  let restant = Math.max(0, Number(kwh) || 0);
  let precedent = 0;

  tranches.forEach(([limite, prix], index) => {
    if (restant <= 0) {
      return;
    }

    const largeur =
      limite === Infinity
        ? restant
        : limite - precedent;

    const energie = Math.min(restant, largeur);

    if (energie > 0) {
      details.push({
        index: index + 1,
        energie,
        prix,
        total: energie * prix,
      });
    }

    restant -= energie;

    if (limite !== Infinity) {
      precedent = limite;
    }
  });

  return details;
}

/* ============================================================
   PAGE
============================================================ */

export default function EstimationPage() {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [categorie, setCategorie] = useState("");

  const [typeInstallation, setTypeInstallation] =
    useState("residentiel");

  const [profilTarifaire, setProfilTarifaire] =
    useState("DPP");

  const [modeTarif, setModeTarif] =
    useState("standard");

  const [appareils, setAppareils] = useState([
    {
      nom: "Lampe LED",
      puissance: 10,
      quantite: 5,
      heures: 5,
    },
  ]);

  const [composants, setComposants] = useState([
    { ...COMPOSANT_VIDE },
  ]);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [produits, setProduits] = useState([]);

  const [chargement, setChargement] =
    useState(false);

  const [chargementProduits, setChargementProduits] =
    useState(true);

  const [message, setMessage] = useState("");
  const [typeMessage, setTypeMessage] =
    useState("");

  const [recherche, setRecherche] =
    useState("");

  const [filtreCategorie, setFiltreCategorie] =
    useState("toutes");

  const [suppressionId, setSuppressionId] =
    useState(null);

  const [deconnexion, setDeconnexion] =
    useState(false);

  const fileInputRef = useRef(null);

  /* ============================================================
     CHARGEMENT PRODUITS
  ============================================================ */

  async function fetchProduits() {
    setChargementProduits(true);

    const { data, error } = await supabase
      .from("produits")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      setProduits([]);

      setMessage(
        `Erreur lors du chargement : ${error.message}`
      );

      setTypeMessage("error");
    } else {
      setProduits(data || []);
    }

    setChargementProduits(false);
  }

  useEffect(() => {
    fetchProduits();
  }, []);

  /* ============================================================
     CALCUL CONSOMMATION
  ============================================================ */

  const consommationJour = useMemo(() => {
    return appareils.reduce((total, appareil) => {
      const puissance =
        Number(appareil.puissance) || 0;

      const quantite =
        Number(appareil.quantite) || 0;

      const heures =
        Number(appareil.heures) || 0;

      return (
        total +
        (puissance * quantite * heures) / 1000
      );
    }, 0);
  }, [appareils]);

  const consommationMois =
    consommationJour * 30;

  /* ============================================================
     TARIF
  ============================================================ */

  const tarif = TARIFS[profilTarifaire];

  const tranches = tarif?.grandePuissance
    ? []
    : modeTarif === "woyofal"
      ? tarif?.woyofal || []
      : tarif?.tranches || [];

  const coutSenelec = useMemo(() => {
    if (!tarif) {
      return 0;
    }

    if (tarif.grandePuissance) {
      return (
        consommationMois *
        tarif.horsPointe
      );
    }

    return calculerCoutProgressif(
      consommationMois,
      tranches
    );
  }, [
    tarif,
    consommationMois,
    tranches,
  ]);

  const detailsTranches = useMemo(() => {
    return calculerDetailsTranches(
      consommationMois,
      tranches
    );
  }, [
    consommationMois,
    tranches,
  ]);

  /* ============================================================
     PRIX DU KIT
  ============================================================ */

  const totalKit = useMemo(() => {
    return composants.reduce(
      (total, composant) => {
        return (
          total +
          (Number(composant.quantite) || 0) *
            (Number(composant.prix) || 0)
        );
      },
      0
    );
  }, [composants]);

  /* ============================================================
     PRODUITS FILTRÉS
  ============================================================ */

  const produitsFiltres = useMemo(() => {
    const terme =
      recherche.trim().toLowerCase();

    return produits.filter((produit) => {
      const okRecherche =
        !terme ||
        produit.nom
          ?.toLowerCase()
          .includes(terme) ||
        produit.description
          ?.toLowerCase()
          .includes(terme);

      const okCategorie =
        filtreCategorie === "toutes" ||
        produit.categorie ===
          filtreCategorie;

      return (
        okRecherche &&
        okCategorie
      );
    });
  }, [
    produits,
    recherche,
    filtreCategorie,
  ]);

  /* ============================================================
     STATISTIQUES
  ============================================================ */

  const statistiques = useMemo(() => {
    return {
      total: produits.length,

      maison: produits.filter(
        (p) =>
          p.categorie ===
          "kit-complet-maison"
      ).length,

      pompage: produits.filter(
        (p) =>
          p.categorie ===
          "kit-complet-pompage"
      ).length,
    };
  }, [produits]);

  /* ============================================================
     TYPE INSTALLATION
  ============================================================ */

  function changerTypeInstallation(type) {
    setTypeInstallation(type);

    const premierAppareil =
      APPAREILS[type]?.[0];

    if (premierAppareil) {
      setAppareils([
        {
          nom: premierAppareil[0],
          puissance: premierAppareil[1],
          quantite: 1,
          heures: 1,
        },
      ]);
    }

    if (type === "residentiel") {
      setProfilTarifaire("DPP");
    } else {
      setProfilTarifaire("PPP");
    }
  }

  /* ============================================================
     APPAREILS
  ============================================================ */

  function updateAppareil(
    index,
    champ,
    valeur
  ) {
    setAppareils((anciens) =>
      anciens.map((appareil, i) => {
        if (i !== index) {
          return appareil;
        }

        if (champ === "nom") {
          return {
            ...appareil,
            nom: valeur,
          };
        }

        return {
          ...appareil,
          [champ]: Math.max(
            0,
            Number(valeur) || 0
          ),
        };
      })
    );
  }

  function ajouterAppareil() {
    setAppareils((anciens) => [
      ...anciens,
      { ...APPAREIL_VIDE },
    ]);
  }

  function supprimerAppareil(index) {
    setAppareils((anciens) => {
      if (anciens.length === 1) {
        return [{ ...APPAREIL_VIDE }];
      }

      return anciens.filter(
        (_, i) => i !== index
      );
    });
  }

  function ajouterAppareilPreset(nomAppareil) {
    const preset =
      APPAREILS[typeInstallation]?.find(
        (appareil) =>
          appareil[0] === nomAppareil
      );

    if (!preset) {
      return;
    }

    setAppareils((anciens) => [
      ...anciens,
      {
        nom: preset[0],
        puissance: preset[1],
        quantite: 1,
        heures: 1,
      },
    ]);
  }

  /* ============================================================
     COMPOSANTS
  ============================================================ */

  function updateComposant(
    index,
    champ,
    valeur
  ) {
    setComposants((anciens) =>
      anciens.map((composant, i) => {
        if (i !== index) {
          return composant;
        }

        if (champ === "nom") {
          return {
            ...composant,
            nom: valeur,
          };
        }

        return {
          ...composant,
          [champ]: Math.max(
            0,
            Number(valeur) || 0
          ),
        };
      })
    );
  }

  function ajouterComposant() {
    setComposants((anciens) => [
      ...anciens,
      { ...COMPOSANT_VIDE },
    ]);
  }

  function supprimerComposant(index) {
    setComposants((anciens) => {
      if (anciens.length === 1) {
        return [{ ...COMPOSANT_VIDE }];
      }

      return anciens.filter(
        (_, i) => i !== index
      );
    });
  }

  /* ============================================================
     IMAGE
  ============================================================ */

  function handleImageChange(event) {
    const fichier =
      event.target.files?.[0];

    if (!fichier) {
      return;
    }

    if (
      !TYPES_IMAGES_AUTORISEES.includes(
        fichier.type
      )
    ) {
      setMessage(
        "Format non autorisé. Utilisez JPG, PNG ou WEBP."
      );

      setTypeMessage("error");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    if (fichier.size > 5 * 1024 * 1024) {
      setMessage(
        "L'image ne doit pas dépasser 5 Mo."
      );

      setTypeMessage("error");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(fichier);
    setImagePreview(
      URL.createObjectURL(fichier)
    );

    setMessage("");
    setTypeMessage("");
  }

  function supprimerImage() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  /* ============================================================
     RESET
  ============================================================ */

  function resetForm() {
    supprimerImage();

    setNom("");
    setDescription("");
    setCategorie("");

    setTypeInstallation(
      "residentiel"
    );

    setProfilTarifaire("DPP");
    setModeTarif("standard");

    setAppareils([
      {
        nom: "Lampe LED",
        puissance: 10,
        quantite: 5,
        heures: 5,
      },
    ]);

    setComposants([
      { ...COMPOSANT_VIDE },
    ]);

    setMessage("");
    setTypeMessage("");
  }

  /* ============================================================
     AJOUT PRODUIT
  ============================================================ */

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setTypeMessage("");

    if (!nom.trim()) {
      setMessage(
        "Veuillez saisir le nom du kit."
      );
      setTypeMessage("error");
      return;
    }

    if (!categorie) {
      setMessage(
        "Veuillez choisir une catégorie."
      );
      setTypeMessage("error");
      return;
    }

    if (consommationJour <= 0) {
      setMessage(
        "Ajoutez au moins un appareil correctement renseigné."
      );
      setTypeMessage("error");
      return;
    }

    if (totalKit <= 0) {
      setMessage(
        "Le prix total du kit doit être supérieur à 0 FCFA."
      );
      setTypeMessage("error");
      return;
    }

    const appareilsValides =
      appareils
        .filter(
          (appareil) =>
            appareil.nom.trim() &&
            Number(appareil.puissance) > 0 &&
            Number(appareil.quantite) > 0 &&
            Number(appareil.heures) > 0
        )
        .map((appareil) => {
          const kwhJour =
            (Number(appareil.puissance) *
              Number(appareil.quantite) *
              Number(appareil.heures)) /
            1000;

          return {
            nom: appareil.nom.trim(),
            puissance:
              Number(appareil.puissance),
            quantite:
              Number(appareil.quantite),
            heures:
              Number(appareil.heures),
            kwh_jour:
              Number(kwhJour.toFixed(4)),
          };
        });

    const composantsValides =
      composants
        .filter(
          (composant) =>
            composant.nom.trim()
        )
        .map((composant) => ({
          nom: composant.nom.trim(),
          quantite:
            Number(composant.quantite) ||
            0,
          prix:
            Number(composant.prix) || 0,
        }));

    if (!appareilsValides.length) {
      setMessage(
        "Ajoutez au moins un appareil valide."
      );
      setTypeMessage("error");
      return;
    }

    if (!composantsValides.length) {
      setMessage(
        "Ajoutez au moins un composant au kit."
      );
      setTypeMessage("error");
      return;
    }

    setChargement(true);

    setMessage(
      "Ajout du kit en cours..."
    );

    setTypeMessage("loading");

    try {
      let imageUrl = "";

      /* ============================
         UPLOAD IMAGE
      ============================ */

      if (image) {
        const extension =
          image.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const filename =
          `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 10)}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from("produits")
            .upload(
              filename,
              image,
              {
                cacheControl: "3600",
                upsert: false,
                contentType: image.type,
              }
            );

        if (uploadError) {
          throw new Error(
            `Erreur image : ${uploadError.message}`
          );
        }

        const { data } =
          supabase.storage
            .from("produits")
            .getPublicUrl(
              filename
            );

        imageUrl =
          data?.publicUrl || "";
      }

      /* ============================
         INSERTION SUPABASE
      ============================ */

      const { error } =
        await supabase
          .from("produits")
          .insert({
            nom: nom.trim(),

            description:
              description.trim(),

            prix: totalKit,

            categorie,

            image_url: imageUrl,

            composants:
              composantsValides,

            /*
             * kwh_jour contient ici la
             * consommation journalière
             * calculée à partir des appareils.
             */
            kwh_jour:
              Number(
                consommationJour.toFixed(2)
              ),

            type_installation:
              typeInstallation,

            profil_tarifaire:
              profilTarifaire,

            mode_tarif:
              modeTarif,

            appareils:
              appareilsValides,

            consommation_mois:
              Number(
                consommationMois.toFixed(2)
              ),

            cout_senelec:
              Number(
                coutSenelec.toFixed(2)
              ),
          });

      if (error) {
        throw new Error(
          `Erreur lors de l'enregistrement : ${error.message}`
        );
      }

      setMessage(
        "✓ Kit ajouté avec succès !"
      );

      setTypeMessage("success");

      resetForm();

      await fetchProduits();
    } catch (error) {
      setMessage(
        getErrorMessage(error)
      );

      setTypeMessage("error");
    } finally {
      setChargement(false);
    }
  }

  /* ============================================================
     SUPPRESSION
  ============================================================ */

  async function handleDelete(
    id,
    nomProduit
  ) {
    const confirmation =
      window.confirm(
        `Voulez-vous vraiment supprimer "${nomProduit}" ?\n\nCette action est irréversible.`
      );

    if (!confirmation) {
      return;
    }

    setSuppressionId(id);

    try {
      const { error } =
        await supabase
          .from("produits")
          .delete()
          .eq("id", id);

      if (error) {
        throw new Error(
          `Erreur lors de la suppression : ${error.message}`
        );
      }

      setProduits((anciens) =>
        anciens.filter(
          (produit) =>
            produit.id !== id
        )
      );

      setMessage(
        "✓ Kit supprimé avec succès."
      );

      setTypeMessage("success");
    } catch (error) {
      setMessage(
        getErrorMessage(error)
      );

      setTypeMessage("error");
    } finally {
      setSuppressionId(null);
    }
  }

  /* ============================================================
     DECONNEXION
  ============================================================ */

  async function handleLogout() {
    setDeconnexion(true);

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      setDeconnexion(false);

      setMessage(
        `Erreur lors de la déconnexion : ${error.message}`
      );

      setTypeMessage("error");

      return;
    }

    window.location.href =
      "/admin/login";
  }

  /* ============================================================
     LABEL CATEGORIE
  ============================================================ */

  function categorieLabel(categorie) {
    if (
      categorie ===
      "kit-complet-maison"
    ) {
      return "Maison";
    }

    if (
      categorie ===
      "kit-complet-pompage"
    ) {
      return "Pompage solaire";
    }

    return categorie || "Non classé";
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <AdminGuard>
      <main className="min-h-screen bg-slate-50">

        {/* HEADER */}

        <header className="sticky top-0 z-50 border-b border-white/10 bg-blue-950 shadow-lg">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white">
                ☀️
              </div>

              <div>
                <h1 className="text-lg font-black text-white">
                  SOLART{" "}
                  <span className="text-orange-400">
                    SMART
                  </span>
                </h1>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200">
                  Administration
                </p>
              </div>
            </div>

            <div className="flex gap-2">

              <a
                href="/"
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/20"
              >
                ← Retour au site
              </a>

              <button
                type="button"
                onClick={handleLogout}
                disabled={deconnexion}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deconnexion
                  ? "Déconnexion..."
                  : "Déconnexion"}
              </button>

            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          {/* STATISTIQUES */}

          <section className="mb-8 grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total
              </p>

              <p className="mt-2 text-3xl font-black text-blue-950">
                {statistiques.total}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Kits maison
              </p>

              <p className="mt-2 text-3xl font-black text-blue-950">
                {statistiques.maison}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pompage
              </p>

              <p className="mt-2 text-3xl font-black text-blue-950">
                {statistiques.pompage}
              </p>
            </div>

          </section>

          {/* MESSAGE */}

          {message && (
            <div
              className={`mb-6 rounded-2xl border p-4 ${
                typeMessage === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : typeMessage === "error"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-blue-200 bg-blue-50 text-blue-800"
              }`}
            >
              <p className="text-sm font-semibold">
                {typeMessage === "success"
                  ? "✓ "
                  : typeMessage === "error"
                    ? "! "
                    : "⏳ "}

                {message}
              </p>
            </div>
          )}

          <div className="grid items-start gap-8 xl:grid-cols-[460px_1fr]">

            {/* =====================================================
                FORMULAIRE
            ===================================================== */}

            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 p-6">
                <h3 className="text-xl font-black text-blue-950">
                  Ajouter un kit
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Estimez la consommation à partir
                  des appareils réels.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6 p-6"
              >

                {/* NOM */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Nom du kit *
                  </label>

                  <input
                    value={nom}
                    onChange={(e) =>
                      setNom(e.target.value)
                    }
                    placeholder="Ex : Kit solaire maison"
                    className={inputStyle}
                    disabled={chargement}
                  />
                </div>

                {/* DESCRIPTION */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    rows={4}
                    placeholder="Décrivez le kit..."
                    className={`${inputStyle} resize-none`}
                    disabled={chargement}
                  />
                </div>

                {/* CATEGORIE */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Catégorie *
                  </label>

                  <select
                    value={categorie}
                    onChange={(e) =>
                      setCategorie(
                        e.target.value
                      )
                    }
                    className={inputStyle}
                    disabled={chargement}
                  >
                    <option value="">
                      Sélectionner une catégorie
                    </option>

                    <option value="kit-complet-maison">
                      Kit complet maison
                    </option>

                    <option value="kit-complet-pompage">
                      Kit complet pompage solaire
                    </option>
                  </select>
                </div>

                {/* TYPE INSTALLATION */}

                <div>
                  <label className="mb-3 block text-sm font-bold text-slate-700">
                    Type d'installation
                  </label>

                  <div className="grid grid-cols-3 gap-2">

                    {Object.entries(
                      INSTALLATIONS
                    ).map(
                      ([key, installation]) => (
                        <button
                          type="button"
                          key={key}
                          onClick={() =>
                            changerTypeInstallation(
                              key
                            )
                          }
                          className={`rounded-2xl border p-3 text-center ${
                            typeInstallation ===
                            key
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10"
                              : "border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="text-2xl">
                            {installation.icon}
                          </div>

                          <div className="text-xs font-black text-blue-950">
                            {installation.label}
                          </div>

                          <div className="mt-1 hidden text-[9px] text-slate-400 sm:block">
                            {installation.description}
                          </div>
                        </button>
                      )
                    )}

                  </div>
                </div>

                {/* APPAREILS */}

                <div className="border-t border-slate-100 pt-6">

                  <h4 className="text-sm font-black text-blue-950">
                    Appareils et équipements
                  </h4>

                  <p className="mt-1 text-xs text-slate-400">
                    Puissance × quantité × heures ÷ 1000
                    = kWh/jour
                  </p>

                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-800">
                    Les puissances proposées sont
                    indicatives. Lorsque c'est possible,
                    utilisez la puissance indiquée sur
                    l'appareil.
                  </div>

                  {/* PRESETS */}

                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        ajouterAppareilPreset(
                          e.target.value
                        );
                      }
                    }}
                    className={`${inputStyle} mt-4`}
                    disabled={chargement}
                  >
                    <option value="">
                      + Ajouter un équipement prédéfini
                    </option>

                    {(
                      APPAREILS[
                        typeInstallation
                      ] || []
                    ).map(
                      ([nomAppareil, puissance]) => (
                        <option
                          key={nomAppareil}
                          value={nomAppareil}
                        >
                          {nomAppareil} —{" "}
                          {puissance} W
                        </option>
                      )
                    )}
                  </select>

                  {/* LISTE APPAREILS */}

                  <div className="mt-4 space-y-3">

                    {appareils.map(
                      (appareil, index) => {

                        const kwh =
                          (Number(
                            appareil.puissance
                          ) *
                            Number(
                              appareil.quantite
                            ) *
                            Number(
                              appareil.heures
                            )) /
                          1000;

                        return (
                          <div
                            key={index}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                          >

                            <div className="mb-3 flex items-center justify-between">

                              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                                Équipement{" "}
                                {index + 1}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  supprimerAppareil(
                                    index
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-xl text-red-500 hover:bg-red-100"
                              >
                                ×
                              </button>

                            </div>

                            <input
                              value={appareil.nom}
                              onChange={(e) =>
                                updateAppareil(
                                  index,
                                  "nom",
                                  e.target.value
                                )
                              }
                              placeholder="Nom de l'appareil"
                              className={inputStyle}
                              disabled={chargement}
                            />

                            <div className="mt-3 grid grid-cols-3 gap-2">

                              <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
                                  Puissance W
                                </label>

                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    appareil.puissance
                                  }
                                  onChange={(e) =>
                                    updateAppareil(
                                      index,
                                      "puissance",
                                      e.target.value
                                    )
                                  }
                                  className={inputStyle}
                                  disabled={chargement}
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
                                  Quantité
                                </label>

                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    appareil.quantite
                                  }
                                  onChange={(e) =>
                                    updateAppareil(
                                      index,
                                      "quantite",
                                      e.target.value
                                    )
                                  }
                                  className={inputStyle}
                                  disabled={chargement}
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
                                  Heures/j
                                </label>

                                <input
                                  type="number"
                                  min="0"
                                  max="24"
                                  step="0.5"
                                  value={
                                    appareil.heures
                                  }
                                  onChange={(e) =>
                                    updateAppareil(
                                      index,
                                      "heures",
                                      e.target.value
                                    )
                                  }
                                  className={inputStyle}
                                  disabled={chargement}
                                />
                              </div>

                            </div>

                            <div className="mt-3 flex justify-between rounded-xl bg-white px-3 py-2 text-xs">

                              <span className="text-slate-400">
                                Consommation
                              </span>

                              <strong className="text-blue-950">
                                {formatKwh(kwh)}{" "}
                                kWh/j
                              </strong>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={ajouterAppareil}
                    className="mt-4 w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-100"
                  >
                    + Ajouter un équipement
                  </button>

                </div>

                {/* RESUME CONSOMMATION */}

                <div className="rounded-2xl bg-blue-950 p-5 text-white">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-[10px] font-bold uppercase text-blue-300">
                        Consommation journalière
                      </p>

                      <p className="mt-1 text-2xl font-black">
                        {formatKwh(
                          consommationJour
                        )}{" "}
                        kWh/j
                      </p>
                    </div>

                    <div className="text-right">

                      <p className="text-[10px] font-bold uppercase text-blue-300">
                        Mensuelle
                      </p>

                      <p className="mt-1 text-lg font-black text-orange-400">
                        {formatKwh(
                          consommationMois
                        )}{" "}
                        kWh/mois
                      </p>

                    </div>

                  </div>

                </div>

                {/* TARIF */}

                <div className="border-t border-slate-100 pt-6">

                  <h4 className="text-sm font-black text-blue-950">
                    Tarif SENELEC
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Sélectionnez le profil tarifaire
                    correspondant réellement au client.
                  </p>

                  <select
                    value={profilTarifaire}
                    onChange={(e) =>
                      setProfilTarifaire(
                        e.target.value
                      )
                    }
                    className={`${inputStyle} mt-3`}
                    disabled={chargement}
                  >

                    {Object.entries(
                      TARIFS
                    ).map(
                      ([code, tarifItem]) => (
                        <option
                          key={code}
                          value={code}
                        >
                          {code} —{" "}
                          {tarifItem.label}
                        </option>
                      )
                    )}

                  </select>

                  {!tarif?.grandePuissance && (
                    <div className="mt-3 grid grid-cols-2 gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          setModeTarif(
                            "standard"
                          )
                        }
                        className={`rounded-xl border px-3 py-3 text-xs font-black ${
                          modeTarif ===
                          "standard"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-200 text-slate-500"
                        }`}
                      >
                        Facturation standard
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setModeTarif(
                            "woyofal"
                          )
                        }
                        className={`rounded-xl border px-3 py-3 text-xs font-black ${
                          modeTarif ===
                          "woyofal"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-200 text-slate-500"
                        }`}
                      >
                        Woyofal
                      </button>

                    </div>
                  )}

                  {/* TRANCHES */}

                  {detailsTranches.length >
                    0 && (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">

                      <p className="mb-2 text-[10px] font-black uppercase text-slate-400">
                        Détail des tranches
                      </p>

                      {detailsTranches.map(
                        (detail) => (
                          <div
                            key={
                              detail.index
                            }
                            className="flex justify-between py-1 text-xs"
                          >

                            <span>
                              Tranche{" "}
                              {detail.index}{" "}
                              :{" "}
                              {formatKwh(
                                detail.energie
                              )}{" "}
                              kWh
                            </span>

                            <strong>
                              {detail.prix.toLocaleString(
                                "fr-FR",
                                {
                                  maximumFractionDigits: 2,
                                }
                              )}{" "}
                              FCFA/kWh
                            </strong>

                          </div>
                        )
                      )}

                    </div>
                  )}

                  {/* GRANDE PUISSANCE */}

                  {tarif?.grandePuissance && (
                    <div className="mt-3 rounded-xl bg-orange-50 p-3 text-xs font-semibold text-orange-800">
                      Pour DGP/PGP, cette estimation
                      utilise uniquement le tarif hors
                      pointe. Une facture complète nécessite
                      notamment la répartition pointe/hors
                      pointe et la puissance souscrite.
                    </div>
                  )}

                  {/* COUT */}

                  <div className="mt-4 rounded-2xl bg-blue-50 p-5">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-[10px] font-black uppercase text-blue-400">
                          Énergie
                        </p>

                        <p className="mt-1 text-sm font-bold text-blue-950">
                          {formatKwh(
                            consommationMois
                          )}{" "}
                          kWh/mois
                        </p>
                      </div>

                      <div className="text-right">

                        <p className="text-[10px] font-black uppercase text-blue-400">
                          Estimation
                        </p>

                        <p className="mt-1 text-xl font-black text-blue-950">
                          {formatPrix(
                            coutSenelec
                          )}
                        </p>

                      </div>

                    </div>

                    <p className="mt-3 text-[10px] leading-4 text-blue-500">
                      Il s'agit d'une estimation de la
                      composante énergie. Une facture réelle
                      peut contenir d'autres éléments.
                    </p>

                  </div>

                </div>

                {/* IMAGE */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Image du kit
                  </label>

                  {imagePreview ? (
                    <div className="overflow-hidden rounded-2xl border border-slate-200">

                      <div className="relative aspect-video">

                        <img
                          src={imagePreview}
                          alt="Aperçu"
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={
                            supprimerImage
                          }
                          className="absolute right-3 top-3 h-9 w-9 rounded-xl bg-red-600 text-lg font-bold text-white"
                        >
                          ×
                        </button>

                      </div>

                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center hover:border-blue-400">

                      <div className="mb-3 text-3xl">
                        🖼️
                      </div>

                      <p className="text-sm font-bold text-blue-950">
                        Ajouter une image
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        JPG, PNG ou WEBP • 5 Mo max
                      </p>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={
                          handleImageChange
                        }
                        className="hidden"
                        disabled={chargement}
                      />

                    </label>
                  )}

                </div>

                {/* COMPOSANTS */}

                <div className="border-t border-slate-100 pt-6">

                  <div className="mb-4 flex justify-between">

                    <h4 className="text-sm font-black text-blue-950">
                      Composition du kit
                    </h4>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700">
                      {
                        composants.filter(
                          (c) =>
                            c.nom.trim()
                        ).length
                      }{" "}
                      élément(s)
                    </span>

                  </div>

                  <div className="space-y-3">

                    {composants.map(
                      (composant, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >

                          <div className="mb-3 flex justify-between">

                            <span className="text-[11px] font-black uppercase text-slate-400">
                              Composant{" "}
                              {index + 1}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                supprimerComposant(
                                  index
                                )
                              }
                              className="text-red-500"
                            >
                              ×
                            </button>

                          </div>

                          <input
                            value={
                              composant.nom
                            }
                            onChange={(e) =>
                              updateComposant(
                                index,
                                "nom",
                                e.target.value
                              )
                            }
                            placeholder="Ex : Panneau solaire 620W"
                            className={
                              inputStyle
                            }
                          />

                          <div className="mt-3 grid grid-cols-2 gap-3">

                            <input
                              type="number"
                              min="0"
                              value={
                                composant.quantite
                              }
                              onChange={(e) =>
                                updateComposant(
                                  index,
                                  "quantite",
                                  e.target.value
                                )
                              }
                              placeholder="Quantité"
                              className={
                                inputStyle
                              }
                            />

                            <input
                              type="number"
                              min="0"
                              value={
                                composant.prix
                              }
                              onChange={(e) =>
                                updateComposant(
                                  index,
                                  "prix",
                                  e.target.value
                                )
                              }
                              placeholder="Prix unitaire"
                              className={
                                inputStyle
                              }
                            />

                          </div>

                          <div className="mt-3 flex justify-between rounded-xl bg-white px-3 py-2 text-xs">

                            <span className="text-slate-400">
                              Sous-total
                            </span>

                            <strong>
                              {formatPrix(
                                composant.quantite *
                                  composant.prix
                              )}
                            </strong>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={
                      ajouterComposant
                    }
                    className="mt-4 w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700"
                  >
                    + Ajouter un composant
                  </button>

                </div>

                {/* TOTAL KIT */}

                <div className="rounded-2xl bg-blue-950 p-5 text-white">

                  <div className="flex justify-between">

                    <span className="text-sm text-blue-200">
                      Prix total du kit
                    </span>

                    <strong className="text-2xl text-orange-400">
                      {formatPrix(
                        totalKit
                      )}
                    </strong>

                  </div>

                </div>

                {/* BOUTONS */}

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={chargement}
                    className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-600"
                  >
                    Réinitialiser
                  </button>

                  <button
                    type="submit"
                    disabled={chargement}
                    className="rounded-xl bg-orange-500 px-4 py-3 font-extrabold text-white hover:bg-orange-600 disabled:opacity-60"
                  >
                    {chargement
                      ? "Ajout..."
                      : "Ajouter le kit"}
                  </button>

                </div>

              </form>
            </section>

            {/* =====================================================
                CATALOGUE
            ===================================================== */}

            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 p-6">

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                  <div>

                    <h3 className="text-xl font-black text-blue-950">
                      Catalogue
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Gérez les kits affichés sur votre site.
                    </p>

                  </div>

                  <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                    {produitsFiltres.length} produit(s)
                  </div>

                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px]">

                  <input
                    value={recherche}
                    onChange={(e) =>
                      setRecherche(
                        e.target.value
                      )
                    }
                    placeholder="Rechercher un kit..."
                    className={inputStyle}
                  />

                  <select
                    value={filtreCategorie}
                    onChange={(e) =>
                      setFiltreCategorie(
                        e.target.value
                      )
                    }
                    className={inputStyle}
                  >
                    <option value="toutes">
                      Toutes les catégories
                    </option>

                    <option value="kit-complet-maison">
                      Kits maison
                    </option>

                    <option value="kit-complet-pompage">
                      Pompage solaire
                    </option>
                  </select>

                </div>

              </div>

              <div className="p-6">

                {chargementProduits ? (
                  <div className="grid gap-4 md:grid-cols-2">

                    {[1, 2, 3, 4].map(
                      (numero) => (
                        <div
                          key={numero}
                          className="h-64 animate-pulse rounded-2xl bg-slate-100"
                        />
                      )
                    )}

                  </div>
                ) : produitsFiltres.length === 0 ? (

                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">

                    <div className="text-4xl">
                      📦
                    </div>

                    <h4 className="mt-3 font-black text-blue-950">
                      Aucun kit trouvé
                    </h4>

                  </div>

                ) : (

                  <div className="grid gap-5 md:grid-cols-2">

                    {produitsFiltres.map(
                      (produit) => (
                        <article
                          key={produit.id}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                        >

                          <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">

                            {produit.image_url ? (
                              <img
                                src={
                                  produit.image_url
                                }
                                alt={
                                  produit.nom
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-4xl">
                                ☀️
                              </div>
                            )}

                            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-black text-blue-900">
                              {categorieLabel(
                                produit.categorie
                              )}
                            </span>

                          </div>

                          <div className="p-5">

                            <h4 className="truncate text-lg font-black text-blue-950">
                              {produit.nom}
                            </h4>

                            {produit.description && (
                              <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                                {
                                  produit.description
                                }
                              </p>
                            )}

                            <div className="mt-4 grid grid-cols-2 gap-3">

                              <div className="rounded-xl bg-orange-50 p-3">

                                <p className="text-[10px] font-bold uppercase text-orange-400">
                                  Prix
                                </p>

                                <p className="mt-1 font-black text-orange-500">
                                  {formatPrix(
                                    produit.prix
                                  )}
                                </p>

                              </div>

                              <div className="rounded-xl bg-blue-50 p-3">

                                <p className="text-[10px] font-bold uppercase text-blue-400">
                                  Consommation
                                </p>

                                <p className="mt-1 font-black text-blue-900">
                                  {formatKwh(
                                    produit.kwh_jour
                                  )}{" "}
                                  kWh/j
                                </p>

                              </div>

                            </div>

                            {produit.type_installation && (
                              <p className="mt-3 text-xs font-bold text-slate-500">

                                {
                                  INSTALLATIONS[
                                    produit
                                      .type_installation
                                  ]?.icon
                                }{" "}

                                {
                                  INSTALLATIONS[
                                    produit
                                      .type_installation
                                  ]?.label
                                }

                                {" • "}

                                {
                                  produit.profil_tarifaire
                                }

                                {" • "}

                                {produit.mode_tarif ===
                                "woyofal"
                                  ? "Woyofal"
                                  : "Standard"}

                              </p>
                            )}

                            {produit.consommation_mois !=
                              null && (
                              <p className="mt-1 text-xs text-slate-500">

                                {formatKwh(
                                  produit.consommation_mois
                                )}{" "}
                                kWh/mois

                                {" • "}

                                estimation énergie{" "}

                                {formatPrix(
                                  produit.cout_senelec
                                )}

                              </p>
                            )}

                            {Array.isArray(
                              produit.composants
                            ) &&
                              produit.composants
                                .length > 0 && (

                                <div className="mt-4 border-t border-slate-100 pt-4">

                                  <p className="mb-2 text-[10px] font-black uppercase text-slate-400">
                                    Composition
                                  </p>

                                  {produit.composants
                                    .slice(0, 5)
                                    .map(
                                      (
                                        composant,
                                        index
                                      ) => (
                                        <div
                                          key={
                                            index
                                          }
                                          className="flex justify-between gap-3 text-xs"
                                        >

                                          <span className="truncate">
                                            {
                                              composant.quantite
                                            }{" "}
                                            ×{" "}
                                            {
                                              composant.nom
                                            }
                                          </span>

                                          <strong>
                                            {formatPrix(
                                              composant.prix
                                            )}
                                          </strong>

                                        </div>
                                      )
                                    )}

                                </div>
                              )}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  produit.id,
                                  produit.nom
                                )
                              }
                              disabled={
                                suppressionId ===
                                produit.id
                              }
                              className="mt-5 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 disabled:opacity-50"
                            >
                              {suppressionId ===
                              produit.id
                                ? "Suppression..."
                                : "Supprimer le kit"}
                            </button>

                          </div>

                        </article>
                      )
                    )}

                  </div>
                )}

              </div>

            </section>

          </div>
        </div>
      </main>
    </AdminGuard>
  );
}