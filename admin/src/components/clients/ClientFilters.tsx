"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ClientFiltersProps = {
  params: {
    estado?: string;
    pesquisa?: string;
  };
};

export function ClientFilters({ params }: ClientFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm transition hover:bg-slate-50",
            isOpen && "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
          )}
        >
          {isOpen ? <X className="h-3.5 w-3.5" /> : <Filter className="h-3.5 w-3.5" />}
          {isOpen ? "Fechar Filtros" : "Filtrar Clientes"}
        </button>

        {Object.values(params).some(Boolean) && !isOpen && (
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Filtros activos</span>
            <div className="h-1 w-1 rounded-full bg-emerald-500" />
          </div>
        )}
      </div>

      <div className={cn(
        "grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300",
        isOpen ? "opacity-100 translate-y-0" : "hidden opacity-0 -translate-y-2"
      )}>
        <form className="grid gap-3 md:grid-cols-[1.2fr_220px_auto]">
          <input
            type="search"
            name="pesquisa"
            defaultValue={params.pesquisa ?? ""}
            placeholder="Pesquisar por nome ou email"
            className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
          />
          <select
            name="estado"
            defaultValue={params.estado ?? "all"}
            className="w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
          >
            <option value="all">Todos os estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-slate-800"
          >
            Aplicar
          </button>
        </form>
      </div>
    </div>
  );
}
