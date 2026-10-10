
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/AdminGuard";

const TYPES_IMAGES_AUTORISES = ["image/jpeg", "image/png", "image/webp"];

const CATEGORIES_KITS = [
  { value: "kit-complet-maison", label: "Kit complet maison" },
  { value: "kit-complet-pompage", label: "Kit complet pompage solaire" },
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

const COMPOSANT_VIDE = {
  nom: "",
  quantite: 1,
  prix: 0,
};

const inputStyle =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100";

const boutonPrincipal =
  "rounded-xl bg-orange-500 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50";

const boutonSecondaire =
  "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50";

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

export default function AdminPage() {
  const [onglet, setOnglet] = useState("dashboard");

  // Données
  const [produits, setProduits] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [chargementProduits, setChargementProduits] = useState(true);
  const [chargementCatalogue, setChargementCatalogue] = useState(true);

  // Messages et actions
  const [message, setMessage] = useState("");
  const [typeMessage, setTypeMessage] = useState("");
  const [chargement, setChargement] = useState(false);
  const [suppressionId, setSuppressionId] = useState(null);
  const [deconnexion, setDeconnexion] = useState(false);

  // Recherche
  const [rechercheKit, setRechercheKit] = useState("");
  const [filtreKit, setFiltreKit] = useState("tous");
  const [rechercheComposant, setRechercheComposant] = useState("");
  const [afficherInactifs, setAfficherInactifs] = useState(false);

  // Formulaire kit
  const [kitId, setKitId] = useState(null);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [categorie, setCategorie] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageExistante, setImageExistante] = useState("");
  const [composants, setComposants] = useState([{ ...COMPOSANT_VIDE }]);
  const [composantCatalogueId, setComposantCatalogueId] = useState("");

  // Formulaire bibliothèque
  const [composantId, setComposantId] = useState(null);
  const [nomComposant, setNomComposant] = useState("");
  const [descriptionComposant, setDescriptionComposant] = useState("");
  const [categorieComposant, setCategorieComposant] = useState("autre");
  const [referenceComposant, setReferenceComposant] = useState("");
  const [prixComposant, setPrixComposant] = useState("0");
  const [imageUrlComposant, setImageUrlComposant] = useState("");
  const [actifComposant, setActifComposant] = useState(true);

  const fileInputRef = useRef(null);

  // Chargement initial
  useEffect(() => {
    chargerProduits();
    chargerCatalogue();
  }, []);

  async function chargerProduits() {
    setChargementProduits(true);

    const { data, error } = await supabase
      .from("produits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Erreur de chargement des kits : ${error.message}`);
      setTypeMessage("error");
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
      setMessage(
        `Erreur du catalogue de composants : ${error.message}. Vérifie les politiques RLS de composants_catalogue.`
      );
      setTypeMessage("error");
    } else {
      setCatalogue(data || []);
    }

    setChargementCatalogue(false);
  }

  function afficherMessage(texte, type = "success") {
    setMessage(texte);
    setTypeMessage(type);
  }

  // Statistiques
  const composantsActifs = useMemo(
    () => catalogue.filter((item) => item.actif),
    [catalogue]
  );

  const totalCatalogue = useMemo(
    () =>
      composantsActifs.reduce(
        (total, item) => total + Number(item.prix || 0),
        0
      ),
    [composantsActifs]
  );

  const valeurKits = useMemo(
    () => produits.reduce((total, item) => total + Number(item.prix || 0), 0),
    [produits]
  );

  const totalComposantsDansKits = useMemo(
    () =>
      produits.reduce(
        (total, produit) =>
          total + lireComposition(produit.composants).length,
        0
      ),
    [produits]
  );

  const totalKit = composants.reduce(
    (total, composant) =>
      total +
      (Number(composant.quantite) || 0) *
        (Number(composant.prix) || 0),
    0
  );

  const kitsFiltres = produits.filter((produit) => {
    const correspondRecherche = `${produit.nom || ""} ${
      produit.description || ""
    }`
      .toLowerCase()
      .includes(rechercheKit.toLowerCase());

    const correspondCategorie =
      filtreKit === "tous" || produit.categorie === filtreKit;

    return correspondRecherche && correspondCategorie;
  });

  const composantsFiltres = catalogue.filter((item) => {
    const recherche = rechercheComposant.toLowerCase();

    const correspondRecherche = `${item.nom || ""} ${
      item.description || ""
    } ${item.reference || ""}`
      .toLowerCase()
      .includes(recherche);

    const correspondStatut = afficherInactifs || item.actif;

    return correspondRecherche && correspondStatut;
  });

  // Formulaire kit
  function updateComposant(index, champ, valeur) {
    setComposants((anciens) =>
      anciens.map((item, i) => {
        if (i !== index) return item;

        if (champ === "nom") {
          return { ...item, nom: valeur };
        }

        return {
          ...item,
          [champ]: Math.max(0, Number(valeur) || 0),
        };
      })
    );
  }

  function ajouterComposantManuel() {
    setComposants((anciens) => [...anciens, { ...COMPOSANT_VIDE }]);
  }

  function supprimerComposant(index) {
    setComposants((anciens) => {
      const suivants = anciens.filter((_, i) => i !== index);
      return suivants.length ? suivants : [{ ...COMPOSANT_VIDE }];
    });
  }

  function ajouterDepuisCatalogue() {
    const selection = catalogue.find(
      (item) => String(item.id) === String(composantCatalogueId)
    );

    if (!selection) {
      afficherMessage("Sélectionne un composant du catalogue.", "error");
      return;
    }

    setComposants((anciens) => [
      ...anciens.filter((item) => item.nom.trim()),
      {
        nom: selection.nom,
        quantite: 1,
        prix: Number(selection.prix) || 0,
      },
    ]);

    setComposantCatalogueId("");
    afficherMessage(`${selection.nom} ajouté à la composition du kit.`);
  }

  function supprimerImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setImage(null);
    setImagePreview("");

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleImageChange(event) {
    const fichier = event.target.files?.[0];
    if (!fichier) return;

    if (!TYPES_IMAGES_AUTORISES.includes(fichier.type)) {
      afficherMessage("Format non autorisé. Utilise JPG, PNG ou WEBP.", "error");
      event.target.value = "";
      return;
    }

    if (fichier.size > 5 * 1024 * 1024) {
      afficherMessage("L'image ne doit pas dépasser 5 Mo.", "error");
      event.target.value = "";
      return;
    }

    supprimerImage();

    const preview = URL.createObjectURL(fichier);
    setImage(fichier);
    setImagePreview(preview);
  }

  function resetFormKit() {
    supprimerImage();
    setKitId(null);
    setNom("");
    setDescription("");
    setCategorie("");
    setImageExistante("");
    setComposants([{ ...COMPOSANT_VIDE }]);
    setComposantCatalogueId("");
    setMessage("");
    setTypeMessage("");

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function ouvrirModificationKit(produit) {
    supprimerImage();

    setKitId(produit.id);
    setNom(produit.nom || "");
    setDescription(produit.description || "");
    setCategorie(produit.categorie || "");
    setImageExistante(produit.image_url || "");

    const composition = lireComposition(produit.composants).map((item) => ({
      nom: item.nom || "",
      quantite: Number(item.quantite) || 1,
      prix: Number(item.prix) || 0,
    }));

    setComposants(composition.length ? composition : [{ ...COMPOSANT_VIDE }]);
    setOnglet("kits");
    setMessage("Modification du kit : effectue tes changements puis enregistre.");
    setTypeMessage("loading");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function televerserImageKit() {
    if (!image) return imageExistante || "";

    const extension =
      image.name.split(".").pop()?.toLowerCase() || "jpg";

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
      throw new Error(`Erreur image : ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from("produits")
      .getPublicUrl(filename);

    return data?.publicUrl || "";
  }

  async function handleSubmitKit(event) {
    event.preventDefault();

    if (!nom.trim()) {
      afficherMessage("Saisis le nom du kit.", "error");
      return;
    }

    if (!categorie) {
      afficherMessage("Choisis une catégorie de kit.", "error");
      return;
    }

    const compositionValide = composants
      .filter(
        (item) =>
          item.nom.trim() &&
          Number(item.quantite) > 0 &&
          Number(item.prix) >= 0
      )
      .map((item) => ({
        nom: item.nom.trim(),
        quantite: Number(item.quantite),
        prix: Number(item.prix),
      }));

    if (!compositionValide.length) {
      afficherMessage("Ajoute au moins un composant au kit.", "error");
      return;
    }

    const total = compositionValide.reduce(
      (somme, item) => somme + item.quantite * item.prix,
      0
    );

    if (total <= 0) {
      afficherMessage("Le prix total doit être supérieur à 0 FCFA.", "error");
      return;
    }

    setChargement(true);

    try {
      const imageUrl = await televerserImageKit();

      const donnees = {
        nom: nom.trim(),
        description: description.trim(),
        prix: total,
        categorie,
        image_url: imageUrl,
        composants: compositionValide,
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

      afficherMessage(
        kitId ? "Kit modifié avec succès." : "Kit ajouté avec succès."
      );

      resetFormKit();
      await chargerProduits();
    } catch (error) {
      afficherMessage(getErrorMessage(error), "error");
    } finally {
      setChargement(false);
    }
  }

  async function dupliquerKit(produit) {
    const confirmation = window.confirm(
      `Créer une copie de « ${produit.nom} » ?`
    );

    if (!confirmation) return;

    setChargement(true);

    try {
      const { id, created_at, ...copie } = produit;
      const { error } = await supabase.from("produits").insert({
        ...copie,
        nom: `${produit.nom} - Copie`,
      });

      if (error) throw error;

      afficherMessage("Kit dupliqué avec succès.");
      await chargerProduits();
    } catch (error) {
      afficherMessage(getErrorMessage(error), "error");
    } finally {
      setChargement(false);
    }
  }

  async function supprimerKit(produit) {
    if (
      !window.confirm(
        `Supprimer « ${produit.nom} » ? Cette action est irréversible.`
      )
    ) {
      return;
    }

    setSuppressionId(produit.id);

    try {
      const { error } = await supabase
        .from("produits")
        .delete()
        .eq("id", produit.id);

      if (error) throw error;

      setProduits((anciens) =>
        anciens.filter((item) => item.id !== produit.id)
      );

      if (kitId === produit.id) resetFormKit();

      afficherMessage("Kit supprimé.");
    } catch (error) {
      afficherMessage(getErrorMessage(error), "error");
    } finally {
      setSuppressionId(null);
    }
  }

  // Bibliothèque des composants
  function resetFormComposant() {
    setComposantId(null);
    setNomComposant("");
    setDescriptionComposant("");
    setCategorieComposant("autre");
    setReferenceComposant("");
    setPrixComposant("0");
    setImageUrlComposant("");
    setActifComposant(true);
  }

  function ouvrirModificationComposant(item) {
    setComposantId(item.id);
    setNomComposant(item.nom || "");
    setDescriptionComposant(item.description || "");
    setCategorieComposant(item.categorie || "autre");
    setReferenceComposant(item.reference || "");
    setPrixComposant(String(item.prix ?? 0));
    setImageUrlComposant(item.image_url || "");
    setActifComposant(Boolean(item.actif));
    setOnglet("composants");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmitComposant(event) {
    event.preventDefault();

    if (!nomComposant.trim()) {
      afficherMessage("Saisis le nom du composant.", "error");
      return;
    }

    const prix = Number(prixComposant);

    if (!Number.isFinite(prix) || prix < 0) {
      afficherMessage("Le prix doit être un nombre positif ou nul.", "error");
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

      afficherMessage(
        composantId
          ? "Composant modifié avec succès."
          : "Composant ajouté au catalogue."
      );

      resetFormComposant();
      await chargerCatalogue();
    } catch (error) {
      afficherMessage(getErrorMessage(error), "error");
    } finally {
      setChargement(false);
    }
  }

  async function changerStatutComposant(item) {
    setChargement(true);

    try {
      const { error } = await supabase
        .from("composants_catalogue")
        .update({
          actif: !item.actif,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) throw error;

      afficherMessage(
        item.actif ? "Composant désactivé." : "Composant réactivé."
      );

      await chargerCatalogue();
    } catch (error) {
      afficherMessage(getErrorMessage(error), "error");
    } finally {
      setChargement(false);
    }
  }

  async function supprimerComposant(item) {
    if (
      !window.confirm(
        `Supprimer définitivement « ${item.nom} » de la bibliothèque ? Les kits déjà enregistrés conserveront leur composition.`
      )
    ) {
      return;
    }

    setChargement(true);

    try {
      const { error } = await supabase
        .from("composants_catalogue")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      afficherMessage("Composant supprimé du catalogue.");
      if (composantId === item.id) resetFormComposant();
      await chargerCatalogue();
    } catch (error) {
      afficherMessage(getErrorMessage(error), "error");
    } finally {
      setChargement(false);
    }
  }

  async function handleLogout() {
    setDeconnexion(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setDeconnexion(false);
      afficherMessage(
        `Erreur de déconnexion : ${error.message}`,
        "error"
      );
      return;
    }

    window.location.href = "/admin/login";
  }

  const navigation = [
    { id: "dashboard", label: "Vue générale", icon: "▦" },
    { id: "kits", label: "Gestion des kits", icon: "☀" },
    { id: "composants", label: "Bibliothèque composants", icon: "⚙" },
  ];

  return (
    <AdminGuard>
      <main className="min-h-screen bg-slate-50 text-slate-800">
        {/* En-tête */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-blue-950 shadow-lg">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl">
                ☀️
              </div>

              <div className="min-w-0">
                <h1 className="text-lg font-black text-white">
                  SOLART <span className="text-orange-400">SMART</span>
                </h1>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200">
                  Administration centralisée
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/"
                className="hidden rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10 sm:block"
              >
                Voir le site ↗
              </a>

              <button
                type="button"
                onClick={handleLogout}
                disabled={deconnexion}
                className="rounded-xl bg-red-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 sm:px-4 sm:text-sm"
              >
                {deconnexion ? "Déconnexion..." : "Déconnexion"}
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          {/* Navigation interne unique */}
          <nav className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setOnglet(item.id);
                  setMessage("");
                  setTypeMessage("");
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  onglet === item.id
                    ? "bg-blue-950 text-white shadow"
                    : "text-slate-500 hover:bg-slate-100 hover:text-blue-950"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Messages */}
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
              <p className="text-sm font-semibold">{message}</p>
            </div>
          )}

          {/* TABLEAU DE BORD */}
          {onglet === "dashboard" && (
            <section className="space-y-6">
              <div className="rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-6 text-white sm:p-9">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
                  Espace de gestion
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-black sm:text-4xl">
                  Bienvenue dans votre administration.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
                  Gérez les kits solaires et les composants depuis un seul
                  endroit. Les modifications sont enregistrées dans Supabase.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      resetFormKit();
                      setOnglet("kits");
                    }}
                    className={boutonPrincipal}
                  >
                    + Créer un kit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetFormComposant();
                      setOnglet("composants");
                    }}
                    className="rounded-xl border border-white/25 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
                  >
                    + Ajouter un composant
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Kits enregistrés",
                    valeur: produits.length,
                    description: "Dans le catalogue produits",
                    icone: "☀️",
                  },
                  {
                    label: "Composants actifs",
                    valeur: composantsActifs.length,
                    description: "Disponibles pour créer un kit",
                    icone: "⚙️",
                  },
                  {
                    label: "Équipements dans les kits",
                    valeur: totalComposantsDansKits,
                    description: "Lignes de composition enregistrées",
                    icone: "📦",
                  },
                  {
                    label: "Valeur des kits",
                    valeur: formatPrix(valeurKits),
                    description: "Somme des prix affichés des kits",
                    icone: "💰",
                  },
                ].map((stat) => (
                  <article
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-500">
                        {stat.label}
                      </span>
                      <span className="text-2xl">{stat.icone}</span>
                    </div>
                    <p className="mt-4 break-words text-2xl font-black text-blue-950">
                      {stat.valeur}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {stat.description}
                    </p>
                  </article>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <article className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-blue-950">
                        Kits récents
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Derniers kits enregistrés
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOnglet("kits")}
                      className="text-sm font-bold text-blue-700 hover:underline"
                    >
                      Tout voir →
                    </button>
                  </div>

                  <div className="mt-5 space-y-3">
                    {produits.slice(0, 5).map((produit) => (
                      <div
                        key={produit.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-blue-950">
                            {produit.nom}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {categorieKitLabel(produit.categorie)}
                          </p>
                        </div>
                        <strong className="shrink-0 text-sm text-orange-600">
                          {formatPrix(produit.prix)}
                        </strong>
                      </div>
                    ))}

                    {!produits.length && (
                      <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                        Aucun kit enregistré pour le moment.
                      </p>
                    )}
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-blue-950">
                        Bibliothèque des composants
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Prix unitaires de référence
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOnglet("composants")}
                      className="text-sm font-bold text-blue-700 hover:underline"
                    >
                      Gérer →
                    </button>
                  </div>

                  <div className="mt-5 space-y-3">
                    {composantsActifs.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-blue-950">
                            {item.nom}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {categorieComposantLabel(item.categorie)}
                          </p>
                        </div>
                        <strong className="shrink-0 text-sm text-blue-800">
                          {formatPrix(item.prix)}
                        </strong>
                      </div>
                    ))}

                    {!composantsActifs.length && (
                      <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                        Aucun composant actif. Ajoute des équipements dans la
                        bibliothèque.
                      </p>
                    )}
                  </div>

                  <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-400">
                    Valeur indicative cumulée du catalogue actif :{" "}
                    <strong>{formatPrix(totalCatalogue)}</strong>. Ce montant
                    n'est pas le stock réel de l'entreprise.
                  </p>
                </article>
              </div>
            </section>
          )}

          {/* GESTION DES KITS */}
          {onglet === "kits" && (
            <section className="grid items-start gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-blue-950">
                        {kitId ? "Modifier le kit" : "Créer un kit"}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Compose le kit et calcule son prix.
                      </p>
                    </div>

                    {kitId && (
                      <button
                        type="button"
                        onClick={resetFormKit}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmitKit} className="space-y-5 p-5 sm:p-6">
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Nom du kit *
                    </label>
                    <input
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className={inputStyle}
                      placeholder="Ex. Kit solaire maison 5 kWh"
                      disabled={chargement}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`${inputStyle} resize-y`}
                      rows={3}
                      placeholder="Caractéristiques du kit..."
                      disabled={chargement}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Catégorie *
                    </label>
                    <select
                      value={categorie}
                      onChange={(e) => setCategorie(e.target.value)}
                      className={inputStyle}
                      disabled={chargement}
                      required
                    >
                      <option value="">Choisir une catégorie</option>
                      {CATEGORIES_KITS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Image du kit
                    </label>

                    {imagePreview || imageExistante ? (
                      <div className="overflow-hidden rounded-2xl border border-slate-200">
                        <img
                          src={imagePreview || imageExistante}
                          alt="Aperçu du kit"
                          className="aspect-video w-full object-cover"
                        />
                        <div className="flex flex-wrap gap-2 p-3">
                          <label className="cursor-pointer rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800">
                            Changer l'image
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleImageChange}
                              className="hidden"
                              disabled={chargement}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              supprimerImage();
                              setImageExistante("");
                            }}
                            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                          >
                            Retirer l'image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center hover:border-blue-400">
                        <span className="text-3xl">🖼️</span>
                        <span className="mt-2 text-sm font-bold text-blue-950">
                          Choisir une image
                        </span>
                        <span className="mt-1 text-xs text-slate-400">
                          JPG, PNG ou WEBP · 5 Mo maximum
                        </span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={chargement}
                        />
                      </label>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <h3 className="font-black text-blue-950">
                      Ajouter depuis la bibliothèque
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Sélectionne un équipement déjà enregistré pour réutiliser
                      son nom et son prix de référence.
                    </p>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <select
                        value={composantCatalogueId}
                        onChange={(e) =>
                          setComposantCatalogueId(e.target.value)
                        }
                        className={`${inputStyle} min-w-0`}
                        disabled={chargement || chargementCatalogue}
                      >
                        <option value="">
                          {chargementCatalogue
                            ? "Chargement..."
                            : "Choisir un composant actif"}
                        </option>
                        {composantsActifs.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.nom} — {formatPrix(item.prix)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={ajouterDepuisCatalogue}
                        disabled={chargement || !composantCatalogueId}
                        className={boutonSecondaire}
                      >
                        Ajouter
                      </button>
                    </div>

                    {!composantsActifs.length && !chargementCatalogue && (
                      <p className="mt-2 text-xs text-orange-700">
                        Ajoute d'abord des composants dans l'onglet Bibliothèque
                        des composants.
                      </p>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-black text-blue-950">
                          Composition du kit
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                          Les prix peuvent être ajustés pour ce kit.
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                        {composants.filter((item) => item.nom.trim()).length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {composants.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Équipement {index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => supprimerComposant(index)}
                              className="rounded-lg px-2 py-1 text-lg font-bold text-red-500 hover:bg-red-50"
                              aria-label="Retirer ce composant"
                            >
                              ×
                            </button>
                          </div>

                          <input
                            value={item.nom}
                            onChange={(e) =>
                              updateComposant(index, "nom", e.target.value)
                            }
                            placeholder="Nom de l'équipement"
                            className={inputStyle}
                            disabled={chargement}
                          />

                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-xs font-bold text-slate-500">
                                Quantité
                              </label>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={item.quantite}
                                onChange={(e) =>
                                  updateComposant(
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
                              <label className="mb-1 block text-xs font-bold text-slate-500">
                                Prix unitaire
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={item.prix}
                                onChange={(e) =>
                                  updateComposant(
                                    index,
                                    "prix",
                                    e.target.value
                                  )
                                }
                                className={inputStyle}
                                disabled={chargement}
                              />
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between rounded-xl bg-white px-3 py-2">
                            <span className="text-xs text-slate-400">
                              Sous-total
                            </span>
                            <strong className="text-sm text-blue-950">
                              {formatPrix(
                                Number(item.quantite) * Number(item.prix)
                              )}
                            </strong>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={ajouterComposantManuel}
                      disabled={chargement}
                      className="mt-3 w-full rounded-xl border border-dashed border-blue-300 px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50"
                    >
                      + Ajouter un composant manuellement
                    </button>
                  </div>

                  <div className="rounded-2xl bg-blue-950 p-5 text-white">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-200">
                      Prix total calculé
                    </p>
                    <p className="mt-2 text-2xl font-black text-orange-400">
                      {formatPrix(totalKit)}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-blue-200">
                      Somme des quantités multipliées par les prix unitaires.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={resetFormKit}
                      disabled={chargement}
                      className={boutonSecondaire}
                    >
                      Réinitialiser
                    </button>
                    <button
                      type="submit"
                      disabled={chargement}
                      className={boutonPrincipal}
                    >
                      {chargement
                        ? "Enregistrement..."
                        : kitId
                          ? "Enregistrer les changements"
                          : "Enregistrer le kit"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Liste des kits */}
              <div className="min-w-0 rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-blue-950">
                        Catalogue des kits
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Recherche, modification, duplication et suppression.
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                      {kitsFiltres.length} kit(s)
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px]">
                    <input
                      value={rechercheKit}
                      onChange={(e) => setRechercheKit(e.target.value)}
                      className={inputStyle}
                      placeholder="Rechercher un kit..."
                    />
                    <select
                      value={filtreKit}
                      onChange={(e) => setFiltreKit(e.target.value)}
                      className={inputStyle}
                    >
                      <option value="tous">Toutes les catégories</option>
                      {CATEGORIES_KITS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  {chargementProduits ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className="h-64 animate-pulse rounded-2xl bg-slate-100"
                        />
                      ))}
                    </div>
                  ) : kitsFiltres.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
                      <p className="text-4xl">📦</p>
                      <h3 className="mt-3 font-black text-blue-950">
                        Aucun kit trouvé
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Modifie la recherche ou crée un nouveau kit.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {kitsFiltres.map((produit) => {
                        const composition = lireComposition(produit.composants);

                        return (
                          <article
                            key={produit.id}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                          >
                            <div className="relative aspect-[16/9] bg-slate-100">
                              {produit.image_url ? (
                                <img
                                  src={produit.image_url}
                                  alt={produit.nom}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-5xl">
                                  ☀️
                                </div>
                              )}
                              <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black text-blue-950 shadow">
                                {categorieKitLabel(produit.categorie)}
                              </span>
                            </div>

                            <div className="p-4">
                              <h3 className="text-lg font-black text-blue-950">
                                {produit.nom}
                              </h3>

                              {produit.description && (
                                <p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-500">
                                  {produit.description}
                                </p>
                              )}

                              <p className="mt-4 text-xl font-black text-orange-600">
                                {formatPrix(produit.prix)}
                              </p>

                              <div className="mt-3 rounded-xl bg-slate-50 p-3">
                                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                  Composition · {composition.length} ligne(s)
                                </p>

                                {composition.length ? (
                                  <div className="space-y-2">
                                    {composition.slice(0, 5).map((item, index) => (
                                      <div
                                        key={`${produit.id}-${index}`}
                                        className="flex justify-between gap-3 text-xs"
                                      >
                                        <span className="min-w-0 truncate text-slate-600">
                                          {item.quantite} × {item.nom}
                                        </span>
                                        <strong className="shrink-0 text-slate-800">
                                          {formatPrix(
                                            Number(item.quantite) *
                                              Number(item.prix)
                                          )}
                                        </strong>
                                      </div>
                                    ))}
                                    {composition.length > 5 && (
                                      <p className="text-xs text-slate-400">
                                        + {composition.length - 5} autre(s)
                                        équipement(s)
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-400">
                                    Aucune composition enregistrée.
                                  </p>
                                )}
                              </div>

                              <div className="mt-4 grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => ouvrirModificationKit(produit)}
                                  className="rounded-xl bg-blue-50 px-3 py-2.5 text-xs font-bold text-blue-800 hover:bg-blue-100"
                                >
                                  Modifier
                                </button>
                                <button
                                  type="button"
                                  onClick={() => dupliquerKit(produit)}
                                  disabled={chargement}
                                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                >
                                  Dupliquer
                                </button>
                                <button
                                  type="button"
                                  onClick={() => supprimerKit(produit)}
                                  disabled={suppressionId === produit.id}
                                  className="col-span-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                                >
                                  {suppressionId === produit.id
                                    ? "Suppression..."
                                    : "Supprimer le kit"}
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* BIBLIOTHÈQUE DES COMPOSANTS */}
          {onglet === "composants" && (
            <section className="grid items-start gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-blue-950">
                        {composantId ? "Modifier l'équipement" : "Nouvel équipement"}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Crée un composant réutilisable dans tes kits.
                      </p>
                    </div>
                    {composantId && (
                      <button
                        type="button"
                        onClick={resetFormComposant}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>

                <form
                  onSubmit={handleSubmitComposant}
                  className="space-y-5 p-5 sm:p-6"
                >
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Nom de l'équipement *
                    </label>
                    <input
                      value={nomComposant}
                      onChange={(e) => setNomComposant(e.target.value)}
                      className={inputStyle}
                      placeholder="Ex. Panneau solaire 620 W"
                      required
                      disabled={chargement}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Catégorie *
                    </label>
                    <select
                      value={categorieComposant}
                      onChange={(e) => setCategorieComposant(e.target.value)}
                      className={inputStyle}
                      disabled={chargement}
                    >
                      {CATEGORIES_COMPOSANTS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Référence
                    </label>
                    <input
                      value={referenceComposant}
                      onChange={(e) => setReferenceComposant(e.target.value)}
                      className={inputStyle}
                      placeholder="Ex. PAN-620W"
                      disabled={chargement}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Prix unitaire (FCFA) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={prixComposant}
                      onChange={(e) => setPrixComposant(e.target.value)}
                      className={inputStyle}
                      required
                      disabled={chargement}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Description
                    </label>
                    <textarea
                      value={descriptionComposant}
                      onChange={(e) =>
                        setDescriptionComposant(e.target.value)
                      }
                      className={`${inputStyle} resize-y`}
                      rows={3}
                      placeholder="Puissance, capacité, caractéristiques..."
                      disabled={chargement}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      URL de l'image (facultatif)
                    </label>
                    <input
                      type="url"
                      value={imageUrlComposant}
                      onChange={(e) => setImageUrlComposant(e.target.value)}
                      className={inputStyle}
                      placeholder="https://..."
                      disabled={chargement}
                    />
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Colle une adresse d'image publique si tu en possèdes une.
                    </p>
                  </div>

                  {imageUrlComposant && (
                    <img
                      src={imageUrlComposant}
                      alt="Aperçu du composant"
                      className="max-h-48 w-full rounded-xl border border-slate-200 object-contain"
                    />
                  )}

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <input
                      type="checkbox"
                      checked={actifComposant}
                      onChange={(e) => setActifComposant(e.target.checked)}
                      className="h-4 w-4 accent-blue-800"
                      disabled={chargement}
                    />
                    <span>
                      <strong className="block text-sm text-blue-950">
                        Composant actif
                      </strong>
                      <span className="mt-1 block text-xs text-slate-500">
                        Les composants actifs peuvent être ajoutés aux nouveaux
                        kits.
                      </span>
                    </span>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={resetFormComposant}
                      disabled={chargement}
                      className={boutonSecondaire}
                    >
                      Réinitialiser
                    </button>
                    <button
                      type="submit"
                      disabled={chargement}
                      className={boutonPrincipal}
                    >
                      {chargement
                        ? "Enregistrement..."
                        : composantId
                          ? "Enregistrer"
                          : "Ajouter"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="min-w-0 rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-blue-950">
                        Bibliothèque des composants
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Les composants restent indépendants des kits déjà créés.
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                      {composantsFiltres.length} équipement(s)
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      value={rechercheComposant}
                      onChange={(e) =>
                        setRechercheComposant(e.target.value)
                      }
                      className={inputStyle}
                      placeholder="Rechercher par nom ou référence..."
                    />

                    <label className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={afficherInactifs}
                        onChange={(e) =>
                          setAfficherInactifs(e.target.checked)
                        }
                        className="accent-blue-800"
                      />
                      Afficher les inactifs
                    </label>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  {chargementCatalogue ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div
                          key={n}
                          className="h-52 animate-pulse rounded-2xl bg-slate-100"
                        />
                      ))}
                    </div>
                  ) : composantsFiltres.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
                      <p className="text-4xl">⚙️</p>
                      <h3 className="mt-3 font-black text-blue-950">
                        Aucun composant trouvé
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Ajoute ton premier équipement avec le formulaire.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {composantsFiltres.map((item) => (
                        <article
                          key={item.id}
                          className="overflow-hidden rounded-2xl border border-slate-200"
                        >
                          <div className="relative flex h-36 items-center justify-center bg-slate-100">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.nom}
                                className="h-full w-full object-contain p-2"
                              />
                            ) : (
                              <span className="text-4xl">🔧</span>
                            )}

                            <span
                              className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-black ${
                                item.actif
                                  ? "bg-green-100 text-green-800"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {item.actif ? "ACTIF" : "INACTIF"}
                            </span>
                          </div>

                          <div className="p-4">
                            <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                              {categorieComposantLabel(item.categorie)}
                            </p>

                            <h3 className="mt-1 text-base font-black text-blue-950">
                              {item.nom}
                            </h3>

                            {item.reference && (
                              <p className="mt-1 text-xs text-slate-400">
                                Réf. : {item.reference}
                              </p>
                            )}

                            {item.description && (
                              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                                {item.description}
                              </p>
                            )}

                            <p className="mt-3 text-lg font-black text-orange-600">
                              {formatPrix(item.prix)}
                            </p>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => ouvrirModificationComposant(item)}
                                className="rounded-lg bg-blue-50 px-3 py-2.5 text-xs font-bold text-blue-800 hover:bg-blue-100"
                              >
                                Modifier
                              </button>

                              <button
                                type="button"
                                onClick={() => changerStatutComposant(item)}
                                disabled={chargement}
                                className="rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                              >
                                {item.actif ? "Désactiver" : "Réactiver"}
                              </button>

                              <button
                                type="button"
                                onClick={() => supprimerComposant(item)}
                                disabled={chargement}
                                className="col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                              >
                                Supprimer définitivement
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          <footer className="mt-8 border-t border-slate-200 py-5 text-center text-xs text-slate-400">
            SOLART SMART · Administration · Gestion des kits et équipements
          </footer>
        </div>
      </main>
    </AdminGuard>
  );
}
