"use client";

import { useTransition, useState } from "react";
import { migrateLegacyStatuses } from "@/lib/actions/orders";

export default function MigratePage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<any>(null);

  const handleMigrate = () => {
    startTransition(async () => {
      const res = await migrateLegacyStatuses();
      setResult(res);
    });
  };

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-bold">Migration Tool</h1>
      <p className="text-slate-600">
        Esta ferramenta normaliza os estados das encomendas (ex: 'delivering' para 'out_for_delivery').
      </p>
      
      <button
        disabled={isPending}
        onClick={handleMigrate}
        className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        {isPending ? "A processar..." : "Executar Migração"}
      </button>

      {result && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Resultado:</h2>
          <pre className="p-4 bg-slate-100 rounded border border-slate-200 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
          <p className="text-sm text-green-600 font-medium">
            Migração concluída. Podes agora apagar este ficheiro.
          </p>
        </div>
      )}
    </div>
  );
}
