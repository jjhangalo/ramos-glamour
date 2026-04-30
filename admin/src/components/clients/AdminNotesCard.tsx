"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import { toggleClientStatus, updateAdminNotes } from "@/lib/actions/clients";

type AdminNotesCardProps = {
  clientId: string;
  initialNotes: string;
  isActive: boolean;
};

export function AdminNotesCard({
  clientId,
  initialNotes,
  isActive,
}: AdminNotesCardProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Notas internas</h2>
            <p className="mt-1 text-sm font-semibold text-slate-950">
              Campo de backoffice
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
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            {isActive ? "Desactivar" : "Activar"}
          </button>
        </div>

        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={6}
          className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
          placeholder="Escreve aqui notas privadas sobre este cliente..."
        />

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
          className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
        >
          Guardar notas
        </button>
      </div>
    </section>
  );
}
