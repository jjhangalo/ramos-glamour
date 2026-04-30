"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationBarProps = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
};

export function PaginationBar({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationBarProps) {
  const startRange = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRange = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className={cn("mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between", className)}>
      <p className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 md:text-left">
        Mostrando {startRange}-{endRange} de {totalCount} resultados encontrados
      </p>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-2 shadow-sm md:justify-end">
        <div className="flex items-center">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-11 rounded-md bg-transparent px-3 text-xs font-bold uppercase tracking-wider text-slate-700 outline-none focus:ring-0"
          >
            {[10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>
                {size} / página
              </option>
            ))}
          </select>
        </div>

        <div className="h-6 w-px bg-slate-200 md:mx-1" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex h-11 w-11 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900 min-w-[80px] text-center">
            Pág. {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex h-11 w-11 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
