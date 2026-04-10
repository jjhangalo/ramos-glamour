"use client";

import { Search, UserPlus, X, Loader2 } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { getClients, toggleAdminRole } from "@/lib/actions/clients";
import type { ClientRecord } from "@/lib/types";

export function AddAdminDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ClientRecord[]>([]);
  const [isSearching, startSearchTransition] = useTransition();
  const [isPromoting, startPromoteTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      if (search.length >= 2) {
        startSearchTransition(async () => {
          try {
            const data = await getClients({
              search,
              role: "client",
              status: "active",
            });
            setResults(data);
          } catch (error) {
            console.error(error);
            toast.error("Erro ao pesquisar clientes.");
          }
        });
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, isOpen]);

  async function handlePromote(userId: string) {
    if (!confirm("Pretendes promover este cliente a administrador?")) {
      return;
    }

    startPromoteTransition(async () => {
      const result = await toggleAdminRole(userId, "admin");
      if (!result.success) {
        toast.error(result.error ?? "Erro ao promover utilizador.");
        return;
      }
      toast.success("Utilizador promovido a administrador.");
      setIsOpen(false);
      router.refresh();
    });
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        <UserPlus className="h-4 w-4" />
        Novo Administrador
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Promover Administrador
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Pesquisa um cliente activo para lhe dar acesso administrativo.
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              type="text"
              placeholder="Nome ou email do cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div className="mt-4 min-h-[200px] max-h-[350px] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/50 p-2">
            {isSearching ? (
              <div className="flex h-[200px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {results.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between rounded-lg bg-white p-3 border border-slate-100 shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {client.full_name || client.display_name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {client.email}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePromote(client.id)}
                      disabled={isPromoting}
                      className="ml-4 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >
                      Promover
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] flex-col items-center justify-center text-center">
                <p className="text-sm text-slate-400">
                  {search.length < 2
                    ? "Digita pelo menos 2 caracteres"
                    : "Nenhum cliente activo encontrado"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
