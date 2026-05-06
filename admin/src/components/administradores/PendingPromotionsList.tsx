"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, UserCheck, ArrowRight, UserPlus } from "lucide-react";

import { submitPromotionVote } from "@/lib/actions/clients";
import { cn } from "@/lib/utils";
import type { PromotionRequestRecord } from "@/lib/types";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/shared/Animations";

type PendingPromotionsListProps = {
  requests: PromotionRequestRecord[];
  currentUserId: string | undefined;
};

export function PendingPromotionsList({
  requests,
  currentUserId,
}: PendingPromotionsListProps) {
  const [isPending, startTransition] = useTransition();

  const handleVote = (requestId: string, decision: "approve" | "reject") => {
    startTransition(async () => {
      try {
        const result = await submitPromotionVote(requestId, decision);
        if (result.success) {
          toast.success(decision === "approve" ? "Voto de aprovação registado." : "Voto de rejeição registado.");
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  if (!requests.length) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
          <UserCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="heading-luxury text-xl font-medium text-brand-midnight">
            Pedidos de Promoção Pendentes
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
            Aprovação de Unanimidade Necessária
          </p>
        </div>
      </div>

      <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {requests.map((request) => {
          const hasAlreadyVoted = request.votes?.some(v => v.voter_id === currentUserId);
          const approvalsCount = request.votes?.filter(v => v.decision === "approve").length || 0;

          return (
            <StaggerItem key={request.id}>
              <article className="group relative rounded-[2rem] border border-brand-midnight/5 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-brand-midnight/5 bg-brand-bg/50 shadow-inner">
                    {request.candidate?.avatar_url ? (
                      <Image
                        src={request.candidate.avatar_url}
                        alt={request.candidate.full_name || "Avatar"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-bold text-brand-midnight/20">
                        {request.candidate?.full_name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-brand-midnight">
                      {request.candidate?.full_name || request.candidate?.display_name || "Candidato"}
                    </h3>
                    <p className="truncate text-xs text-brand-midnight/40">
                      {request.candidate?.email || "Email N/D"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex rounded-full bg-brand-gold/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-brand-gold">
                        {approvalsCount} aprovações
                      </span>
                    </div>
                  </div>
                </div>

                {currentUserId === request.requester_id ? (
                  <div className="mt-6 rounded-xl bg-brand-bg/50 py-3 text-center border border-brand-midnight/5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-midnight/30">
                      Aguardando outros admins
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={() => handleVote(request.id, "approve")}
                      disabled={isPending || hasAlreadyVoted}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all border",
                        hasAlreadyVoted ? "bg-brand-bg text-brand-midnight/20 border-transparent" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 active:scale-95"
                      )}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {hasAlreadyVoted ? "Votado" : "Aprovar"}
                    </button>
                    <button
                      onClick={() => handleVote(request.id, "reject")}
                      disabled={isPending || hasAlreadyVoted}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all border",
                        hasAlreadyVoted ? "bg-brand-bg text-brand-midnight/20 border-transparent" : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 active:scale-95"
                      )}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Recusar
                    </button>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-brand-midnight/5">
                  <Link
                    href={`/clientes/${request.candidate_id}`}
                    className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-brand-midnight/40 hover:text-brand-midnight transition-colors"
                  >
                    Ver Perfil Completo
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </section>
  );
}
