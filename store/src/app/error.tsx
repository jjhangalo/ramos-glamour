"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-mauve/10 shadow-sm">
        <AlertTriangle className="h-12 w-12 text-brand-mauve" />
      </div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-brand-charcoal">Algo correu mal</h1>
      <p className="mb-10 max-w-md text-muted-foreground">
        Não foi possível carregar esta secção devido a um erro inesperado. 
        Por favor, tente novamente ou contacte o suporte se o problema persistir.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="inline-flex items-center gap-2 rounded-full bg-brand-olive px-10 py-4 text-lg font-medium text-brand-white shadow-lg transition duration-300 hover:bg-[#8a904d] hover:shadow-xl active:scale-95"
      >
        <RotateCcw className="h-5 w-5" />
        Tentar novamente
      </button>
    </div>
  );
}
