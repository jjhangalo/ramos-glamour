"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

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
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-xl font-semibold text-slate-950">
        Algo correu mal na aplicação
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        Ocorreu um erro ao carregar esta página. Tenta recarregar ou volta para
        o início.
      </p>
      {error.digest && (
        <code className="mt-4 rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">
          ID do Erro: {error.digest}
        </code>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <RotateCcw className="h-4 w-4" />
          Tentar novamente
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Ir para o Início
        </button>
      </div>
    </div>
  );
}
