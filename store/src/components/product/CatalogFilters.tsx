"use client";

import { useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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

export function CatalogFilters({
  categories,
  activeCategory,
  activeOrder,
  activeSearch,
  totalProducts,
}: CatalogFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootCategories = categories.filter((c) => !c.parent_id);

  const FilterContent = () => (
    <div className="space-y-12 py-6">
      {/* Categories */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">CATEGORIAS</h3>
        <ul className="space-y-4">
          <li>
            <Link
              href="/catalogo"
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-[11px] font-semibold tracking-widest transition-colors hover:text-brand-gold",
                !activeCategory || activeCategory === "todas" ? "text-brand-gold" : "text-brand-midnight/50"
              )}
            >
              TODAS AS PEÇAS
            </Link>
          </li>
          {rootCategories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/catalogo?categoria=${cat.slug}`}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "text-[11px] font-semibold tracking-widest transition-colors hover:text-brand-gold",
                  activeCategory === cat.slug ? "text-brand-gold" : "text-brand-midnight/50"
                )}
              >
                {cat.name.toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Sort & Search Form */}
      <form className="space-y-12 pt-12 border-t border-brand-midnight/5">
        {/* Search */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">PESQUISAR</h3>
          <div className="group relative border-b border-brand-midnight/10 pb-2 transition-colors focus-within:border-brand-gold">
            <input
              name="busca"
              type="text"
              defaultValue={activeSearch ?? ""}
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
                  defaultChecked={activeOrder === opt.value || (!activeOrder && opt.value === "recentes")}
                  className="h-3 w-3 accent-brand-gold"
                />
                <span className="text-[11px] font-semibold tracking-widest text-brand-midnight/50 transition-colors group-hover:text-brand-midnight">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-brand-midnight py-4 text-[10px] font-bold tracking-[0.3em] text-brand-white transition-colors hover:bg-brand-gold"
        >
          APLICAR FILTROS
        </button>

        {(activeCategory || activeSearch || activeOrder) && (
          <Link
            href="/catalogo"
            onClick={() => setIsOpen(false)}
            className="block text-center text-[9px] font-bold tracking-[0.3em] text-brand-midnight/30 hover:text-red-600 transition-colors"
          >
            LIMPAR TUDO
          </Link>
        )}
      </form>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 lg:block">
        <FilterContent />
      </aside>

      {/* Mobile Filter Trigger */}
      <div className="flex items-center justify-between lg:hidden border-y border-brand-midnight/5 py-4 mb-8">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em]">
              <SlidersHorizontal className="h-4 w-4" />
              FILTROS
            </button>
          </SheetTrigger>
          <SheetContent className="glass border-none">
            <SheetHeader>
              <SheetTitle className="heading-luxury text-3xl font-light">Filtros</SheetTitle>
            </SheetHeader>
            <FilterContent />
          </SheetContent>
        </Sheet>
        <p className="text-[10px] font-bold tracking-[0.2em] text-brand-midnight/40">
          {totalProducts} PRODUTOS
        </p>
      </div>
    </>
  );
}
