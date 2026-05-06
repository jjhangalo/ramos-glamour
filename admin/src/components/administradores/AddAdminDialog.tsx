"use client";

import { Search, UserPlus, X, Loader2, ShieldCheck, Info } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import toast from "react-hot-toast";

import { getClients, requestPromotion } from "@/lib/actions/clients";
import type { ClientRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FadeUp } from "@/components/shared/Animations";

export function AddAdminDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ClientRecord[]>([]);
  const [isSearching, startSearchTransition] = useTransition();
  const [isRequesting, startRequestTransition] = useTransition();

  // Helper to close and reset
  const closeAndReset = () => {
    setIsOpen(false);
    setSearch("");
    setResults([]);
  };

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (search.length >= 2) {
        startSearchTransition(async () => {
          try {
            const { clients } = await getClients({
              search,
              role: "client",
              status: "active",
              pageSize: 10,
            });
            setResults(clients);
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

  async function handleInitiatePromotion(candidateId: string) {
    startRequestTransition(async () => {
      try {
        const result = await requestPromotion(candidateId);
        if (result.success) {
          toast.success("Pedido de promoção iniciado com sucesso.");
          closeAndReset();
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-3 rounded-2xl bg-brand-midnight px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-brand-midnight/90 active:scale-95 shadow-lg shadow-brand-midnight/10"
      >
        <UserPlus className="h-4 w-4 transition-transform group-hover:scale-110" />
        Novo Administrador
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-midnight/40 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={closeAndReset}
      />
      
      {/* Dialog Content */}
      <FadeUp className="relative w-full max-w-xl overflow-hidden rounded-[2.5rem] border border-brand-midnight/5 bg-white p-8 md:p-12 shadow-2xl">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/30 mb-1">
              Governança de Acesso
            </p>
            <h2 className="heading-luxury text-3xl font-medium text-brand-midnight">
              Solicitar Promoção
            </h2>
          </div>
          <button
            onClick={closeAndReset}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-bg text-brand-midnight/40 transition-all hover:bg-brand-midnight hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-8">
          <div className="rounded-2xl bg-brand-bg/50 p-6 border border-brand-midnight/5 flex gap-4">
            <Info className="h-5 w-5 text-brand-midnight/30 shrink-0 mt-0.5" />
            <p className="text-xs text-brand-midnight/60 leading-relaxed">
              Pesquise um cliente ativo para iniciar o processo de promoção. 
              <span className="block mt-2 font-bold text-brand-midnight">
                Lembre-se: a promoção requer aprovação unânime de todos os administradores atuais.
              </span>
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-midnight/20" />
            <input
              autoFocus
              type="text"
              placeholder="Nome ou email do cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-brand-midnight/5 bg-white py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-brand-gold/30 focus:ring-8 focus:ring-brand-gold/5"
            />
          </div>

          <div className={cn(
            "min-h-[200px] max-h-[350px] overflow-y-auto rounded-3xl border border-brand-midnight/5 bg-brand-bg/30 p-3 transition-all",
            results.length > 0 && "bg-brand-bg/50"
          )}>
            {isSearching ? (
              <div className="flex h-[200px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between rounded-2xl bg-white p-4 border border-brand-midnight/5 shadow-sm transition-all hover:border-brand-gold/20"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-brand-midnight">
                        {client.full_name || client.display_name}
                      </p>
                      <p className="truncate text-[10px] font-bold uppercase tracking-widest text-brand-midnight/30">
                        {client.email}
                      </p>
                    </div>
                    <button
                      onClick={() => handleInitiatePromotion(client.id)}
                      disabled={isRequesting}
                      className="group flex items-center gap-2 rounded-xl bg-brand-midnight px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-brand-midnight/90 disabled:opacity-50"
                    >
                      {isRequesting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <ShieldCheck className="h-3 w-3" />
                      )}
                      Solicitar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] flex-col items-center justify-center text-center p-8">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-midnight/20 leading-relaxed">
                  {search.length < 2
                    ? "Digita pelo menos 2 caracteres para pesquisar"
                    : "Nenhum cliente ativo encontrado"}
                </p>
              </div>
            )}
          </div>
        </div>
      </FadeUp>
    </div>
  );
}
