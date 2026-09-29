"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLogin() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

async function handleLogin(e) {
e.preventDefault();


setError("");

if (!email || !password) {
  setError("Veuillez renseigner votre email et votre mot de passe.");
  return;
}

setLoading(true);

const { error: loginError } = await supabase.auth.signInWithPassword({
  email: email.trim(),
  password: password,
});

if (loginError) {
  console.error("Erreur connexion admin :", loginError);
  setError("Email ou mot de passe incorrect.");
  setLoading(false);
  return;
}

router.push("/admin");
router.refresh();


}

return ( <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10"> <div className="w-full max-w-md"> <div className="mb-8 text-center"> <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg"> <span className="text-2xl font-black"> <span className="text-blue-800">S</span> <span className="text-orange-500">S</span> </span> </div>


      <h1 className="text-2xl font-black tracking-tight text-white">
        Solar Smart
      </h1>

      <p className="mt-2 text-sm text-slate-400">
        Administration
      </p>
    </div>

    <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8">
      <div className="mb-7">
        <h2 className="text-xl font-black text-blue-950">
          Connexion administrateur
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Connectez-vous pour gérer les produits et le catalogue Solar
          Smart.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@exemple.com"
            autoComplete="email"
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Mot de passe
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Votre mot de passe"
            autoComplete="current-password"
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-5 text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-800 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-900/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loading ? "Connexion en cours..." : "Se connecter →"}
        </button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-6 text-center">
        <a
          href="/"
          className="text-sm font-bold text-slate-500 transition hover:text-orange-500"
        >
          ← Retour au site
        </a>
      </div>
    </div>

    <p className="mt-6 text-center text-xs text-slate-500">
      Solar Smart — Administration sécurisée
    </p>
  </div>
</main>


);
}
