"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import { toggleClientStatus, updateAdminNotes } from "@/lib/actions/clients";
import { cn } from "@/lib/utils";

type AdminNotesCardProps = {
  clientId: string;
  initialNotes: string;
  isActive: boolean;
};

import { FadeUp } from "@/components/shared/Animations";

export function AdminNotesCard({
  clientId,
  initialNotes,
  isActive,
}: AdminNotesCardProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();

  return (
    <FadeUp>
      <section className="rounded-[2.5rem] border border-brand-midnight/5 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-8">
          <div className="flex items-start justify-between gap-4 border-b border-brand-midnight/5 pb-6">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">Notas Internas</h2>
              <p className="mt-1 text-sm font-bold text-brand-midnight">
                Campo de Backoffice
              </p>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const result = await toggleClientStatus(clientId, isActive);
                  if (!result.success) {
                    toast.error(result.error ?? "Não foi possível alterar o estado.");
                    return;
                  }

                  toast.success(isActive ? "Conta desactivada." : "Conta activada.");
                })
              }
              className={cn(
                "rounded-xl border px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95",
                isActive 
                  ? "border-red-100 bg-red-50 text-red-600 hover:bg-red-100" 
                  : "border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              )}
            >
              {isActive ? "Desactivar Conta" : "Activar Conta"}
            </button>
          </div>

          <div className="relative group">
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={6}
              className="w-full rounded-2xl border border-brand-midnight/5 bg-brand-bg/20 px-5 py-4 text-sm outline-none transition focus:border-brand-gold/50 focus:bg-white focus:ring-1 focus:ring-brand-gold/50"
              placeholder="Escreva notas privadas sobre este cliente..."
            />
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await updateAdminNotes(clientId, notes);
                if (!result.success) {
                  toast.error(result.error ?? "Não foi possível guardar as notas.");
                  return;
                }

                toast.success("Notas actualizadas.");
              })
            }
            className="w-full rounded-xl bg-brand-midnight py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-xl shadow-brand-midnight/10 transition active:scale-95 disabled:opacity-50"
          >
            {isPending ? "A processar..." : "Guardar Notas"}
          </button>
        </div>
      </section>
    </FadeUp>
  );
}
