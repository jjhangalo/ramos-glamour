"use client";

import { useState, useTransition } from "react";
import { BellOff, Loader2, Moon, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { updateDndSettings } from "@/lib/actions/settings";
import type { ClientRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

type DndFormProps = {
  admin: ClientRecord;
};

export function DndForm({ admin }: DndFormProps) {
  const [isPending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(admin.dnd_enabled ?? false);
  const [startTime, setStartTime] = useState(admin.dnd_start_time || "22:00");
  const [endTime, setEndTime] = useState(admin.dnd_end_time || "07:00");

  async function handleSave() {
    startTransition(async () => {
      try {
        const result = await updateDndSettings(enabled, startTime, endTime);
        if (result.success) {
          toast.success("Definições DND atualizadas!");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar DND");
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between p-6 rounded-3xl bg-brand-bg/50 border border-brand-midnight/5">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl transition-all shadow-sm",
            enabled ? "bg-brand-gold text-white" : "bg-brand-midnight/5 text-brand-midnight/20"
          )}>
            <Moon className={cn("h-6 w-6", enabled && "animate-pulse")} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-midnight">Modo Não Incomodar</h3>
            <p className="text-[10px] font-medium text-brand-midnight/40">
              Silencia notificações Web Push durante o horário selecionado.
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setEnabled(!enabled)}
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
            enabled ? "bg-brand-gold" : "bg-brand-midnight/10"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              enabled ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      <div className={cn(
        "grid gap-6 transition-all duration-300 sm:grid-cols-2",
        !enabled && "opacity-40 grayscale pointer-events-none"
      )}>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-midnight/40 ml-1">
            <Clock className="h-3 w-3" /> Início do Silêncio
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-2xl border border-brand-midnight/5 bg-white px-5 py-3.5 text-sm font-bold text-brand-midnight outline-none transition-all focus:border-brand-gold/30 focus:ring-8 focus:ring-brand-gold/5"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-midnight/40 ml-1">
            <BellOff className="h-3 w-3" /> Fim do Silêncio
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-2xl border border-brand-midnight/5 bg-white px-5 py-3.5 text-sm font-bold text-brand-midnight outline-none transition-all focus:border-brand-gold/30 focus:ring-8 focus:ring-brand-gold/5"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 rounded-2xl bg-brand-midnight px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-brand-midnight/90 active:scale-95 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar Definições DND
        </button>
      </div>
    </div>
  );
}
