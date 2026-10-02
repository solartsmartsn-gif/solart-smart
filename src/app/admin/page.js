"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/AdminGuard";

const TYPES_IMAGES_AUTORISES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const COMPOSANT_VIDE = {
  nom: "",
  quantite: 1,
  prix: 0,
};

const inputStyle =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100";

function formatPrix(value) {
  return `${Number(value || 0).toLocaleString("fr-FR", {
    maximumFractionDigits: 0,
  })} FCFA`;
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error?.message) {
    return error.message;
  }

  return "Une erreur inconnue est survenue.";
}

function categorieLabel(categorie) {
  if (categorie === "kit-complet-maison") {
    return "Kit maison";
  }

  if (categorie === "kit-complet-pompage") {
    return "Kit pompage";
  }

  return "Non classé";
}

export default function AdminPage() {
  /* ============================================================
     FORMULAIRE
  ============================================================ */

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [categorie, setCategorie] = useState("");

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [composants, setComposants] = useState([
    { ...COMPOSANT_VIDE },
  ]);

  /* ============================================================
     PRODUITS
  ============================================================ */

  const [produits, setProduits] = useState([]);
  const [chargementProduits, setChargementProduits] =
    useState(true);

  /* ============================================================
     ETAT
  ============================================================ */

  const [chargement, setChargement] = useState(false);
  const [suppressionId, setSuppressionId] = useState(null);

  const [message, setMessage] = useState("");
  const [typeMessage, setTypeMessage] = useState("");

  const [deconnexion, setDeconnexion] = useState(false);

  const fileInputRef = useRef(null);

  /* ============================================================
     CHARGER LES PRODUITS
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
     CALCUL PRIX TOTAL
  ============================================================ */

  function calculerTotalKit() {
    return composants.reduce(
      (total, composant) => {
        const quantite =
          Number(composant.quantite) || 0;

        const prix =
          Number(composant.prix) || 0;

        return total + quantite * prix;
      },
      0
    );
  }

  const totalKit = calculerTotalKit();

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
      {
        ...COMPOSANT_VIDE,
      },
    ]);
  }

  function supprimerComposant(index) {
    setComposants((anciens) => {
      if (anciens.length === 1) {
        return [
          {
            ...COMPOSANT_VIDE,
          },
        ];
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
      !TYPES_IMAGES_AUTORISES.includes(
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

    const preview =
      URL.createObjectURL(fichier);

    setImage(fichier);
    setImagePreview(preview);

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

    setComposants([
      {
        ...COMPOSANT_VIDE,
      },
    ]);

    setMessage("");
    setTypeMessage("");
  }

  /* ============================================================
     AJOUT DU KIT
  ============================================================ */

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setTypeMessage("");

    /* ============================
       VALIDATION
    ============================ */

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

    const composantsValides =
      composants
        .filter(
          (composant) =>
            composant.nom.trim() &&
            Number(composant.quantite) > 0 &&
            Number(composant.prix) >= 0
        )
        .map((composant) => ({
          nom: composant.nom.trim(),

          quantite:
            Number(composant.quantite) || 0,

          prix:
            Number(composant.prix) || 0,
        }));

    if (!composantsValides.length) {
      setMessage(
        "Ajoutez au moins un composant au kit."
      );

      setTypeMessage("error");
      return;
    }

    const total =
      composantsValides.reduce(
        (somme, composant) =>
          somme +
          composant.quantite *
            composant.prix,
        0
      );

    if (total <= 0) {
      setMessage(
        "Le prix total du kit doit être supérieur à 0 FCFA."
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

        const {
          error: uploadError,
        } = await supabase.storage
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

            prix: total,

            categorie,

            image_url: imageUrl,

            composants:
              composantsValides,
          });

      if (error) {
        throw new Error(
          `Erreur lors de l'enregistrement : ${error.message}`
        );
      }

      /* ============================
         SUCCÈS
      ============================ */

      setMessage(
        "✓ Kit ajouté avec succès."
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
     SUPPRESSION KIT
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
     RENDER
  ============================================================ */

  return (
    <AdminGuard>
      <main className="min-h-screen bg-slate-50">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="sticky top-0 z-50 border-b border-white/10 bg-blue-950 shadow-lg">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

            <div className="flex min-w-0 items-center gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white">
                ☀️
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-black text-white">
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

            <div className="flex shrink-0 gap-2">

              <a
                href="/"
                className="hidden rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/20 sm:block"
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

        {/* ==================================================
            CONTENU
        ================================================== */}

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

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

            {/* =================================================
                AJOUT KIT
            ================================================= */}

            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 p-6">

                <h2 className="text-xl font-black text-blue-950">
                  Ajouter un kit
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Ajoutez le kit et sa composition.
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
                      setNom(
                        e.target.value
                      )
                    }
                    placeholder="Ex : Kit solaire maison 5 kWh"
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
                    placeholder="Décrivez le contenu et les caractéristiques du kit..."
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
                          alt="Aperçu du kit"
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={
                            supprimerImage
                          }
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-lg font-bold text-white"
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
                        JPG, PNG ou WEBP • 5 Mo maximum
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

                {/* =================================================
                    COMPOSANTS
                ================================================= */}

                <div className="border-t border-slate-100 pt-6">

                  <div className="mb-4 flex items-center justify-between gap-3">

                    <div>
                      <h3 className="text-sm font-black text-blue-950">
                        Composants du kit
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Ajoutez tous les équipements inclus.
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700">
                      {composants.filter(
                        (c) => c.nom.trim()
                      ).length}{" "}
                      élément(s)
                    </span>

                  </div>

                  <div className="space-y-3">

                    {composants.map(
                      (
                        composant,
                        index
                      ) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >

                          <div className="mb-3 flex items-center justify-between">

                            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
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
                              className="flex h-8 w-8 items-center justify-center rounded-xl text-lg font-bold text-red-500 hover:bg-red-100"
                            >
                              ×
                            </button>

                          </div>

                          {/* NOM */}

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
                            disabled={
                              chargement
                            }
                          />

                          {/* QUANTITE + PRIX */}

                          <div className="mt-3 grid grid-cols-2 gap-3">

                            <div>
                              <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
                                Quantité
                              </label>

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
                                className={
                                  inputStyle
                                }
                                disabled={
                                  chargement
                                }
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
                                Prix unitaire
                              </label>

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
                                placeholder="FCFA"
                                className={
                                  inputStyle
                                }
                                disabled={
                                  chargement
                                }
                              />
                            </div>

                          </div>

                          {/* SOUS TOTAL */}

                          <div className="mt-3 flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs">

                            <span className="text-slate-400">
                              Sous-total
                            </span>

                            <strong className="text-blue-950">
                              {formatPrix(
                                (Number(
                                  composant.quantite
                                ) || 0) *
                                  (Number(
                                    composant.prix
                                  ) || 0)
                              )}
                            </strong>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                  {/* AJOUT COMPOSANT */}

                  <button
                    type="button"
                    onClick={
                      ajouterComposant
                    }
                    disabled={chargement}
                    className="mt-4 w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                  >
                    + Ajouter un composant
                  </button>

                </div>

                {/* TOTAL */}

                <div className="rounded-2xl bg-blue-950 p-5 text-white">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                    Prix total du kit
                  </p>

                  <p className="mt-2 text-2xl font-black text-orange-400">
                    {formatPrix(
                      totalKit
                    )}
                  </p>

                  <p className="mt-2 text-xs text-blue-200">
                    Le prix est calculé automatiquement à partir des composants.
                  </p>

                </div>

                {/* BOUTONS */}

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={
                      resetForm
                    }
                    disabled={
                      chargement
                    }
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Réinitialiser
                  </button>

                  <button
                    type="submit"
                    disabled={
                      chargement
                    }
                    className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {chargement
                      ? "Ajout..."
                      : "Ajouter le kit"}
                  </button>

                </div>

              </form>
            </section>

            {/* =================================================
                CATALOGUE
            ================================================= */}

            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 p-6">

                <div className="flex items-center justify-between gap-4">

                  <div>
                    <h2 className="text-xl font-black text-blue-950">
                      Mes kits
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Kits actuellement enregistrés.
                    </p>
                  </div>

                  <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                    {produits.length} kit(s)
                  </div>

                </div>

              </div>

              <div className="p-6">

                {chargementProduits ? (
                  <div className="grid gap-5 md:grid-cols-2">

                    {[1, 2, 3, 4].map(
                      (numero) => (
                        <div
                          key={numero}
                          className="h-72 animate-pulse rounded-2xl bg-slate-100"
                        />
                      )
                    )}

                  </div>
                ) : produits.length === 0 ? (

                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">

                    <div className="text-4xl">
                      📦
                    </div>

                    <h3 className="mt-3 font-black text-blue-950">
                      Aucun kit
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Ajoutez votre premier kit avec le formulaire.
                    </p>

                  </div>

                ) : (

                  <div className="grid gap-5 md:grid-cols-2">

                    {produits.map(
                      (produit) => (
                        <article
                          key={
                            produit.id
                          }
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                        >

                          {/* IMAGE */}

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
                              <div className="flex h-full items-center justify-center text-5xl">
                                ☀️
                              </div>
                            )}

                            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-black text-blue-900 shadow-sm">
                              {categorieLabel(
                                produit.categorie
                              )}
                            </span>

                          </div>

                          {/* INFORMATIONS */}

                          <div className="p-5">

                            <h3 className="text-lg font-black text-blue-950">
                              {
                                produit.nom
                              }
                            </h3>

                            {produit.description && (
                              <p className="mt-2 text-sm leading-6 text-slate-500">
                                {
                                  produit.description
                                }
                              </p>
                            )}

                            {/* PRIX */}

                            <div className="mt-4 rounded-xl bg-orange-50 p-4">

                              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                                Prix du kit
                              </p>

                              <p className="mt-1 text-xl font-black text-orange-500">
                                {formatPrix(
                                  produit.prix
                                )}
                              </p>

                            </div>

                            {/* COMPOSANTS */}

                            {Array.isArray(
                              produit.composants
                            ) &&
                              produit
                                .composants
                                .length >
                                0 && (
                                <div className="mt-4 border-t border-slate-100 pt-4">

                                  <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    Composition du kit
                                  </p>

                                  <div className="space-y-2">

                                    {produit.composants.map(
                                      (
                                        composant,
                                        index
                                      ) => (
                                        <div
                                          key={
                                            index
                                          }
                                          className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs"
                                        >

                                          <span className="min-w-0 truncate text-slate-700">
                                            <strong>
                                              {
                                                composant.quantite
                                              }
                                              ×
                                            </strong>{" "}
                                            {
                                              composant.nom
                                            }
                                          </span>

                                          <span className="shrink-0 font-bold text-blue-950">
                                            {formatPrix(
                                              Number(
                                                composant.quantite
                                              ) *
                                                Number(
                                                  composant.prix
                                                )
                                            )}
                                          </span>

                                        </div>
                                      )
                                    )}

                                  </div>

                                </div>
                              )}

                            {/* SUPPRIMER */}

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
                              className="mt-5 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
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