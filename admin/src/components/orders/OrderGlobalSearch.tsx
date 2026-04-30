"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Search, Loader2, X } from "lucide-react";

export function OrderGlobalSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== (searchParams.get("search") || "")) {
        setIsPending(true);
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
          params.set("search", query);
        } else {
          params.delete("search");
        }
        router.push(`/encomendas?${params.toString()}`);
        setIsPending(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, router, searchParams]);

  return (
    <div className="relative w-full sm:max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        ) : (
          <Search className="h-4 w-4 text-slate-400" />
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Procurar por ID, nome ou contacto..."
        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
