"use client";

import { useState, useMemo } from "react";
import { Check, X, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

type Category = {
  id: string;
  name: string;
  parent_id?: string | null;
};

type CategoryComboboxProps = {
  categories: Category[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
};

export function CategoryCombobox({
  categories,
  selectedIds,
  onChange,
  disabled,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const flatCategories = useMemo(() => {
    return categories.map(c => {
      const parent = categories.find(p => p.id === c.parent_id);
      return {
        ...c,
        displayName: parent ? `${parent.name} · ${c.name}` : c.name
      };
    });
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const s = search.toLowerCase();
    const sorted = [...flatCategories].sort((a, b) => {
      const aSelected = selectedIds.includes(a.id);
      const bSelected = selectedIds.includes(b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.displayName.localeCompare(b.displayName);
    });

    if (!s) return sorted;
    return sorted.filter(c => c.displayName.toLowerCase().includes(s));
  }, [flatCategories, search, selectedIds]);

  const toggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedCategories = flatCategories.filter(c => selectedIds.includes(c.id));

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              "w-full h-12 justify-between rounded-xl border-brand-midnight/5 bg-white/50 font-normal transition hover:bg-white hover:border-brand-gold/30",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="text-brand-midnight/60 text-xs">
              {selectedIds.length === 0 ? "Seleccionar categorias..." : `${selectedIds.length} seleccionadas`}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-20" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[calc(100vw-32px)] sm:w-[400px] p-0 rounded-2xl shadow-2xl border-brand-midnight/10" align="start">
          <div className="flex flex-col">
            <div className="flex items-center border-b border-brand-midnight/5 px-4 py-3">
              <Search className="h-4 w-4 text-brand-midnight/20" />
              <input
                type="text"
                placeholder="Procurar categoria..."
                className="w-full bg-transparent px-3 py-1 text-sm outline-none placeholder:text-brand-midnight/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="max-h-[280px] overflow-y-auto p-2">
              {filteredCategories.map((category) => {
                const isSelected = selectedIds.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition active:scale-[0.98]",
                      isSelected 
                        ? "bg-brand-midnight text-white font-bold" 
                        : "text-brand-midnight/60 hover:bg-brand-midnight/5"
                    )}
                  >
                    <span className="truncate">{category.displayName}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                );
              })}
              {filteredCategories.length === 0 && (
                <p className="px-3 py-8 text-center text-xs text-brand-midnight/40 italic">
                  Nenhuma categoria encontrada.
                </p>
              )}
            </div>
            <div className="border-t border-brand-midnight/5 p-2 bg-brand-bg/10">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-xl bg-brand-midnight py-3 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-brand-charcoal"
              >
                Concluir
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-1.5 rounded-full border border-brand-midnight/5 bg-brand-midnight/5 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-midnight/60"
            >
              <span>{cat.displayName}</span>
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="ml-1 -my-1 flex h-6 w-6 items-center justify-center rounded-full text-brand-midnight/20 transition hover:bg-brand-midnight/10 hover:text-brand-midnight/40"
                aria-label={`Remover ${cat.displayName}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
