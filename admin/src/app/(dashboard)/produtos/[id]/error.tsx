"use client";
 
import { useEffect } from "react";
import { RefreshCw, PackageX } from "lucide-react";
import Link from "next/link";
 
export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ProductDetailError] Erro ao carregar produto:", error);
  }, [error]);
 
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-[3rem] border border-dashed border-brand-midnight/10 bg-brand-midnight/[0.01] p-12 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm text-brand-midnight/30">
        <PackageX className="h-8 w-8" />
      </div>
      
      <div className="space-y-2">
        <h2 className="heading-luxury text-xl font-medium text-brand-midnight">
          Erro ao Carregar Detalhes
        </h2>
        <p className="max-w-[360px] text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30 leading-relaxed">
          Houve um problema ao processar os dados deste produto.
          Isso pode dever-se a uma inconsistência na base de dados ou falha de rede.
        </p>
      </div>
 
      <div className="mt-10 flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-xl bg-brand-midnight px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-brand-gold active:scale-95"
        >
          <RefreshCw className="h-3 w-3" />
          Tentar Novamente
        </button>
 
        <Link
          href="/produtos"
          className="rounded-xl border border-brand-midnight/10 bg-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight transition-all hover:bg-brand-midnight/5"
        >
          Voltar à Lista
        </Link>
      </div>
    </div>
  );
}
