"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageCanvas } from "@/components/ui/page-canvas";

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
      "fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/80 backdrop-blur-md transition-all duration-500 pb-safe",
      show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
    )}>
      <PageCanvas size="form" className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-2 w-2 rounded-full",
            isSaving ? "animate-pulse bg-amber-500" : isDirty ? "bg-amber-500" : "bg-emerald-500"
          )} />
          <p className="text-sm font-medium text-slate-600">
            {isSaving ? "A guardar alterações..." : isDirty ? "Tens alterações não guardadas" : "Todas as alterações foram guardadas"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isDirty && !isSaving && (
            <button
              onClick={onReset}
              className="rounded-md px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Descartar
            </button>
          )}
          <button
            disabled={!isDirty || isSaving}
            onClick={onSave}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-6 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isSaving ? "A guardar..." : "Guardar Alterações"}
          </button>
        </div>
      </PageCanvas>
    </div>
  );
}
