"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { User } from "@supabase/supabase-js";
import { UserCircle } from "lucide-react";

import { signInWithGoogle, signOut } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

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
      <button
        type="button"
        onClick={() => signInWithGoogle(pathname)}
        className="rounded-full bg-brand-charcoal px-5 py-2 text-sm font-medium text-brand-white transition hover:bg-brand-olive"
      >
        Entrar com Google
      </button>
    );
  }

  const userName = user.user_metadata.full_name ?? user.email ?? "Cliente";

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-brand-charcoal md:inline">
        {userName}
      </span>
      <Link
        href="/perfil"
        className="inline-flex items-center gap-2 text-sm text-brand-charcoal transition hover:text-brand-olive"
      >
        <UserCircle className="h-4 w-4" />
        <span className="hidden sm:inline">O meu perfil</span>
      </Link>
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
