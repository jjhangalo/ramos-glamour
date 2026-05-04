"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

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
    </form>
  );
}
