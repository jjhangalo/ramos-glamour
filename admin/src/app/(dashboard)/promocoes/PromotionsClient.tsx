"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  createPromotion,
  deletePromotion,
  togglePromotion,
} from "@/lib/actions/promotions";
import type { PromotionRecord } from "@/lib/actions/promotions";
import { promotionSchema, type PromotionFormValues } from "@/lib/validations/promotion";
import { formatPrice } from "@/lib/format";

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
    resolver: zodResolver(promotionSchema) as any,
    defaultValues: {
      product_id: "",
      promo_price: 0,
      is_active: true,
      ends_at: "",
    },
  });

  const selectedProductId = form.watch("product_id");
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
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Nova promoção
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-950">
            Adicionar promoção
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            {/* Product search + select */}
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto</FormLabel>
                  <div className="space-y-2">
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Pesquisar produto..."
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
                    />
                    <FormControl>
                      <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50">
                        {filteredProducts.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-slate-500">
                            Nenhum produto encontrado.
                          </p>
                        ) : (
                          filteredProducts.map((product) => (
                            <label
                              key={product.id}
                              className="flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm transition hover:bg-slate-100"
                            >
                              <span className="font-medium text-slate-800">
                                {product.name}
                              </span>
                              <span className="text-slate-500">
                                {formatPrice(product.price)}
                              </span>
                              <input
                                type="radio"
                                className="ml-2 h-4 w-4 cursor-pointer accent-slate-900"
                                checked={field.value === product.id}
                                onChange={() => {
                                  field.onChange(product.id);
                                  form.setValue("promo_price", 0);
                                }}
                              />
                            </label>
                          ))
                        )}
                      </div>
                    </FormControl>
                    {selectedProduct && (
                      <p className="text-xs text-slate-500">
                        Preço original:{" "}
                        <strong>{formatPrice(selectedProduct.price)}</strong>
                      </p>
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
                  <FormLabel>Preço promocional (Kz)</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={isPending}
                      placeholder="Ex: 19900"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
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
                  <FormLabel>Data de fim (opcional)</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      value={field.value ?? ""}
                      type="date"
                      disabled={isPending}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
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
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      disabled={isPending}
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300"
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer">
                    Promoção ativa
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
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
};

export function PromotionsClient({
  promotions,
  products,
}: PromotionsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Promoções
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">
            Gestão de promoções
          </h1>
        </div>
        <PromotionDialog products={products} />
      </div>

      {/* Table */}
      {promotions.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3 font-medium">Produto</th>
                <th className="px-5 py-3 font-medium">Preço original</th>
                <th className="px-5 py-3 font-medium">Preço promo</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">
                  Desconto
                </th>
                <th className="hidden px-5 py-3 font-medium lg:table-cell">
                  Validade
                </th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium text-right">Acções</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promo) => {
                const originalPrice = promo.products?.price ?? 0;
                const discount =
                  originalPrice > 0
                    ? Math.round(
                        ((originalPrice - promo.promo_price) / originalPrice) *
                          100,
                      )
                    : 0;
                const isExpired =
                  promo.ends_at && new Date(promo.ends_at) < new Date();

                return (
                  <tr key={promo.id} className="border-b border-slate-100">
                    <td className="px-5 py-4 font-medium text-slate-950">
                      <div
                        className="max-w-[180px] truncate"
                        title={promo.products?.name}
                      >
                        {promo.products?.name ?? "—"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {originalPrice ? formatPrice(originalPrice) : "—"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-emerald-700">
                      {formatPrice(promo.promo_price)}
                    </td>
                    <td className="hidden px-5 py-4 text-slate-700 md:table-cell">
                      {discount > 0 ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          -{discount}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="hidden px-5 py-4 text-slate-600 lg:table-cell">
                      {promo.ends_at ? (
                        <span
                          className={
                            isExpired ? "text-red-500" : "text-slate-600"
                          }
                        >
                          {new Date(promo.ends_at).toLocaleDateString("pt-AO")}
                          {isExpired ? " (expirada)" : ""}
                        </span>
                      ) : (
                        <span className="text-slate-400">Sem validade</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          handleToggle(promo.id, promo.is_active)
                        }
                        className="inline-flex items-center gap-1.5 text-sm transition disabled:opacity-50"
                        title={
                          promo.is_active
                            ? "Desactivar promoção"
                            : "Activar promoção"
                        }
                      >
                        {promo.is_active ? (
                          <ToggleRight className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-slate-400" />
                        )}
                        <span
                          className={
                            promo.is_active
                              ? "text-emerald-700"
                              : "text-slate-500"
                          }
                        >
                          {promo.is_active ? "Ativa" : "Inativa"}
                        </span>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => setConfirmId(promo.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                        title="Remover promoção"
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
          <p className="text-base font-medium text-slate-700">
            Nenhuma promoção criada.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Clica em "Nova promoção" para adicionar um produto à lista de
            promoções.
          </p>
        </div>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Remover promoção"
        description="Tens a certeza que queres remover esta promoção? Esta acção não pode ser desfeita."
        onConfirm={() => {
          if (confirmId) handleDelete(confirmId);
          setConfirmId(null);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
