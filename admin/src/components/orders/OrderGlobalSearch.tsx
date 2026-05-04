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
        // Reset to page 1 on new search
        params.set("pagina", "1");
        router.push(`/encomendas?${params.toString()}`);
        setIsPending(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, router, searchParams]);

  return (
    <div className="relative w-full sm:max-w-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-brand-midnight/30" />
        ) : (
          <Search className="h-4 w-4 text-brand-midnight/30" />
        )}
      </div>
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
          onClick={() => setQuery("")}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-midnight/30 transition hover:text-brand-midnight"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
