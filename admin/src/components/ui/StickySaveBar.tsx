"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
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
}: StickySaveBarProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isDirty || isSaving) {
      setShow(true);
    } else {
      setShow(false);
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
      "fixed bottom-0 left-0 right-0 z-50 border-t border-brand-midnight/5 bg-brand-bg/95 backdrop-blur-xl transition-all duration-500",
      "pb-[env(safe-area-inset-bottom)]",
      show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
    )}>
      <PageCanvas size="form" className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col">
          <p className="text-sm font-bold text-brand-midnight">
            {isSaving ? "A guardar..." : "Alterações pendentes"}
          </p>
          <p className="hidden text-[10px] font-medium uppercase tracking-widest text-brand-midnight/40 sm:block">
            {isSaving ? "Isto pode levar alguns segundos." : "Clica em guardar para aplicar as alterações."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isSaving && (
            <button
              onClick={onReset}
              className="rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest text-brand-midnight/40 transition hover:bg-brand-midnight/5 active:scale-95"
            >
              Descartar
            </button>
          )}
          <button
            disabled={!isDirty || isSaving}
            onClick={onSave}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-brand-midnight px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-xl shadow-brand-midnight/10 transition hover:bg-brand-charcoal active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar
          </button>
        </div>
      </PageCanvas>
    </div>
  );
}
