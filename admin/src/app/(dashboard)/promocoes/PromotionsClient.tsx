"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2, Plus, Trash2, ToggleLeft, ToggleRight, Info, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageCanvas } from "@/components/ui/page-canvas";
import { PageHeader } from "@/components/list/PageHeader";
import {
  createPromotion,
  deletePromotion,
  togglePromotion,
} from "@/lib/actions/promotions";
import type { PromotionRecord } from "@/lib/actions/promotions";
import { promotionSchema, type PromotionFormValues } from "@/lib/validations/promotion";
import { formatPrice } from "@/lib/format";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/shared/Animations";
import { PromotionPaginationWrapper } from "@/components/promotions/PromotionPaginationWrapper";

type ProductOption = {
  id: string;
  name: string;
  price: number;
};

type PromotionDialogProps = {
  products: ProductOption[];
};

function PromotionDialog({ products }: PromotionDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema) as import("react-hook-form").Resolver<PromotionFormValues>,
    defaultValues: {
      product_id: "",
      promo_price: 0,
      is_active: true,
      ends_at: "",
    },
  });

  const selectedProductId = useWatch({
    control: form.control,
    name: "product_id",
  });
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const onSubmit = (values: PromotionFormValues) => {
    if (selectedProduct && values.promo_price >= selectedProduct.price) {
      form.setError("promo_price", {
        message: `O preço promocional deve ser inferior ao preço original (${formatPrice(selectedProduct.price)}).`,
      });
      return;
    }

    startTransition(async () => {
      const result = await createPromotion({
        ...values,
        ends_at: values.ends_at || null,
      });

      if (!result.success) {
        toast.error(result.error ?? "Erro ao criar a promoção.");
        return;
      }

      toast.success("Promoção criada.");
      form.reset();
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="hidden items-center justify-center rounded-xl bg-brand-midnight px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-white shadow-md transition hover:bg-brand-charcoal md:flex"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nova Promoção
        </button>
      </DialogTrigger>
      {/* Mobile FAB */}
      <DialogTrigger asChild>
        <button
          type="button"
          className="fixed bottom-24 right-6 z-40 group flex h-14 items-center justify-center rounded-full bg-brand-midnight p-2 text-white shadow-[0_20px_50px_rgba(18,18,18,0.3)] transition-all hover:scale-105 active:scale-95 md:hidden w-14"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold text-white shadow-inner transition-transform group-active:scale-90">
            <Plus className="h-6 w-6" />
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg rounded-3xl border border-brand-midnight/5 bg-white p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="heading-luxury text-2xl font-light">
            Adicionar Promoção
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-5"
          >
            {/* Product search + select */}
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-brand-midnight/60">Produto</FormLabel>
                  <div className="space-y-3">
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Pesquisar produto..."
                      className="w-full rounded-xl border border-brand-midnight/10 px-4 py-3 text-sm text-brand-midnight outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20"
                    />
                    <FormControl>
                      <div className="max-h-44 overflow-y-auto rounded-xl border border-brand-midnight/10 bg-brand-bg/30">
                        {filteredProducts.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-brand-midnight/50">
                            Nenhum produto encontrado.
                          </p>
                        ) : (
                          filteredProducts.map((product) => (
                            <label
                              key={product.id}
                              className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-brand-bg/50"
                            >
                              <span className="font-medium text-brand-midnight">
                                {product.name}
                              </span>
                              <div className="flex items-center gap-3">
                                <span className="text-brand-midnight/60 text-xs font-mono">
                                  {formatPrice(product.price)}
                                </span>
                                <input
                                  type="radio"
                                  className="h-4 w-4 cursor-pointer accent-brand-midnight"
                                  checked={field.value === product.id}
                                  onChange={() => {
                                    field.onChange(product.id);
                                    form.setValue("promo_price", 0);
                                  }}
                                />
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </FormControl>
                    {selectedProduct && (
                      <div className="flex items-center gap-2 rounded-lg bg-brand-gold/5 p-3 text-sm text-brand-midnight/70">
                        <Info className="h-4 w-4 text-brand-gold" />
                        <span>
                          Preço original:{" "}
                          <strong className="text-brand-midnight font-mono">{formatPrice(selectedProduct.price)}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Promo price */}
            <FormField
              control={form.control}
              name="promo_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-brand-midnight/60">Preço promocional (Kz)</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={isPending}
                      placeholder="Ex: 19900"
                      className="w-full rounded-xl border border-brand-midnight/10 px-4 py-3 text-sm font-mono text-brand-midnight outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 disabled:bg-brand-bg/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ends at */}
            <FormField
              control={form.control}
              name="ends_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-brand-midnight/60">Data de fim (opcional)</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      value={field.value ?? ""}
                      type="date"
                      disabled={isPending}
                      className="w-full rounded-xl border border-brand-midnight/10 px-4 py-3 text-sm text-brand-midnight outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 disabled:bg-brand-bg/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* is_active */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      disabled={isPending}
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 cursor-pointer rounded border-brand-midnight/20 accent-brand-midnight"
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer text-sm font-medium text-brand-midnight">
                    Promoção ativa
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setOpen(false)}
                className="rounded-xl border border-brand-midnight/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-midnight/60 transition hover:bg-brand-bg/50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-midnight px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-brand-charcoal disabled:opacity-50"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

type PromotionsClientProps = {
  promotions: PromotionRecord[];
  products: ProductOption[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
};

export function PromotionsClient({
  promotions,
  products,
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
      {/* Header */}
      <FadeUp>
        <PageHeader
          title="Promoções"
          actions={<PromotionDialog products={products} />}
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
            <div className="hidden overflow-hidden rounded-2xl border border-brand-midnight/5 bg-white shadow-sm md:block">
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
                    const originalPrice = promo.products?.price ?? 0;
                    const rawDiscount =
                      originalPrice > 0
                        ? ((originalPrice - promo.promo_price) / originalPrice) * 100
                        : 0;
                    const discount = Number.isInteger(rawDiscount)
                      ? rawDiscount
                      : Number(rawDiscount.toFixed(2));
                    const isExpired =
                      promo.ends_at && new Date(promo.ends_at) < new Date();

                    return (
                      <tr key={promo.id} className="group transition-colors hover:bg-brand-bg/30">
                        <td className="px-5 py-4">
                          <div className="max-w-[200px] truncate font-medium text-brand-midnight" title={promo.products?.name}>
                            {promo.products?.name ?? "—"}
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
                          {promo.ends_at ? (
                            <span className={cn("text-xs font-medium", isExpired ? "text-red-500" : "text-brand-midnight/60")}>
                              {new Date(promo.ends_at).toLocaleDateString("pt-AO")}
                              {isExpired && " (exp.)"}
                            </span>
                          ) : (
                            <span className="text-xs text-brand-midnight/30">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                              isExpired
                                ? "bg-red-50 text-red-600"
                                : promo.is_active
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-brand-midnight/5 text-brand-midnight/40"
                            )}
                          >
                            {isExpired ? "Expirada" : promo.is_active ? "Ativa" : "Inativa"}
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
                const originalPrice = promo.products?.price ?? 0;
                const rawDiscount =
                  originalPrice > 0
                    ? ((originalPrice - promo.promo_price) / originalPrice) * 100
                    : 0;
                const discount = Number.isInteger(rawDiscount)
                  ? rawDiscount
                  : Number(rawDiscount.toFixed(2));
                const isExpired =
                  promo.ends_at && new Date(promo.ends_at) < new Date();

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

                        {promo.ends_at && (
                          <div className="mt-3 text-xs">
                            <span className={cn("font-medium", isExpired ? "text-red-500" : "text-brand-midnight/60")}>
                              {isExpired ? "Expirou a " : "Até "}
                              {new Date(promo.ends_at).toLocaleDateString("pt-AO")}
                            </span>
                          </div>
                        )}

                        <div className="mt-3">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                              isExpired
                                ? "bg-red-50 text-red-600"
                                : promo.is_active
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-brand-midnight/5 text-brand-midnight/40"
                            )}
                          >
                            {isExpired ? "Expirada" : promo.is_active ? "Ativa" : "Inativa"}
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
