"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { ShieldCheck, UserPlus, AlertCircle, CheckCircle2, XCircle, Info } from "lucide-react";

import { requestPromotion, submitPromotionVote } from "@/lib/actions/clients";
import { cn } from "@/lib/utils";
import type { ClientRecord, PromotionRequestRecord } from "@/lib/types";
import { FadeUp } from "@/components/shared/Animations";

type PromotionGovernanceCardProps = {
  client: ClientRecord;
  currentUserId: string | undefined;
};

export function PromotionGovernanceCard({
  client,
  currentUserId,
}: PromotionGovernanceCardProps) {
  const [isPending, startTransition] = useTransition();
  const request = client.promotion_request;

  const handleRequestPromotion = () => {
    startTransition(async () => {
      try {
        const result = await requestPromotion(client.id);
        if (result.success) {
          toast.success("Pedido de promoção iniciado com sucesso.");
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  const handleVote = (decision: "approve" | "reject") => {
    if (!request) return;
    
    startTransition(async () => {
      try {
        const result = await submitPromotionVote(request.id, decision);
        if (result.success) {
          toast.success(decision === "approve" ? "Voto de aprovação registado." : "Voto de rejeição registado.");
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  // Se o utilizador já for admin, não mostramos a opção de promover (mas podemos mostrar histórico se necessário)
  if (client.role === "admin" && !request) return null;

  const hasAlreadyVoted = request?.votes?.some(v => v.voter_id === currentUserId);

  return (
    <FadeUp delay={0.4}>
      <section className="rounded-[2.5rem] border border-brand-midnight/5 bg-white p-8 md:p-10 shadow-sm overflow-hidden relative">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <ShieldCheck className="h-48 w-48 text-brand-midnight" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-bg text-brand-midnight">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="heading-luxury text-2xl font-medium text-brand-midnight">
                Zona de Governança
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                Ações de Acesso Crítico
              </p>
            </div>
          </div>

          {!request ? (
            <div className="space-y-6">
              <div className="rounded-2xl bg-brand-bg/50 p-6 border border-brand-midnight/5">
                <div className="flex gap-4">
                  <Info className="h-5 w-5 text-brand-midnight/40 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-brand-midnight">
                      Promover a Administrador
                    </p>
                    <p className="text-xs text-brand-midnight/60 leading-relaxed">
                      Esta ação iniciará um processo de votação unânime. Todos os administradores atuais deverão aprovar este pedido para que o utilizador ganhe acesso total. Se pelo menos um administrador recusar, o pedido será encerrado.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRequestPromotion}
                disabled={isPending}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-midnight py-4 text-sm font-bold text-white transition-all hover:bg-brand-midnight/90 active:scale-[0.98] disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4 transition-transform group-hover:scale-110" />
                {isPending ? "A processar..." : "Iniciar Processo de Promoção"}
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Request Status Banner */}
              <div className={cn(
                "rounded-2xl p-6 border flex gap-4",
                request.status === "pending" ? "bg-amber-50 border-amber-100 text-amber-900" :
                request.status === "approved" ? "bg-emerald-50 border-emerald-100 text-emerald-900" :
                "bg-red-50 border-red-100 text-red-900"
              )}>
                {request.status === "pending" ? <AlertCircle className="h-6 w-6 shrink-0" /> :
                 request.status === "approved" ? <CheckCircle2 className="h-6 w-6 shrink-0" /> :
                 <XCircle className="h-6 w-6 shrink-0" />}
                
                <div className="space-y-1">
                  <p className="text-sm font-bold">
                    {request.status === "pending" ? "Pedido de Promoção Pendente" :
                     request.status === "approved" ? "Promoção Aprovada por Unanimidade" :
                     "Promoção Recusada"}
                  </p>
                  <p className="text-xs opacity-70">
                    Solicitado por {request.requester?.full_name || "outro administrador"} em {new Date(request.created_at).toLocaleDateString('pt-PT')}.
                  </p>
                </div>
              </div>

              {request.status === "pending" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30 px-1">
                      Estado da Votação
                    </p>
                    {currentUserId === request.requester_id ? (
                      <div className="rounded-xl bg-brand-bg/50 p-4 border border-brand-midnight/5 text-center">
                        <p className="text-xs font-medium text-brand-midnight/60 italic">
                          Você solicitou esta promoção. Aguarde a decisão final dos restantes administradores.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => handleVote("approve")}
                            disabled={isPending || hasAlreadyVoted}
                            className={cn(
                              "flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all border",
                              hasAlreadyVoted ? "bg-brand-bg text-brand-midnight/20 border-transparent" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 active:scale-95"
                            )}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {hasAlreadyVoted ? "Já Votou" : "Aprovar"}
                          </button>
                          <button
                            onClick={() => handleVote("reject")}
                            disabled={isPending || hasAlreadyVoted}
                            className={cn(
                              "flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all border",
                              hasAlreadyVoted ? "bg-brand-bg text-brand-midnight/20 border-transparent" : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 active:scale-95"
                            )}
                          >
                            <XCircle className="h-4 w-4" />
                            Recusar
                          </button>
                        </div>
                        {hasAlreadyVoted && (
                          <p className="text-center text-[10px] font-medium text-brand-midnight/30">
                            O seu voto foi registado. Aguarde a decisão final dos restantes administradores.
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Voters List */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30 px-1">
                      Votos Registados
                    </p>
                    <div className="space-y-2">
                      {request.votes?.map((vote) => (
                        <div key={vote.id} className="flex items-center justify-between rounded-xl bg-brand-bg/30 px-4 py-2 border border-brand-midnight/5">
                          <span className="text-xs font-medium text-brand-midnight/60">
                            {vote.voter?.full_name || "Administrador"}
                          </span>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            vote.decision === "approve" ? "text-emerald-600" : "text-red-600"
                          )}>
                            {vote.decision === "approve" ? "Aprovou" : "Recusou"}
                          </span>
                        </div>
                      ))}
                      {(!request.votes || request.votes.length === 0) && (
                        <p className="text-xs italic text-brand-midnight/30 px-1">
                          Nenhum voto registado até ao momento.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </FadeUp>
  );
}
