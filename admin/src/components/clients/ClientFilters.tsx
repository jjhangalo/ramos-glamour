"use client";

import { useState, useTransition } from "react";
import { Filter, Check, RotateCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import { FilterChipRow, type FilterChip } from "@/components/list/FilterChipRow";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { DatePicker } from "@/components/ui/date-picker";
import { useMediaQuery } from "@/hooks/use-media-query";

type ClientFiltersProps = {
  params: {
    estado?: string;
    pesquisa?: string;
    data?: string;
    dataInicio?: string;
    dataFim?: string;
  };
};

type DraftFilters = {
  estado: string;
  pesquisa: string;
  data: Date | undefined;
  dataInicio: Date | undefined;
  dataFim: Date | undefined;
};

export function ClientFilters({ params }: ClientFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Local draft state initialized from URL params
  const [draft, setDraft] = useState<DraftFilters>({
    estado: params.estado || "all",
    pesquisa: params.pesquisa || "",
    data: params.data ? new Date(params.data) : undefined,
    dataInicio: params.dataInicio ? new Date(params.dataInicio) : undefined,
    dataFim: params.dataFim ? new Date(params.dataFim) : undefined,
  });

  // Unique key to reset draft state when opening or when URL changes externally
  const filtersKey = `${isOpen}-${searchParams.toString()}`;
  
  // Sync draft state when filtersKey changes
  const [prevKey, setPrevKey] = useState(filtersKey);
  if (filtersKey !== prevKey) {
    setPrevKey(filtersKey);
    setDraft({
      estado: params.estado || "all",
      pesquisa: params.pesquisa || "",
      data: params.data ? new Date(params.data) : undefined,
      dataInicio: params.dataInicio ? new Date(params.dataInicio) : undefined,
      dataFim: params.dataFim ? new Date(params.dataFim) : undefined,
    });
  }

  const removeFilter = (key: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete(key);
    newParams.set("pagina", "1");
    router.push(`?${newParams.toString()}`);
  };

  const handleApply = (e?: React.FormEvent) => {
    e?.preventDefault();
    const newParams = new URLSearchParams();
    
    if (draft.pesquisa) newParams.set("pesquisa", draft.pesquisa);
    if (draft.estado && draft.estado !== "all") newParams.set("estado", draft.estado);
    
    if (draft.data) {
      newParams.set("data", format(draft.data, "yyyy-MM-dd"));
    } else {
      if (draft.dataInicio) newParams.set("dataInicio", format(draft.dataInicio, "yyyy-MM-dd"));
      if (draft.dataFim) newParams.set("dataFim", format(draft.dataFim, "yyyy-MM-dd"));
    }

    newParams.set("pagina", "1");
    newParams.set("limite", searchParams.get("limite") ?? "12");

    setIsOpen(false);
    startTransition(() => {
      router.push(`?${newParams.toString()}`);
    });
  };

  const handleClear = () => {
    setDraft({
      estado: "all",
      pesquisa: "",
      data: undefined,
      dataInicio: undefined,
      dataFim: undefined,
    });
    setIsOpen(false);
    startTransition(() => {
      router.push("/clientes");
    });
  };

  // Build active filters for shared component
  const activeFilters: FilterChip[] = [];
  if (params.pesquisa) activeFilters.push({ key: "pesquisa", label: `"${params.pesquisa}"` });
  if (params.estado && params.estado !== "all") {
    activeFilters.push({ key: "estado", label: params.estado === "active" ? "Activo" : "Inactivo" });
  }
  if (params.data) activeFilters.push({ key: "data", label: format(new Date(params.data), "dd/MM/yyyy") });
  if (params.dataInicio) activeFilters.push({ key: "dataInicio", label: `De ${format(new Date(params.dataInicio), "dd/MM/yyyy")}` });
  if (params.dataFim) activeFilters.push({ key: "dataFim", label: `Até ${format(new Date(params.dataFim), "dd/MM/yyyy")}` });

  const filterForm = (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-brand-midnight/40">
          Pesquisar por nome ou email
        </label>
        <input
          type="search"
          value={draft.pesquisa}
          onChange={(e) => setDraft(prev => ({ ...prev, pesquisa: e.target.value }))}
          placeholder="Ex: Ana Silva..."
          className="w-full rounded-xl border border-brand-midnight/5 bg-brand-bg/50 px-4 py-3 text-sm outline-none focus:border-brand-gold/50 transition-colors"
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-brand-midnight/40">
          Estado da Conta
        </label>
        <CustomSelect
          value={draft.estado}
          onChange={(val) => setDraft(prev => ({ ...prev, estado: val || "all" }))}
          options={[
            { value: "all", label: "Todos os estados" },
            { value: "active", label: "Contas Activas" },
            { value: "inactive", label: "Contas Inactivas" },
          ]}
        />
      </div>

      {/* Date Filters */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-brand-midnight/40">
            Registo em Data Específica
          </label>
          <DatePicker
            date={draft.data}
            setDate={(d) => setDraft(prev => ({ ...prev, data: d, dataInicio: undefined, dataFim: undefined }))}
            placeholder="Seleccionar dia"
          />
        </div>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-brand-midnight/5" />
          </div>
          <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-widest text-brand-midnight/20">
            <span className="bg-white px-2">ou intervalo</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-midnight/40">
              De
            </label>
            <DatePicker
              date={draft.dataInicio}
              setDate={(d) => setDraft(prev => ({ ...prev, dataInicio: d, data: undefined }))}
              placeholder="Início"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-midnight/40">
              Até
            </label>
            <DatePicker
              date={draft.dataFim}
              setDate={(d) => setDraft(prev => ({ ...prev, dataFim: d, data: undefined }))}
              placeholder="Fim"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <button
          onClick={handleApply}
          disabled={isPending}
          className="w-full rounded-xl bg-brand-midnight py-4 text-[10px] font-bold uppercase tracking-widest text-brand-white shadow-lg transition active:scale-[0.98] disabled:opacity-50 hover:bg-brand-charcoal"
        >
          {isPending ? "A APLICAR..." : "APLICAR FILTROS"}
        </button>
        
        {activeFilters.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center justify-center gap-2 py-2 text-[9px] font-bold uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Limpar Filtros
          </button>
        )}
      </div>
    </div>
  );

  const hasFilters = activeFilters.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {!isDesktop ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <FilterChipRow
            activeFilters={activeFilters}
            onRemoveFilter={removeFilter}
            onOpenSheet={() => setIsOpen(true)}
          />
          <SheetContent side="bottom" className="rounded-t-[2rem] px-6 pb-10 pt-8">
            <SheetHeader>
              <SheetTitle>Filtrar Clientes</SheetTitle>
              <SheetDescription className="sr-only">
                Ajuste os filtros para encontrar clientes específicos.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              {filterForm}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <FilterChipRow
          activeFilters={activeFilters}
          onRemoveFilter={removeFilter}
          trigger={
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant={hasFilters ? "default" : "outline"}
                  size="icon"
                  className="rounded-full h-11 w-11 shadow-sm border-brand-midnight/5"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-midnight">
                    Filtros
                  </h3>
                  {filterForm}
                </div>
              </PopoverContent>
            </Popover>
          }
        />
      )}
    </div>
  );
}
