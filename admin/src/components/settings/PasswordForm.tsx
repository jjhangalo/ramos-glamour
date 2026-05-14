"use client";

import { useState, useTransition } from "react";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { updateAdminPassword } from "@/lib/actions/settings";

export function PasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    
    if (password !== confirm) {
      toast.error("As palavras-passe não coincidem.");
      return;
    }

    if (password.length < 8) {
      toast.error("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }

    startTransition(async () => {
      const result = await updateAdminPassword(password);
      if (result.success) {
        toast.success("Palavra-passe atualizada com sucesso!");
        setPassword("");
        setConfirm("");
      } else {
        toast.error(result.error ?? "Erro ao atualizar palavra-passe.");
      }
    });
  }

  return (
    <form onSubmit={handlePasswordUpdate} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-brand-midnight/40 ml-1">
            Nova Palavra-passe
          </label>
          <div className="relative">
            <KeyRound className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-midnight/20" />
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-brand-midnight/5 bg-white py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-brand-gold/30 focus:ring-8 focus:ring-brand-gold/5"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-brand-midnight/40 ml-1">
            Confirmar Palavra-passe
          </label>
          <div className="relative">
            <ShieldCheck className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-midnight/20" />
            <input
              required
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-brand-midnight/5 bg-white py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-brand-gold/30 focus:ring-8 focus:ring-brand-gold/5"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          disabled={isPending}
          type="submit"
          className="flex items-center gap-2 rounded-2xl bg-brand-bg px-8 py-4 text-xs font-bold uppercase tracking-widest text-brand-midnight transition-all hover:bg-brand-midnight hover:text-white active:scale-95 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Atualizar Palavra-passe
        </button>
      </div>
    </form>
  );
}
