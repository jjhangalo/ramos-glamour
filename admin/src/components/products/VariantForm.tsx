"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Loader2, X, Trash2, Images, RefreshCcw } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { variantSchema, type VariantFormValues } from "@/lib/validations/product";
import {
  createVariant,
  updateVariant,
  deleteVariant,
  uploadVariantImages,
  deleteVariantImage,
} from "@/lib/actions/variants";
import { cn } from "@/lib/utils";
import type { ProductVariantRecord } from "@/lib/types";

type VariantFormProps = {
  productId: string;
  variant?: ProductVariantRecord | null;
  onClose: () => void;
  className?: string;
};

export function VariantForm({
  productId,
  variant,
  onClose,
  className,
}: VariantFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showImageArea, setShowImageArea] = useState(!!variant?.variant_images?.length);

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      size: variant?.size || "",
      color: variant?.color || "",
      stock: variant?.stock || 0,
      is_available: variant?.is_available ?? true,
      price_override: variant?.price_override ?? null,
    },
  });

  // Helper for error toasts
  const showErrorToast = (message: string, retryAction?: () => void) => {
    toast((t) => (
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900">{message}</span>
          <span className="text-xs text-slate-500">Erro ao guardar, tenta novamente.</span>
        </div>
        {retryAction && (
          <button
            onClick={() => {
              toast.dismiss(t.id);
              retryAction();
            }}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-slate-100 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
          >
            <RefreshCcw className="mr-2 h-3.5 w-3.5" />
            Tentar
          </button>
        )}
      </div>
    ), { duration: Infinity, id: "save-variant-error" });
  };

  const onSubmit = async (values: VariantFormValues) => {
    startTransition(async () => {
      let result;
      if (variant?.id) {
        result = await updateVariant(variant.id, productId, values);
      } else {
        result = await createVariant(productId, values);
      }

      if (!result.success) {
        showErrorToast(result.error ?? "Erro ao guardar variante.", () => onSubmit(values));
        return;
      }

      toast.success("Variante guardada.", { duration: 3000 });
      router.refresh();
      onClose();
    });
  };

  const handleDelete = async () => {
    if (!variant?.id) return;
    if (!confirm("Tens a certeza que queres apagar esta variante?")) return;

    startTransition(async () => {
      const result = await deleteVariant(variant.id, productId);
      if (!result.success) {
        toast.error(result.error ?? "Erro ao apagar variante.");
        return;
      }
      toast.success("Variante apagada.");
      router.refresh();
      onClose();
    });
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length || !variant?.id) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    startTransition(async () => {
      const result = await uploadVariantImages(variant.id, formData);
      if (!result.success) {
        toast.error(result.error ?? "Erro no upload.");
        return;
      }
      toast.success("Imagens carregadas.");
      router.refresh();
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">
          {variant ? "Editar Variante" : "Nova Variante"}
        </h3>
        {variant && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tamanho</label>
            <input
              {...form.register("size")}
              className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400"
              placeholder="Ex: XL, 42..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Cor</label>
            <input
              {...form.register("color")}
              className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400"
              placeholder="Ex: Preto, Azul..."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Stock</label>
            <input
              {...form.register("stock")}
              type="number"
              min="0"
              className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Preço Específico</label>
            <input
              {...form.register("price_override")}
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400"
              placeholder="Opcional"
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3">
          <div className="relative flex h-6 w-11 items-center rounded-full bg-slate-200 transition focus-within:ring-2 focus-within:ring-slate-950">
            <input
              type="checkbox"
              {...form.register("is_available")}
              className="peer sr-only"
            />
            <div className={cn(
              "absolute inset-0 rounded-full transition-colors peer-checked:bg-emerald-500",
              "bg-slate-200"
            )} />
            <div className="absolute h-5 w-5 translate-x-0.5 rounded-full bg-white transition peer-checked:translate-x-5.5" />
          </div>
          <span className="text-sm font-medium text-slate-700">Disponível para venda</span>
        </label>

        <div className="border-t border-slate-100 pt-6">
          {!showImageArea ? (
            <button
              type="button"
              onClick={() => setShowImageArea(true)}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <Images className="h-4 w-4" />
              Adicionar imagens próprias
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Imagens da Variante</h3>
                <label className="cursor-pointer text-xs font-bold text-emerald-600 hover:text-emerald-700">
                  Carregar
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    disabled={!variant?.id || isPending}
                  />
                </label>
              </div>

              {!variant?.id ? (
                <p className="text-xs text-slate-400 italic">Guarda a variante primeiro para activar os uploads.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {variant.variant_images?.map((img) => (
                    <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-100">
                      <Image src={img.url} alt="Imagem da variante" fill className="object-cover" sizes="(max-width: 768px) 100vw, 300px" />
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Remover imagem?")) {
                            startTransition(async () => {
                              await deleteVariantImage(img.id, productId);
                              router.refresh();
                            });
                          }
                        }}
                        className="absolute right-1 top-1 rounded-full bg-white/90 p-1 opacity-0 shadow-sm transition group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-[2] rounded-xl bg-slate-950 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            ) : (
              "Guardar Variante"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
