"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Plus, Trash2, ToggleLeft, ToggleRight, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageCanvas } from "@/components/ui/page-canvas";
import { PageHeader } from "@/components/list/PageHeader";
import { FAB } from "@/components/list/FAB";
import Link from "next/link";
import { deletePromotion, togglePromotion, type PromotionRecord } from "@/lib/actions/promotions";
import { formatPrice } from "@/lib/format";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/shared/Animations";
import { PromotionPaginationWrapper } from "@/components/promotions/PromotionPaginationWrapper";




type PromotionsClientProps = {
  promotions: PromotionRecord[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
};

export function PromotionsClient({
  promotions,
  totalCount,
  currentPage,
  pageSize,
}: PromotionsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<{ id: string; current: boolean } | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deletePromotion(id);
      if (!result.success) {
        toast.error(result.error ?? "Erro ao remover a promoção.");
        return;
      }
      toast.success("Promoção removida.");
      router.refresh();
    });
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      const result = await togglePromotion(id, !current);
      if (!result.success) {
        toast.error(result.error ?? "Erro ao atualizar a promoção.");
        return;
      }
      toast.success(current ? "Promoção desactivada." : "Promoção activada.");
      router.refresh();
    });
  }

  return (
    <PageCanvas size="list" className="relative space-y-8 pb-32 pt-8">
      {/* Mobile FAB */}
      <FAB href="/promocoes/nova" label="Nova Promoção" />

      {/* Header */}
      <FadeUp>
        <PageHeader
          title="Promoções"
          actions={
            <Link
              href="/promocoes/nova"
              className="hidden items-center justify-center rounded-xl bg-brand-midnight px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-white shadow-md transition hover:bg-brand-charcoal md:flex"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nova Promoção
            </Link>
          }
        />
      </FadeUp>

      {/* Results summary */}
      {totalCount > 0 && (
        <FadeUp delay={0.05}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
            {totalCount} promoção{totalCount !== 1 ? "ões" : ""}
          </p>
        </FadeUp>
      )}

      {promotions.length > 0 ? (
        <StaggerContainer className="space-y-6">
          <StaggerItem>
            {/* Desktop Table */}
            <div className="hidden rounded-2xl border border-brand-midnight/5 bg-white shadow-sm md:block overflow-visible">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-brand-bg/40 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-midnight/40">
                  <tr className="border-b border-brand-midnight/5">
                    <th className="px-5 py-4">Produto</th>
                    <th className="px-5 py-4">Preço Original</th>
                    <th className="px-5 py-4">Preço Promo</th>
                    <th className="px-5 py-4">Desconto</th>
                    <th className="px-5 py-4">Validade</th>
                    <th className="px-5 py-4">Estado</th>
                    <th className="px-5 py-4 text-right">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-midnight/5">
                  {promotions.map((promo) => {
                    const originalPrice = promo.product_variants?.price_override ?? promo.products?.price ?? 0;
                    const rawDiscount =
                      originalPrice > 0
                        ? ((originalPrice - promo.promo_price) / originalPrice) * 100
                        : 0;
                    const discount = Number.isInteger(rawDiscount)
                      ? rawDiscount
                      : Number(rawDiscount.toFixed(2));
                    const isExpired =
                      promo.ends_at && new Date(promo.ends_at) < new Date();
                    const isScheduled =
                      promo.starts_at && new Date(promo.starts_at) > new Date();
                    const variantDetails = promo.product_variants
                      ? [promo.product_variants.size ? `T: ${promo.product_variants.size}` : '', promo.product_variants.color ? `C: ${promo.product_variants.color}` : ''].filter(Boolean).join(', ')
                      : null;

                    return (
                      <tr key={promo.id} className="group transition-colors hover:bg-brand-bg/30">
                        <td className="px-5 py-4">
                          <div className="max-w-[200px] truncate font-medium text-brand-midnight" title={promo.products?.name}>
                            {promo.products?.name ?? "—"}
                            {variantDetails && <span className="ml-2 rounded bg-brand-midnight/5 px-1.5 py-0.5 text-[10px] font-bold text-brand-midnight/60">{variantDetails}</span>}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-brand-midnight/50">
                          {originalPrice ? formatPrice(originalPrice) : "—"}
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-emerald-600">
                          {formatPrice(promo.promo_price)}
                        </td>
                        <td className="px-5 py-4">
                          {discount > 0 ? (
                            <span className="rounded-full bg-brand-gold/10 px-2 py-0.5 text-[10px] font-bold text-brand-gold">
                              -{discount}%
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            {promo.starts_at && (
                              <span className="text-[10px] text-brand-midnight/40 font-bold uppercase tracking-wider">
                                Início: {new Date(promo.starts_at).toLocaleDateString("pt-AO")}
                              </span>
                            )}
                            {promo.ends_at ? (
                              <span className={cn("text-xs font-medium", isExpired ? "text-red-500" : "text-brand-midnight/60")}>
                                Fim: {new Date(promo.ends_at).toLocaleDateString("pt-AO")}
                                {isExpired && " (exp.)"}
                              </span>
                            ) : (
                              <span className="text-xs text-brand-midnight/30">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                              !promo.is_active
                                ? "bg-brand-midnight/5 text-brand-midnight/40"
                                : isScheduled
                                ? "bg-amber-50 text-amber-600"
                                : "bg-emerald-50 text-emerald-600"
                            )}
                          >
                            {!promo.is_active ? "Inativa" : isScheduled ? "Agendada" : "Ativa"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <DropdownMenu
                            align="right"
                            trigger={
                              <button
                                type="button"
                                disabled={isPending}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-midnight/10 text-brand-midnight/40 transition hover:bg-brand-bg/50 hover:text-brand-midnight disabled:opacity-50"
                              >
                                {isPending && (toggleConfirm?.id === promo.id || confirmId === promo.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="h-4 w-4" />
                                )}
                              </button>
                            }
                          >
                            <DropdownMenuItem
                              onClick={() => setToggleConfirm({ id: promo.id, current: promo.is_active })}
                              className="cursor-pointer gap-2"
                            >
                              {promo.is_active ? <ToggleRight className="h-4 w-4 text-brand-midnight/50" /> : <ToggleLeft className="h-4 w-4 text-brand-midnight/50" />}
                              <span>{promo.is_active ? "Desativar" : "Ativar"}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setConfirmId(promo.id)}
                              className="cursor-pointer gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Remover</span>
                            </DropdownMenuItem>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="space-y-4 md:hidden">
              {promotions.map((promo) => {
                const originalPrice = promo.product_variants?.price_override ?? promo.products?.price ?? 0;
                const rawDiscount =
                  originalPrice > 0
                    ? ((originalPrice - promo.promo_price) / originalPrice) * 100
                    : 0;
                const discount = Number.isInteger(rawDiscount)
                  ? rawDiscount
                  : Number(rawDiscount.toFixed(2));
                const isExpired =
                  promo.ends_at && new Date(promo.ends_at) < new Date();
                const isScheduled =
                  promo.starts_at && new Date(promo.starts_at) > new Date();
                const variantDetails = promo.product_variants
                  ? [promo.product_variants.size ? `T: ${promo.product_variants.size}` : '', promo.product_variants.color ? `C: ${promo.product_variants.color}` : ''].filter(Boolean).join(', ')
                  : null;

                return (
                  <div
                    key={promo.id}
                    className="relative overflow-hidden rounded-2xl border border-brand-midnight/5 bg-white p-5 shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        {discount > 0 && (
                          <span className="mb-2 inline-block rounded-full bg-brand-gold/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-brand-gold">
                            -{discount}% OFF
                          </span>
                        )}
                        <h3 className="truncate text-sm font-semibold text-brand-midnight">
                          {promo.products?.name ?? "—"}
                        </h3>
                        {variantDetails && (
                          <p className="mt-1 text-xs font-bold text-brand-midnight/50">
                            {variantDetails}
                          </p>
                        )}
                        
                        <div className="mt-3 flex items-end gap-3">
                          <div>
                            <p className="text-xs text-brand-midnight/40 line-through">
                              {originalPrice ? formatPrice(originalPrice) : "—"}
                            </p>
                            <p className="text-lg font-bold text-emerald-600">
                              {formatPrice(promo.promo_price)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-midnight/40">
                          {promo.starts_at && (
                            <div className="flex items-center gap-1.5">
                              <span className="w-12">Início:</span>
                              <span className="text-brand-midnight/60">{new Date(promo.starts_at).toLocaleDateString("pt-AO")}</span>
                            </div>
                          )}
                          {promo.ends_at && (
                            <div className="flex items-center gap-1.5">
                              <span className="w-12">Fim:</span>
                              <span className={cn("text-brand-midnight/60", isExpired && "text-red-500")}>
                                {new Date(promo.ends_at).toLocaleDateString("pt-AO")}
                                {isExpired && " (EXP.)"}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                              !promo.is_active
                                ? "bg-brand-midnight/5 text-brand-midnight/40"
                                : isScheduled
                                ? "bg-amber-50 text-amber-600"
                                : "bg-emerald-50 text-emerald-600"
                            )}
                          >
                            {!promo.is_active ? "Inativa" : isScheduled ? "Agendada" : "Ativa"}
                          </span>
                        </div>
                      </div>

                      {/* Actions Column */}
                      <div className="absolute right-4 top-4">
                        <DropdownMenu
                          align="right"
                          trigger={
                            <button
                              type="button"
                              disabled={isPending}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-midnight/40 transition hover:bg-brand-bg/50 hover:text-brand-midnight disabled:opacity-50"
                            >
                              {isPending && (toggleConfirm?.id === promo.id || confirmId === promo.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </button>
                          }
                        >
                          <DropdownMenuItem
                            onClick={() => setToggleConfirm({ id: promo.id, current: promo.is_active })}
                            className="cursor-pointer gap-2"
                          >
                            {promo.is_active ? <ToggleRight className="h-4 w-4 text-brand-midnight/50" /> : <ToggleLeft className="h-4 w-4 text-brand-midnight/50" />}
                            <span>{promo.is_active ? "Desativar" : "Ativar"}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setConfirmId(promo.id)}
                            className="cursor-pointer gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Remover</span>
                          </DropdownMenuItem>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </StaggerItem>

          <StaggerItem>
            <PromotionPaginationWrapper
              totalCount={totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
              totalPages={totalPages}
            />
          </StaggerItem>
        </StaggerContainer>
      ) : (
        <FadeUp delay={0.1}>
          <div className="rounded-3xl border border-dashed border-brand-midnight/10 bg-brand-bg/30 px-8 py-20 text-center">
            <p className="font-semibold text-brand-midnight">
              Nenhuma promoção ativa.
            </p>
            <p className="mt-2 text-sm text-brand-midnight/50">
              Clica no botão &quot;Nova promoção&quot; para adicionar descontos ao catálogo.
            </p>
          </div>
        </FadeUp>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmId(null);
        }}
        title="Remover promoção"
        description="Tens a certeza que queres remover esta promoção? O preço original será restaurado na loja."
        onConfirm={() => {
          if (confirmId) handleDelete(confirmId);
          setConfirmId(null);
        }}
      />

      <ConfirmDialog
        open={toggleConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setToggleConfirm(null);
        }}
        title={toggleConfirm?.current ? "Desativar promoção" : "Ativar promoção"}
        description={
          toggleConfirm?.current
            ? "Ao desativar, a promoção será imediatamente removida da loja e o produto voltará ao preço original."
            : "Ao ativar, a promoção ficará imediatamente visível e aplicável na loja."
        }
        onConfirm={() => {
          if (toggleConfirm) handleToggle(toggleConfirm.id, toggleConfirm.current);
          setToggleConfirm(null);
        }}
      />
    </PageCanvas>
  );
}
