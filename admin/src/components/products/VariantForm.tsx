"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Loader2, X, Trash2, Images, RefreshCcw, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

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
import { FadeUp } from "@/components/shared/Animations";
import { compressImages } from "@/lib/image";

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
  const [isPending, startTransition] = useTransition();
  const [showImageArea, setShowImageArea] = useState(!!variant?.variant_images?.length);

  const form = useForm<VariantFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(variantSchema) as any,
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
          <span className="text-sm font-bold text-brand-midnight">{message}</span>
          <span className="text-xs text-brand-midnight/40 text-slate-500">Erro ao guardar, tenta novamente.</span>
        </div>
        {retryAction && (
          <button
            onClick={() => {
              toast.dismiss(t.id);
              retryAction();
            }}
            className="flex min-h-[44px] items-center justify-center rounded-lg bg-brand-midnight px-4 text-xs font-bold uppercase tracking-widest text-brand-white transition hover:bg-brand-charcoal"
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
      onClose();
    });
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length || !variant?.id) return;

    const compressionToast = toast.loading("A processar imagens...");

    try {
      const { files: compressedFiles, skippedCount } = await compressImages(files);

      if (compressedFiles.length === 0) {
        toast.error("Nenhuma imagem válida para upload (limite de 4MB atingido).", { id: compressionToast });
        return;
      }

      if (skippedCount > 0) {
        toast.error(`${skippedCount} imagens ignoradas por limite de tamanho.`, { id: compressionToast });
      } else {
        toast.dismiss(compressionToast);
      }

      const formData = new FormData();
      compressedFiles.forEach((file) => formData.append("files", file));

      startTransition(async () => {
        const result = await uploadVariantImages(variant.id, formData);
        if (!result.success) {
          toast.error(result.error ?? "Erro no upload.");
          return;
        }
        toast.success("Imagens carregadas.");
      });
    } catch {
      toast.error("Erro ao processar imagens.", { id: compressionToast });
    }
  };

  return (
    <FadeUp className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="heading-luxury text-xl font-light text-brand-midnight">
          {variant ? "Editar Variante" : "Nova Variante"}
        </h3>
        {variant && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-full p-2 text-brand-midnight/20 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Tamanho</label>
            <input
              {...form.register("size")}
              className="w-full rounded-xl border border-brand-midnight/5 bg-white/50 px-4 py-3 text-sm outline-none transition focus:border-brand-gold/50"
              placeholder="Ex: XL, 42..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Cor</label>
            <input
              {...form.register("color")}
              className="w-full rounded-xl border border-brand-midnight/5 bg-white/50 px-4 py-3 text-sm outline-none transition focus:border-brand-gold/50"
              placeholder="Ex: Preto, Azul..."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Stock</label>
            <input
              {...form.register("stock")}
              type="number"
              min="0"
              className="w-full rounded-xl border border-brand-midnight/5 bg-white/50 px-4 py-3 text-sm outline-none transition focus:border-brand-gold/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Preço Específico (KZ)</label>
            <input
              {...form.register("price_override")}
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-xl border border-brand-midnight/5 bg-white/50 px-4 py-3 text-sm outline-none transition focus:border-brand-gold/50"
              placeholder="Opcional"
            />
          </div>
        </div>

        <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
          <div className="relative flex h-6 w-11 items-center rounded-full bg-brand-midnight/10 transition">
            <input
              type="checkbox"
              {...form.register("is_available")}
              className="peer sr-only"
            />
            <div className={cn(
              "absolute inset-0 rounded-full transition-colors peer-checked:bg-brand-olive",
              "bg-brand-midnight/10"
            )} />
            <div className="absolute h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-[22px]" />
          </div>
          <div className="space-y-0.5">
            <span className="block text-sm font-medium text-brand-midnight">Disponível para venda</span>
            <span className="block text-[11px] text-brand-midnight/40">Visível no catálogo</span>
          </div>
        </label>

        <div className="border-t border-brand-midnight/5 pt-6">
          {!showImageArea ? (
            <button
              type="button"
              onClick={() => setShowImageArea(true)}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40 transition hover:text-brand-midnight"
            >
              <Images className="h-4 w-4" />
              Adicionar imagens próprias
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Imagens da Variante</h3>
                <label className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.2em] text-brand-olive hover:text-brand-olive/80 transition">
                  <span className="flex items-center gap-2"><Plus className="h-3 w-3" /> Carregar</span>
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
                <div className="rounded-xl border border-dashed border-brand-midnight/10 p-8 text-center">
                  <p className="text-[11px] text-brand-midnight/40 italic">Guarda a variante primeiro para activar os uploads.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {variant.variant_images?.map((img) => (
                    <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-brand-midnight/5 bg-white">
                      <Image src={img.url} alt="Imagem da variante" fill className="object-cover transition duration-500 group-hover:scale-110" sizes="(max-width: 768px) 33vw, 200px" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 transition group-hover:opacity-100" />
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Remover imagem?")) {
                            startTransition(async () => {
                              await deleteVariantImage(img.id, productId);
                            });
                          }
                        }}
                        className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 group-hover:translate-y-0"
                      >
                        <X className="h-3.5 w-3.5" />
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
            className="flex-1 rounded-xl border border-brand-midnight/10 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-midnight/70 transition hover:bg-brand-bg active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-[2] rounded-xl bg-brand-midnight py-4 text-[10px] font-bold uppercase tracking-widest text-brand-white shadow-lg shadow-brand-midnight/10 transition hover:bg-brand-charcoal active:scale-95 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="mx-auto h-4 w-4 animate-spin" />
            ) : (
              variant ? "GUARDAR ALTERAÇÕES" : "CRIAR VARIANTE"
            )}
          </button>
        </div>
      </form>
    </FadeUp>
  );
}

