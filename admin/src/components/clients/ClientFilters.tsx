"use client";

import { useState, useTransition, useEffect } from "react";
import { Search, SlidersHorizontal, X, Calendar, ArrowRight, RotateCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/custom-select";
import { DatePicker } from "@/components/ui/date-picker";
import { FadeUp } from "@/components/shared/Animations";

type ClientFiltersProps = {
  params: {
    estado?: string;
    pesquisa?: string;
    data?: string;
    dataInicio?: string;
    dataFim?: string;
  };
};

export function ClientFilters({ params }: ClientFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // Local state for filters
  const [search, setSearch] = useState(params.pesquisa ?? "");
  const [status, setStatus] = useState(params.estado ?? "all");
  const [date, setDate] = useState<Date | undefined>(
    params.data ? new Date(params.data) : undefined
  );
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    params.dataInicio ? new Date(params.dataInicio) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    params.dataFim ? new Date(params.dataFim) : undefined
  );

  // Update local state when params change (e.g. from URL)
  useEffect(() => {
    setSearch(params.pesquisa ?? "");
    setStatus(params.estado ?? "all");
    setDate(params.data ? new Date(params.data) : undefined);
    setDateFrom(params.dataInicio ? new Date(params.dataInicio) : undefined);
    setDateTo(params.dataFim ? new Date(params.dataFim) : undefined);
  }, [params]);

  const handleApply = (e?: React.FormEvent) => {
    e?.preventDefault();
    const newParams = new URLSearchParams(searchParams.toString());

    if (search) newParams.set("pesquisa", search);
    else newParams.delete("pesquisa");

    if (status && status !== "all") newParams.set("estado", status);
    else newParams.delete("estado");

    if (date) {
      newParams.set("data", format(date, "yyyy-MM-dd"));
      newParams.delete("dataInicio");
      newParams.delete("dataFim");
    } else {
      newParams.delete("data");
      if (dateFrom) newParams.set("dataInicio", format(dateFrom, "yyyy-MM-dd"));
      else newParams.delete("dataInicio");
      
      if (dateTo) newParams.set("dataFim", format(dateTo, "yyyy-MM-dd"));
      else newParams.delete("dataFim");
    }

    startTransition(() => {
      router.push(`?${newParams.toString()}`);
    });
  };

  const handleClear = () => {
    setSearch("");
    setStatus("all");
    setDate(undefined);
    setDateFrom(undefined);
    setDateTo(undefined);
    startTransition(() => {
      router.push("/clientes");
    });
  };

  const hasActiveFilters = 
    status !== "all" || 
    date !== undefined || 
    dateFrom !== undefined || 
    dateTo !== undefined;

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar & Toggle */}
      <div className="relative flex items-center gap-3">
        <form onSubmit={handleApply} className="relative flex-1 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-midnight/30 group-focus-within:text-brand-gold transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, email ou notas..."
            className="h-14 w-full rounded-2xl border border-brand-midnight/5 bg-brand-bg/20 pl-12 pr-4 text-sm outline-none transition focus:border-brand-gold/50 focus:bg-white focus:ring-1 focus:ring-brand-gold/50"
          />
        </form>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-14 items-center gap-3 rounded-2xl border px-6 text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95",
            isOpen || hasActiveFilters
              ? "border-brand-midnight bg-brand-midnight text-white shadow-lg shadow-brand-midnight/20"
              : "border-brand-midnight/5 bg-white text-brand-midnight/40 hover:bg-brand-bg/40"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
          {hasActiveFilters && (
            <span className="flex h-2 w-2 rounded-full bg-brand-gold" />
          )}
        </button>
      </div>

      {/* Expandable Filter Panel */}
      {isOpen && (
        <FadeUp className="rounded-3xl border border-brand-midnight/5 bg-brand-bg/10 p-4 md:p-8 shadow-inner">
          <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Status */}
            <div className="space-y-3">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                Estado do Perfil
              </label>
              <CustomSelect
                value={status}
                onChange={(val) => setStatus(val || "all")}
                options={[
                  { value: "all", label: "Todos os estados" },
                  { value: "active", label: "Contas Activas" },
                  { value: "inactive", label: "Contas Inactivas" },
                ]}
              />
            </div>

            {/* Specific Date */}
            <div className="space-y-3">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                Data de Registo
              </label>
              <DatePicker
                date={date}
                setDate={setDate}
                placeholder="Seleccionar dia único"
                disabled={!!(dateFrom || dateTo)}
              />
            </div>

            {/* Date Interval */}
            <div className="col-span-full grid gap-4 sm:grid-cols-2 md:col-span-2">
              <div className="space-y-3">
                <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                  Intervalo (De)
                </label>
                <DatePicker
                  date={dateFrom}
                  setDate={(d) => {
                    setDateFrom(d);
                    setDate(undefined);
                  }}
                  placeholder="Data inicial"
                />
              </div>
              <div className="space-y-3">
                <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                  Intervalo (Até)
                </label>
                <DatePicker
                  date={dateTo}
                  setDate={(d) => {
                    setDateTo(d);
                    setDate(undefined);
                  }}
                  placeholder="Data final"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-6 border-t border-brand-midnight/5 pt-8 md:mt-10 md:flex-row md:items-center md:justify-between">
            <button
              onClick={handleClear}
              className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-midnight/40 transition hover:text-red-500"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpar Tudo
            </button>

            <div className="flex flex-col-reverse gap-3 sm:flex-row md:items-center md:gap-4">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-midnight/60 transition hover:bg-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleApply}
                disabled={isPending}
                className="flex items-center justify-center gap-3 rounded-xl bg-brand-midnight px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white shadow-xl shadow-brand-midnight/20 transition active:scale-95 disabled:opacity-50 md:px-10"
              >
                {isPending ? "A processar..." : "Aplicar Filtros"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </FadeUp>
      )}
    </div>
  );
}

