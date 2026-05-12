"use client";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="relative w-full overflow-hidden rounded-xl bg-brand-midnight px-4 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-white shadow-lg shadow-brand-midnight/20 transition-all hover:bg-brand-charcoal hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          A autenticar...
        </span>
      ) : (
        "Entrar no Painel"
      )}
    </button>
  );
}

type LoginFormProps = {
  action: (formData: FormData) => Promise<void>;
  error?: string;
};

export function LoginForm({ action, error }: LoginFormProps) {
  const [view, setView] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
        },
      );

      if (resetError) {
        toast.error(resetError.message);
      } else {
        toast.success(
          "Link de recuperação enviado! Verifique o seu email.",
          { duration: 5000 },
        );
        setView("login");
        setEmail("");
      }
    });
  }

  if (view === "reset") {
    return (
      <div className="mt-10 space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">
            Recuperação de Acesso
          </p>
          <p className="text-xs text-brand-midnight/50">
            Introduza o seu email para receber o link de definição de palavra-passe.
          </p>
        </div>

        <form onSubmit={handleResetRequest} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="reset-email"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40 ml-1"
            >
              Email
            </label>
            <input
              id="reset-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-brand-midnight/10 bg-white/50 px-4 py-3 text-sm outline-none transition focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50"
              placeholder="admin@ramosglamour.com"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="relative w-full overflow-hidden rounded-xl bg-brand-midnight px-4 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-white shadow-lg shadow-brand-midnight/20 transition-all hover:bg-brand-charcoal hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                A enviar...
              </span>
            ) : (
              "Enviar Link de Recuperação"
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setView("login")}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40 transition hover:text-brand-midnight"
        >
          <ArrowLeft className="h-3 w-3" />
          Voltar ao Login
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="mt-10 space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40 ml-1"
        >
          Email Corporativo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-brand-midnight/10 bg-white/50 px-4 py-3 text-sm outline-none transition focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50"
          placeholder="admin@ramosglamour.com"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40 ml-1"
        >
          Palavra-passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-brand-midnight/10 bg-white/50 px-4 py-3 text-sm outline-none transition focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50"
          placeholder="••••••••"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-xs font-medium text-red-700 text-center">
          {error}
        </div>
      ) : null}

      <SubmitButton />

      <div className="text-center">
        <button
          type="button"
          onClick={() => setView("reset")}
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30 transition hover:text-brand-midnight"
        >
          Primeiro Acesso / Esqueci a Palavra-passe
        </button>
      </div>
    </form>
  );
}
