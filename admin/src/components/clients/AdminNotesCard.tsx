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
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Notas internas</h2>
          <p className="text-sm text-slate-500">
            Campo reservado ao backoffice. Não é visível na loja.
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
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          {isActive ? "Desactivar conta" : "Activar conta"}
        </button>
      </div>

      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={6}
        className="mt-5 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
        placeholder="Observações internas sobre este cliente"
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
        className="mt-4 rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Guardar notas
      </button>
    </section>
  );
}
