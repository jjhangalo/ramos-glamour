"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterChip = {
  key: string;
  label: string;
  value?: string;
};

type FilterChipRowProps = {
  activeFilters: FilterChip[];
  onRemoveFilter: (key: string, value?: string) => void;
  onOpenSheet?: () => void;
  trigger?: React.ReactNode;
  className?: string;
};

export function FilterChipRow({
  activeFilters,
  onRemoveFilter,
  onOpenSheet,
  trigger,
  className,
}: FilterChipRowProps) {
  const hasFilters = activeFilters.length > 0;

  return (
    <div className={cn("relative z-30 flex items-center gap-2", className)}>
      {/* Trigger stays outside the overflow container */}
      <div className="shrink-0">
        {trigger ? (
          trigger
        ) : (
          <button
            onClick={onOpenSheet}
            className={cn(
              "flex h-11 items-center gap-3 rounded-full border border-slate-200 bg-white px-6 text-slate-600 shadow-sm transition hover:bg-slate-50",
              hasFilters && "border-slate-900 bg-slate-900 text-white"
            )}
          >
            <Search className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Pesquisa & Filtros</span>
          </button>
        )}
      </div>

      {/* Chips are in the overflow container */}
      <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {activeFilters.map((filter) => (
          <button
            key={`${filter.key}-${filter.value ?? ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFilter(filter.key, filter.value);
            }}
            className="flex h-11 items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm transition hover:border-slate-900 active:scale-95"
          >
            <span>{filter.label}</span>
            <X className="h-3.5 w-3.5 text-slate-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
