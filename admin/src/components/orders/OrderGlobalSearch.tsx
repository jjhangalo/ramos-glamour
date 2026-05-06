"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useTransition } from "react";
import { Search, Loader2, X } from "lucide-react";

export function OrderGlobalSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("search", query.trim());
      } else {
        params.delete("search");
      }
      // Reset to page 1 on new search
      params.set("pagina", "1");
      router.push(`/encomendas?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setQuery("");
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("search");
      params.set("pagina", "1");
      router.push(`/encomendas?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full sm:max-w-sm">
      <button 
        type="submit" 
        className="absolute inset-y-0 left-0 flex items-center pl-4 disabled:opacity-50 transition-opacity hover:opacity-70"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-brand-midnight/50" />
        ) : (
          <Search className="h-4 w-4 text-brand-midnight/50" />
        )}
      </button>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ID, nome ou nota..."
        className="w-full rounded-xl border border-brand-midnight/10 bg-white py-3 pl-11 pr-10 text-sm text-brand-midnight outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 placeholder:text-brand-midnight/30"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          disabled={isPending}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-midnight/30 transition hover:text-brand-midnight disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
