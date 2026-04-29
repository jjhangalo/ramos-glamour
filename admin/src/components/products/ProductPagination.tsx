"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductPaginationProps = {
  totalCount: number;
  currentPage: number;
  pageSize: number;
};

export function ProductPagination({
  totalCount,
  currentPage,
  pageSize,
}: ProductPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalCount / pageSize);
  const startRange = (currentPage - 1) * pageSize + 1;
  const endRange = Math.min(currentPage * pageSize, totalCount);

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pagina", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const updatePageSize = (newSize: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limite", newSize);
    params.set("pagina", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mt-8 space-y-4">
      <p className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Mostrando {startRange}-{endRange} de {totalCount} produtos encontrados
      </p>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex items-center">
          <select
            value={pageSize}
            onChange={(e) => updatePageSize(e.target.value)}
            className="h-11 rounded-md bg-transparent px-3 text-xs font-bold uppercase tracking-wider text-slate-700 outline-none focus:ring-0"
          >
            <option value="10">10 / página</option>
            <option value="20">20 / página</option>
            <option value="30">30 / página</option>
            <option value="50">50 / página</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => updatePage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex h-11 w-11 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => updatePage(currentPage + 1)}
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
