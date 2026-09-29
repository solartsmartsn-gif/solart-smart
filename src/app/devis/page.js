"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

const WHATSAPP = "221785932525";
const EMAIL = "galsenenergy221@gmail.com";

export default function Devis() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState("");
  const [typeMessage, setTypeMessage] = useState("");

  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        Number(item.prix || 0) *
          Number(item.quantite || 0),
      0
    );
  }, [cart]);

  const nombreArticles = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum + Number(item.quantite || 0),
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

    const messageWhatsApp = `Bonjour Solart Smart,

Je souhaite obtenir un devis.

Nom : ${nom.trim() || "À préciser"}
Téléphone : ${telephone.trim() || "À préciser"}
Email : ${email.trim() || "À préciser"}

Produits sélectionnés :
${produits}

Montant estimatif : ${formatPrix(total)} FCFA

Merci de me contacter pour confirmer les détails de mon installation.`;

    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
      messageWhatsApp
    )}`;
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (cart.length === 0) {
      setMessage(
        "Votre panier est vide. Ajoutez d'abord une solution."
      );
      setTypeMessage("error");
      return;
    }

    const nomPropre = nom.trim();
    const emailPropre = email.trim();
    const telephonePropre = telephone.trim();

    if (!nomPropre || !emailPropre || !telephonePropre) {
      setMessage(
        "Veuillez renseigner toutes vos coordonnées."
      );
      setTypeMessage("error");
      return;
    }

    setEnvoi(true);
    setMessage("Envoi de votre demande en cours...");
    setTypeMessage("loading");

    try {
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: nomPropre,
          email: emailPropre,
          telephone: telephonePropre,
          produits: cart,
          total,
        }),
      });

      let data = null;

      try {
        data = await res.json();
      } catch {
        throw new Error(
          "Le serveur a retourné une réponse invalide."
        );
      }

      if (!res.ok || !data?.success) {
        throw new Error(
          data?.error ||
            "Une erreur est survenue lors de l'envoi du devis."
        );
      }

      setMessage(
        "Votre demande de devis a bien été envoyée. Notre équipe va vous contacter."
      );
      setTypeMessage("success");

      clearCart();

      setTimeout(() => {
        router.push("/");
      }, 3500);
    } catch (error) {
      console.error("Erreur devis :", error);

      setMessage(
        error?.message ||
          "Impossible d'envoyer votre demande de devis. Veuillez réessayer."
      );
      setTypeMessage("error");
    } finally {
      setEnvoi(false);
    }
  }

  /* =========================================================
     PANIER VIDE
  ========================================================= */

  if (cart.length === 0 && !message) {
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
              className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-blue-950 transition hover:border-orange-400 hover:text-orange-500"
            >
              Retour aux solutions
            </Link>
          </div>
        </header>

        <section className="flex min-h-[calc(100vh-85px)] items-center justify-center px-5 py-16">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-blue-950/5">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50 text-3xl">
              🧾
            </div>

            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-500">
              Solart Smart
            </p>

            <h1 className="mt-3 text-2xl font-black text-blue-950">
              Aucun produit sélectionné
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Votre panier est actuellement vide. Ajoutez
              d'abord un kit maison ou un kit pompage avant
              de demander un devis.
            </p>

            <Link
              href="/"
              className="mt-7 flex w-full items-center justify-center rounded-full bg-blue-900 px-6 py-4 font-extrabold text-white transition hover:bg-blue-950"
            >
              Découvrir les solutions
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /* =========================================================
     PAGE DEVIS
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

          <Link
            href="/panier"
            className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-950 transition hover:border-orange-400 hover:text-orange-500"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>

            <span className="hidden sm:inline">
              Retour au panier
            </span>

            <span className="sm:hidden">
              Panier
            </span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* INTRO */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-orange-600">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            Demande de devis
          </div>

          <h1 className="text-3xl font-black tracking-tight text-blue-950 sm:text-4xl lg:text-5xl">
            Préparons votre projet solaire
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
            Renseignez vos coordonnées. Votre sélection sera
            transmise à Solart Smart afin de préparer votre
            demande de devis.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
          {/* FORMULAIRE */}
          <section>
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              {/* HEADER */}
              <div className="bg-blue-950 px-6 py-7 text-white sm:px-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                    ☀️
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                      Solart Smart
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      Vos coordonnées
                    </h2>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-blue-100">
                  Ces informations nous permettent de vous
                  contacter pour confirmer votre projet et
                  préparer le devis.
                </p>
              </div>

              <div className="p-6 sm:p-8">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {/* NOM */}
                  <div>
                    <label
                      htmlFor="nom"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Nom complet
                    </label>

                    <input
                      id="nom"
                      type="text"
                      placeholder="Votre nom complet"
                      value={nom}
                      onChange={(e) =>
                        setNom(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      required
                      disabled={envoi}
                      autoComplete="name"
                    />
                  </div>

                  {/* TELEPHONE */}
                  <div>
                    <label
                      htmlFor="telephone"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Téléphone / WhatsApp
                    </label>

                    <input
                      id="telephone"
                      type="tel"
                      placeholder="+221 77 000 00 00"
                      value={telephone}
                      onChange={(e) =>
                        setTelephone(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      required
                      disabled={envoi}
                      autoComplete="tel"
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Adresse email
                    </label>

                    <input
                      id="email"
                      type="email"
                      placeholder="exemple@email.com"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      required
                      disabled={envoi}
                      autoComplete="email"
                    />
                  </div>

                  {/* BOUTON */}
                  <button
                    type="submit"
                    disabled={envoi}
                    className="w-full rounded-2xl bg-orange-500 px-6 py-4 font-extrabold text-white shadow-lg shadow-orange-500/20 transition duration-300 hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {envoi
                      ? "Envoi de votre demande..."
                      : "Envoyer ma demande de devis →"}
                  </button>
                </form>

                {/* MESSAGE */}
                {message && (
                  <div
                    role={
                      typeMessage === "error"
                        ? "alert"
                        : "status"
                    }
                    className={`mt-5 rounded-2xl border p-4 text-center text-sm font-semibold ${
                      typeMessage === "success"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : typeMessage === "error"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-blue-200 bg-blue-50 text-blue-700"
                    }`}
                  >
                    {typeMessage === "success" && (
                      <div className="mb-2 text-xl">
                        ✓
                      </div>
                    )}

                    {message}
                  </div>
                )}

                <p className="mt-5 text-center text-xs leading-5 text-slate-400">
                  Vos informations sont utilisées uniquement
                  pour traiter votre demande de devis et vous
                  contacter concernant votre projet.
                </p>
              </div>
            </div>
          </section>

          {/* RÉCAPITULATIF */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-[2rem] bg-blue-950 shadow-2xl shadow-blue-950/15">
              <div className="h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />

              <div className="p-6 sm:p-7">
                <div className="mb-7 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-400">
                      Votre sélection
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-white">
                      Récapitulatif
                    </h2>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-orange-400">
                    🧾
                  </div>
                </div>

                <div className="space-y-4">
                  {cart.map((item) => {
                    const prix =
                      Number(item.prix || 0) *
                      Number(item.quantite || 0);

                    return (
                      <div
                        key={item.id}
                        className="border-b border-white/10 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white">
                              {item.nom}
                            </p>

                            <p className="mt-1 text-xs text-blue-300">
                              Quantité :{" "}
                              {Number(
                                item.quantite || 1
                              )}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-black text-white">
                            {formatPrix(prix)}
                            <span className="ml-1 text-[10px] text-blue-300">
                              FCFA
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 border-t border-white/10 pt-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-blue-200">
                        Montant estimatif
                      </p>

                      <p className="mt-1 text-xs leading-5 text-blue-300/70">
                        Avant étude et confirmation
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black text-white">
                        {formatPrix(total)}
                      </p>

                      <p className="text-xs font-bold text-orange-400">
                        FCFA
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-orange-400">
                    À retenir
                  </p>

                  <p className="mt-2 text-xs leading-5 text-blue-100">
                    Le montant affiché est estimatif. Le devis
                    final pourra être ajusté après vérification
                    des besoins, des équipements et des
                    conditions d'installation.
                  </p>
                </div>

                <a
                  href={creerMessageWhatsApp()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-white/15"
                >
                  <span className="text-lg">◉</span>
                  Continuer sur WhatsApp
                </a>
              </div>
            </div>

            {/* CONTACT */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-black text-blue-950">
                Solart Smart
              </p>

              <div className="mt-3 space-y-2 text-xs text-slate-500">
                <p>
                  📱 +221 78 593 25 25
                </p>

                <p>
                  ✉️ {EMAIL}
                </p>

                <p className="leading-5">
                  📍 Pikine Icotaf 3, Tally Mbaye Gakou,
                  en face Sandika — Sénégal
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}