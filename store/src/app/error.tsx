"use client";
 
import { useEffect } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para monitorização
    console.error("[GlobalError] Ocorreu um erro inesperado:", error);
  }, [error]);
 
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-midnight/5 text-brand-midnight/40">
        <AlertCircle className="h-8 w-8" />
      </div>
      
      <div className="space-y-2">
        <h2 className="heading-luxury text-2xl font-light text-brand-midnight">
          Algo não correu bem
        </h2>
        <p className="max-w-[400px] text-sm text-brand-midnight/40 leading-relaxed uppercase tracking-wider">
          Ocorreu um erro inesperado no processamento desta página. 
          Pode tentar recuperar o estado sem recarregar.
        </p>
      </div>
 
      <div className="mt-10 flex flex-col items-center gap-4">
        <button
          onClick={() => reset()}
          className="group flex items-center gap-2 rounded-full bg-brand-midnight px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-brand-gold active:scale-95"
        >
          <RefreshCw className="h-3 w-3 transition-transform group-hover:rotate-180 duration-500" />
          Tentar Novamente
        </button>
 
        <button
          onClick={() => window.location.reload()}
          className="text-[9px] font-bold uppercase tracking-widest text-brand-midnight/30 hover:text-brand-midnight transition-colors"
        >
          Ou recarregar a página inteira
        </button>
      </div>
 
      {error.digest && (
        <p className="mt-12 text-[8px] font-mono text-brand-midnight/20">
          ID do Erro: {error.digest}
        </p>
      )}
    </div>
  );
}
