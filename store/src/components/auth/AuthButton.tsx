"use client";

import { useEffect, useState } from "react";

import type { User } from "@supabase/supabase-js";

import { signInWithGoogle, signOut } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!user) {
    return (
      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="rounded-full bg-brand-charcoal px-5 py-2 text-sm font-medium text-brand-white transition hover:bg-brand-olive"
        >
          Entrar com Google
        </button>
      </form>
    );
  }

  const userName = user.user_metadata.full_name ?? user.email ?? "Cliente";

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-brand-charcoal">{userName}</span>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-full border border-brand-charcoal px-4 py-2 text-sm text-brand-charcoal transition hover:bg-brand-charcoal hover:text-brand-white"
        >
          Sair
        </button>
      </form>
    </div>
  );
}
