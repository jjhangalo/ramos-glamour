"use client";
 
import { useEffect } from "react";
import { RefreshCw, ShieldAlert } from "lucide-react";
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log técnico para administração
    console.error("[AdminGlobalError] Erro fatal detetado:", error);
  }, [error]);
 
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-white">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-midnight/5 text-brand-midnight/60">
        <ShieldAlert className="h-10 w-10" />
      </div>
      
      <div className="space-y-3">
        <h2 className="heading-luxury text-3xl font-light text-brand-midnight">
          Falha no Segmento
        </h2>
        <p className="max-w-[440px] text-[11px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30 leading-relaxed">
          O sistema de administração encontrou um erro técnico. 
          Pode tentar reiniciar o contexto da página abaixo.
        </p>
      </div>
 
      <div className="mt-12 flex flex-col items-center gap-6">
        <button
          onClick={() => reset()}
          className="group flex items-center gap-3 rounded-2xl bg-brand-midnight px-10 py-5 text-[11px] font-bold uppercase tracking-[0.25em] text-white shadow-xl shadow-brand-midnight/10 transition-all hover:bg-brand-gold hover:shadow-brand-gold/20 active:scale-95"
        >
          <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-700" />
          Reiniciar Contexto
        </button>
 
        <button
          onClick={() => window.location.reload()}
          className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/20 hover:text-brand-midnight transition-colors"
        >
          Forçar Recarregamento (F5)
        </button>
      </div>
 
      {error.digest && (
        <div className="mt-16 flex items-center gap-2 rounded-lg bg-brand-midnight/[0.03] px-3 py-1.5 font-mono text-[9px] text-brand-midnight/40">
          <span className="opacity-40">DIGEST:</span>
          <span>{error.digest}</span>
        </div>
      )}
    </div>
  );
}
