"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminGuard({ children }) {
const router = useRouter();

const [checking, setChecking] = useState(true);
const [authorized, setAuthorized] = useState(false);

useEffect(() => {
let mounted = true;


async function checkUser() {
  const { data, error } = await supabase.auth.getUser();

  if (!mounted) {
    return;
  }

  if (error || !data?.user) {
    router.replace("/admin/login");
    return;
  }

  setAuthorized(true);
  setChecking(false);
}

checkUser();

const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((event, session) => {
  if (!mounted) {
    return;
  }

  if (!session?.user) {
    setAuthorized(false);
    router.replace("/admin/login");
    return;
  }

  setAuthorized(true);
  setChecking(false);
});

return () => {
  mounted = false;
  subscription.unsubscribe();
};


}, [router]);

if (checking) {
return ( <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4"> <div className="text-center"> <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-orange-500" />


      <p className="text-sm font-semibold text-slate-400">
        Vérification de votre session...
      </p>
    </div>
  </main>
);


}

if (!authorized) {
return null;
}

return children;
}
