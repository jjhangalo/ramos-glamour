"use client";

import { useState, useTransition } from "react";
import { Filter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Parse active filters from URL
  const activeStatus = searchParams.get("estado");
  const activeFeatured = searchParams.get("destaque");
  const activeCategories = searchParams.getAll("categoria");
  const activeSearch = searchParams.get("pesquisa");

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

  const handleApply = (formData: FormData) => {
    const params = new URLSearchParams();
    
    const estado = formData.get("estado") as string;
    if (estado && estado !== "all") params.set("estado", estado);

    const destaque = formData.get("destaque") as string;
    if (destaque && destaque !== "all") params.set("destaque", destaque);

    const pesquisa = formData.get("pesquisa") as string;
    if (pesquisa) params.set("pesquisa", pesquisa);

    const selectedCategories = formData.getAll("categoria") as string[];
    selectedCategories.forEach((c) => params.append("categoria", c));

    params.set("pagina", "1");
    params.set("limite", searchParams.get("limite") ?? "20");

    setIsOpen(false);
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  // Build active filters for shared component
  const activeFilters: FilterChip[] = [];
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
    <form action={handleApply} className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Pesquisar por nome
        </label>
        <input
          type="search"
          name="pesquisa"
          defaultValue={activeSearch ?? ""}
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
            name="estado"
            defaultValue={activeStatus ?? "all"}
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
            name="destaque"
            defaultValue={activeFeatured ?? "all"}
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
          {categories.map((category) => (
            <label
              key={category.id}
              className={cn(
                "flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs font-medium transition active:scale-95 cursor-pointer",
                activeCategories.includes(category.id) && "border-slate-900 bg-slate-900 text-white"
              )}
            >
              <input
                type="checkbox"
                name="categoria"
                value={category.id}
                defaultChecked={activeCategories.includes(category.id)}
                className="hidden"
              />
              <span className="truncate">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-slate-900 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition active:scale-95 disabled:opacity-50"
      >
        Aplicar Filtros
      </button>
    </form>
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
              trigger={
                <button
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

function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-11 items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm transition hover:border-slate-900 active:scale-95"
    >
      <span>{label}</span>
      <X className="h-3.5 w-3.5 text-slate-400" />
    </button>
  );
}
