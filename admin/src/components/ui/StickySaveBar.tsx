"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type StickySaveBarProps = {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
  lastSaved?: Date;
};

export function StickySaveBar({
  isDirty,
  isSaving,
  onSave,
  onReset,
  lastSaved,
}: StickySaveBarProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isDirty || isSaving) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isDirty, isSaving]);

  // Navigation blocking
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "Tens alterações não guardadas. Sair mesmo assim?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  if (!show && !isDirty && !isSaving) return null;

  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 z-50 w-full max-w-4xl -translate-x-1/2 px-4 transition-all duration-300",
      show ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
    )}>
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-950 bg-slate-900 p-4 shadow-2xl text-white">
        <div className="flex flex-col">
          <p className="text-sm font-semibold">
            {isSaving ? "A guardar alterações..." : isDirty ? "Tens alterações não guardadas" : "Alterações guardadas"}
          </p>
          {lastSaved && !isDirty && !isSaving && (
            <p className="text-[10px] text-slate-400">
              Guardado às {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {isDirty && !isSaving && (
            <button
              onClick={onReset}
              className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700"
            >
              <RotateCcw className="h-3 w-3" />
              DESCARTAR
            </button>
          )}
          <button
            disabled={!isDirty || isSaving}
            onClick={onSave}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-xs font-bold text-slate-950 transition hover:bg-slate-100 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isSaving ? "A GUARDAR" : "GUARDAR ALTERAÇÕES"}
          </button>
        </div>
      </div>
    </div>
  );
}
