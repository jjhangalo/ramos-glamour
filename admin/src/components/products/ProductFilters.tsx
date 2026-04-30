"use client";

import { useState, useTransition } from "react";
import { Filter, X, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import { FilterChipRow, type FilterChip } from "@/components/list/FilterChipRow";
import { Popover } from "@/components/ui/popover";
import { useMediaQuery } from "@/hooks/use-media-query";

type Category = {
  id: string;
  name: string;
};

type ProductFiltersProps = {
  categories: Category[];
};

type DraftFilters = {
  estado: string;
  destaque: string;
  pesquisa: string;
  categorias: string[];
};

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Local draft state initialized from URL
  const [draft, setDraft] = useState<DraftFilters>({
    estado: searchParams.get("estado") || "all",
    destaque: searchParams.get("destaque") || "all",
    pesquisa: searchParams.get("pesquisa") || "",
    categorias: searchParams.getAll("categoria"),
  });

  // Unique key to reset draft state when opening or when URL changes externally
  const filtersKey = `${isOpen}-${searchParams.toString()}`;
  
  // Sync draft state when filtersKey changes (e.g. when opening the sheet/popover or URL changes)
  const [prevKey, setPrevKey] = useState(filtersKey);
  if (filtersKey !== prevKey) {
    setPrevKey(filtersKey);
    setDraft({
      estado: searchParams.get("estado") || "all",
      destaque: searchParams.get("destaque") || "all",
      pesquisa: searchParams.get("pesquisa") || "",
      categorias: searchParams.getAll("categoria"),
    });
  }

  const removeFilter = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "categoria" && value) {
      const current = params.getAll("categoria");
      params.delete("categoria");
      current.filter((c) => c !== value).forEach((c) => params.append("categoria", c));
    } else {
      params.delete(key);
    }
    params.set("pagina", "1");
    router.push(`?${params.toString()}`);
  };

  const handleApply = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    
    if (draft.estado && draft.estado !== "all") params.set("estado", draft.estado);
    if (draft.destaque && draft.destaque !== "all") params.set("destaque", draft.destaque);
    if (draft.pesquisa) params.set("pesquisa", draft.pesquisa);
    draft.categorias.forEach((c) => params.append("categoria", c));

    params.set("pagina", "1");
    params.set("limite", searchParams.get("limite") ?? "20");

    setIsOpen(false);
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const toggleCategory = (id: string) => {
    setDraft(prev => ({
      ...prev,
      categorias: prev.categorias.includes(id)
        ? prev.categorias.filter(c => c !== id)
        : [...prev.categorias, id]
    }));
  };

  // Build active filters for shared component
  const activeFilters: FilterChip[] = [];
  const activeSearch = searchParams.get("pesquisa");
  const activeStatus = searchParams.get("estado");
  const activeFeatured = searchParams.get("destaque");
  const activeCategories = searchParams.getAll("categoria");

  if (activeSearch) activeFilters.push({ key: "pesquisa", label: `"${activeSearch}"` });
  if (activeStatus && activeStatus !== "all") {
    activeFilters.push({ key: "estado", label: activeStatus === "active" ? "Activo" : "Inactivo" });
  }
  if (activeFeatured && activeFeatured !== "all") {
    activeFilters.push({ key: "destaque", label: activeFeatured === "true" ? "Destacado" : "Regular" });
  }
  activeCategories.forEach((catId) => {
    const cat = categories.find((c) => c.id === catId);
    if (cat) activeFilters.push({ key: "categoria", label: cat.name, value: catId });
  });

  const filterForm = (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Pesquisar por nome
        </label>
        <input
          type="search"
          value={draft.pesquisa}
          onChange={(e) => setDraft(prev => ({ ...prev, pesquisa: e.target.value }))}
          placeholder="Ex: T-shirt branca..."
          className="w-full rounded-md border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Status */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Estado
          </label>
          <select
            value={draft.estado}
            onChange={(e) => setDraft(prev => ({ ...prev, estado: e.target.value }))}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        {/* Featured */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Destaque
          </label>
          <select
            value={draft.destaque}
            onChange={(e) => setDraft(prev => ({ ...prev, destaque: e.target.value }))}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
          >
            <option value="all">Todos</option>
            <option value="true">Destacados</option>
            <option value="false">Não destacados</option>
          </select>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Categorias (Multi-selecção)
        </label>
        <div className="grid max-h-[160px] grid-cols-1 gap-2 overflow-y-auto pr-2">
          {categories.map((category) => {
            const isSelected = draft.categorias.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  "flex items-center justify-between rounded-md border px-3 py-2.5 text-xs font-medium transition cursor-pointer",
                  isSelected 
                    ? "border-slate-900 bg-slate-900 text-white" 
                    : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
                )}
              >
                <span className="truncate">{category.name}</span>
                {isSelected && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => handleApply()}
        disabled={isPending}
        className="w-full rounded-md bg-slate-900 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition active:scale-95 disabled:opacity-50"
      >
        {isPending ? "A aplicar..." : "Aplicar Filtros"}
      </button>
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
              <SheetTitle>Filtrar Catálogo</SheetTitle>
              <SheetDescription className="sr-only">
                Ajuste os filtros para encontrar produtos específicos no catálogo.
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
            <Popover
              open={isOpen}
              onOpenChange={setIsOpen}
              trigger={
                <button
                  type="button"
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50",
                    hasFilters && "border-slate-900 bg-slate-900 text-white"
                  )}
                >
                  <Filter className="h-4 w-4" />
                </button>
              }
              className="mt-1"
            >
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Filtros
                </h3>
                {filterForm}
              </div>
            </Popover>
          }
        />
      )}
    </div>
  );
}
