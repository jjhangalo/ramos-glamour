"use client";

import { useState, useMemo } from "react";
import { Check, X, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover } from "@/components/ui/popover";

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
      <Popover
        trigger={
          <div className={cn(
            "flex min-h-[44px] w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm transition focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}>
            <span className="text-slate-500">
              {selectedIds.length === 0 ? "Seleccionar categorias..." : `${selectedIds.length} seleccionadas`}
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        }
        width="w-full"
        className="p-0 overflow-hidden"
      >
        <div className="flex flex-col">
          <div className="flex items-center border-b border-slate-100 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Procurar categoria..."
              className="w-full bg-transparent px-2 py-1 text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredCategories.map((category) => {
              const isSelected = selectedIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition hover:bg-slate-50",
                    isSelected && "bg-slate-50 text-slate-950 font-medium"
                  )}
                >
                  <span>{category.displayName}</span>
                  {isSelected && <Check className="h-4 w-4 text-emerald-600" />}
                </button>
              );
            })}
            {filteredCategories.length === 0 && (
              <p className="px-3 py-4 text-center text-xs text-slate-500">
                Nenhuma categoria encontrada.
              </p>
            )}
          </div>
        </div>
      </Popover>

      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
            >
              <span>{cat.displayName}</span>
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="ml-1 -my-2 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 active:bg-slate-200"
                aria-label={`Remover ${cat.displayName}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
