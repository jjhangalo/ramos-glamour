"use client";

import { useEffect } from "react";
import { ServerCrash, RotateCcw } from "lucide-react";

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
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 shadow-sm border border-red-100">
        <ServerCrash className="h-10 w-10 text-red-600" />
      </div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-950">Erro de sistema</h1>
      <p className="mb-10 max-w-sm text-sm text-slate-500">
        Não foi possível processar este segmento da aplicação devido a uma falha inesperada no servidor.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-8 py-3.5 text-sm font-medium text-white shadow-sm transition duration-200 hover:bg-slate-800 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
