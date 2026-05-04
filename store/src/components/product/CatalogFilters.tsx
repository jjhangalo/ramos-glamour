"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

type CatalogFiltersProps = {
  categories: Category[];
  activeCategory?: string;
  activeOrder?: string;
  activeSearch?: string;
  totalProducts: number;
};

type DraftFilters = {
  categoria?: string;
  ordem?: string;
  busca?: string;
};

type FilterContentProps = {
  categories: Category[];
  rootCategories: Category[];
  draftFilters: DraftFilters;
  setDraftFilters: React.Dispatch<React.SetStateAction<DraftFilters>>;
  handleApply: (e?: React.FormEvent) => void;
  handleClear: () => void;
};

function FilterContent({
  categories,
  rootCategories,
  draftFilters,
  setDraftFilters,
  handleApply,
  handleClear,
}: FilterContentProps) {
  const toggleCategory = (slug: string) => {
    setDraftFilters(prev => ({
      ...prev,
      categoria: prev.categoria === slug ? "todas" : slug
    }));
  };

  const hasDraftFilters = (draftFilters.categoria && draftFilters.categoria !== "todas") || draftFilters.busca || (draftFilters.ordem && draftFilters.ordem !== "recentes");

  return (
    <div className="space-y-12 py-6">
      {/* Draft Chips (Visual Feedback inside the selector) */}
      {hasDraftFilters && (
        <div className="space-y-4 pb-10 border-b border-brand-midnight/5 animate-in fade-in slide-in-from-top-4 duration-500">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold">SELECIONADOS</h3>
          <div className="flex flex-wrap gap-2">
            {draftFilters.categoria && draftFilters.categoria !== "todas" && (
              <button 
                onClick={() => setDraftFilters(prev => ({ ...prev, categoria: "todas" }))}
                className="flex items-center gap-1.5 bg-brand-gold/10 px-3 py-1.5 text-[9px] font-bold tracking-widest text-brand-gold uppercase border border-brand-gold/20"
              >
                {categories.find(c => c.slug === draftFilters.categoria)?.name}
                <X className="h-3 w-3" />
              </button>
            )}
            {draftFilters.busca && (
              <button 
                onClick={() => setDraftFilters(prev => ({ ...prev, busca: "" }))}
                className="flex items-center gap-1.5 bg-brand-gold/10 px-3 py-1.5 text-[9px] font-bold tracking-widest text-brand-gold uppercase border border-brand-gold/20"
              >
                &quot;{draftFilters.busca}&quot;
                <X className="h-3 w-3" />
              </button>
            )}
            {draftFilters.ordem && draftFilters.ordem !== "recentes" && (
              <button 
                onClick={() => setDraftFilters(prev => ({ ...prev, ordem: "recentes" }))}
                className="flex items-center gap-1.5 bg-brand-gold/10 px-3 py-1.5 text-[9px] font-bold tracking-widest text-brand-gold uppercase border border-brand-gold/20"
              >
                {draftFilters.ordem === "preco-asc" ? "MENOR PREÇO" : "MAIOR PREÇO"}
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">CATEGORIAS</h3>
        <ul className="space-y-4">
          <li>
            <button
              type="button"
              onClick={() => setDraftFilters(prev => ({ ...prev, categoria: "todas" }))}
              className={cn(
                "group flex items-center gap-3 text-[11px] font-semibold tracking-widest transition-all hover:text-brand-gold text-left",
                (!draftFilters.categoria || draftFilters.categoria === "todas") ? "text-brand-gold" : "text-brand-midnight/50"
              )}
            >
              <span className={cn(
                "flex h-4 w-4 items-center justify-center border transition-all",
                (!draftFilters.categoria || draftFilters.categoria === "todas") ? "border-brand-gold bg-brand-gold text-brand-white" : "border-brand-midnight/10 group-hover:border-brand-gold"
              )}>
                {(!draftFilters.categoria || draftFilters.categoria === "todas") && <Check className="h-2.5 w-2.5" />}
              </span>
              TODAS AS PEÇAS
            </button>
          </li>
          {rootCategories.map((cat) => {
            const isSelected = draftFilters.categoria === cat.slug;
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.slug)}
                  className={cn(
                    "group flex items-center gap-3 text-[11px] font-semibold tracking-widest transition-all hover:text-brand-gold text-left",
                    isSelected ? "text-brand-gold" : "text-brand-midnight/50"
                  )}
                >
                  <span className={cn(
                    "flex h-4 w-4 items-center justify-center border transition-all",
                    isSelected ? "border-brand-gold bg-brand-gold text-brand-white" : "border-brand-midnight/10 group-hover:border-brand-gold"
                  )}>
                    {isSelected && <Check className="h-2.5 w-2.5" />}
                  </span>
                  {cat.name.toUpperCase()}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Sort & Search Form */}
      <form onSubmit={handleApply} className="space-y-12 pt-12 border-t border-brand-midnight/5">
        {/* Search */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">PESQUISAR</h3>
          <div className="group relative border-b border-brand-midnight/10 pb-2 transition-colors focus-within:border-brand-gold">
            <input
              name="busca"
              type="text"
              value={draftFilters.busca || ""}
              onChange={(e) => setDraftFilters(prev => ({ ...prev, busca: e.target.value }))}
              placeholder="DIGITE AQUI..."
              className="w-full bg-transparent text-[11px] font-semibold tracking-widest outline-none placeholder:text-brand-midnight/20"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">ORDENAR</h3>
          <div className="space-y-3">
            {[
              { value: "recentes", label: "MAIS RECENTES" },
              { value: "preco-asc", label: "MENOR PREÇO" },
              { value: "preco-desc", label: "MAIOR PREÇO" },
            ].map((opt) => (
              <label key={opt.value} className="flex cursor-pointer items-center gap-3 group">
                <input
                  type="radio"
                  name="ordem"
                  value={opt.value}
                  checked={draftFilters.ordem === opt.value || (!draftFilters.ordem && opt.value === "recentes")}
                  onChange={() => setDraftFilters(prev => ({ ...prev, ordem: opt.value }))}
                  className="h-3 w-3 accent-brand-gold"
                />
                <span className="text-[11px] font-semibold tracking-widest text-brand-midnight/50 transition-colors group-hover:text-brand-midnight">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            className="w-full bg-brand-midnight py-4 text-[10px] font-bold tracking-[0.3em] text-brand-white transition-colors hover:bg-brand-gold"
          >
            APLICAR FILTROS
          </button>

          {(draftFilters.categoria !== "todas" || draftFilters.busca || draftFilters.ordem) && (
            <button
              type="button"
              onClick={handleClear}
              className="w-full text-center text-[9px] font-bold tracking-[0.3em] text-brand-midnight/30 hover:text-red-600 transition-colors"
            >
              LIMPAR TUDO
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export function CatalogFilters({
  categories,
  activeCategory,
  activeOrder,
  activeSearch,
  totalProducts,
}: CatalogFiltersProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<DraftFilters>({
    categoria: activeCategory,
    ordem: activeOrder,
    busca: activeSearch,
  });

  const rootCategories = useMemo(() => 
    categories.filter((c) => !c.parent_id),
    [categories]
  );

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDraftFilters({
        categoria: activeCategory,
        ordem: activeOrder,
        busca: activeSearch,
      });
    }
    setIsOpen(open);
  };

  const handleApply = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (draftFilters.categoria && draftFilters.categoria !== "todas") {
      params.set("categoria", draftFilters.categoria);
    }
    if (draftFilters.ordem) {
      params.set("ordem", draftFilters.ordem);
    }
    if (draftFilters.busca) {
      params.set("busca", draftFilters.busca);
    }

    router.push(`/catalogo?${params.toString()}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    setDraftFilters({
      categoria: "todas",
      ordem: "recentes",
      busca: "",
    });
  };

  const removeFilter = (key: keyof DraftFilters) => {
    const params = new URLSearchParams();
    if (activeCategory && key !== "categoria" && activeCategory !== "todas") params.set("categoria", activeCategory);
    if (activeOrder && key !== "ordem" && activeOrder !== "recentes") params.set("ordem", activeOrder);
    if (activeSearch && key !== "busca") params.set("busca", activeSearch);
    
    router.push(`/catalogo?${params.toString()}`);
  };

  const activeCategoryName = useMemo(() => 
    categories.find(c => c.slug === activeCategory)?.name,
    [categories, activeCategory]
  );

  const filtersKey = `${activeCategory}-${activeOrder}-${activeSearch}`;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 lg:block">
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] mb-8 border-b border-brand-midnight/5 pb-4">
          <SlidersHorizontal className="h-4 w-4" />
          FILTROS
        </div>
        <FilterContent 
          key={filtersKey}
          categories={categories}
          rootCategories={rootCategories}
          draftFilters={draftFilters}
          setDraftFilters={setDraftFilters}
          handleApply={handleApply}
          handleClear={handleClear}
        />
      </aside>

      {/* Mobile Filter Trigger & Chip Row */}
      <div className="lg:hidden space-y-4 mb-8">
        <div className="flex items-center justify-between border-y border-brand-midnight/5 py-4">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
            <Sheet open={isOpen} onOpenChange={handleOpenChange}>
              <SheetTrigger asChild>
                <button className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] shrink-0">
                  <SlidersHorizontal className="h-4 w-4" />
                  FILTROS
                </button>
              </SheetTrigger>
              <SheetContent className="glass border-none overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="heading-luxury text-3xl font-light">Filtros</SheetTitle>
                  <SheetDescription className="sr-only">
                    Ajuste os filtros para encontrar os produtos desejados.
                  </SheetDescription>
                </SheetHeader>
                <FilterContent 
                  key={filtersKey}
                  categories={categories}
                  rootCategories={rootCategories}
                  draftFilters={draftFilters}
                  setDraftFilters={setDraftFilters}
                  handleApply={handleApply}
                  handleClear={handleClear}
                />
              </SheetContent>
            </Sheet>

            {/* Chip Row */}
            <div className="flex items-center gap-2">
              {activeCategory && activeCategory !== "todas" && (
                <button 
                  onClick={() => removeFilter("categoria")}
                  className="flex items-center gap-1.5 whitespace-nowrap bg-brand-midnight/5 px-3 py-1.5 text-[9px] font-bold tracking-widest text-brand-midnight uppercase"
                >
                  {activeCategoryName}
                  <X className="h-3 w-3" />
                </button>
              )}
              {activeSearch && (
                <button 
                  onClick={() => removeFilter("busca")}
                  className="flex items-center gap-1.5 whitespace-nowrap bg-brand-midnight/5 px-3 py-1.5 text-[9px] font-bold tracking-widest text-brand-midnight uppercase"
                >
                  &quot;{activeSearch}&quot;
                  <X className="h-3 w-3" />
                </button>
              )}
              {activeOrder && activeOrder !== "recentes" && (
                <button 
                  onClick={() => removeFilter("ordem")}
                  className="flex items-center gap-1.5 whitespace-nowrap bg-brand-midnight/5 px-3 py-1.5 text-[9px] font-bold tracking-widest text-brand-midnight uppercase"
                >
                  {activeOrder === "preco-asc" ? "MENOR PREÇO" : "MAIOR PREÇO"}
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <p className="text-[10px] font-bold tracking-[0.2em] text-brand-midnight/40 shrink-0 ml-4">
            {totalProducts} PRODUTOS
          </p>
        </div>
      </div>
    </>
  );
}
