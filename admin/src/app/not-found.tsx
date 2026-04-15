import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 shadow-sm border border-slate-200">
        <SearchX className="h-10 w-10 text-slate-400" />
      </div>
      <h1 className="mb-2 text-5xl font-bold tracking-tight text-slate-950">404</h1>
      <h2 className="mb-6 text-xl font-semibold text-slate-700">Recurso não encontrado</h2>
      <p className="mb-10 max-w-sm text-sm text-slate-500">
        O caminho que tentou aceder não corresponde a uma rota de administração válida ou o recurso foi removido.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-8 py-3.5 text-sm font-medium text-white shadow-sm transition duration-200 hover:bg-slate-800 active:scale-95"
      >
        Voltar à Dashboard
      </Link>
    </div>
  );
}
