"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export function ProductFAB() {
  return (
    <Link
      href="/produtos/novo"
      className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl transition-all hover:bg-slate-800 active:scale-90 md:bottom-10 md:h-auto md:w-auto md:rounded-xl md:px-6 md:py-3.5"
    >
      <Plus className="h-6 w-6 md:mr-2" />
      <span className="hidden text-sm font-bold uppercase tracking-wider md:block">
        Novo Produto
      </span>
    </Link>
  );
}
