"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Trash2,
  Upload,
  GripVertical,
  Plus,
  ChevronRight,
  RefreshCcw,
  Images,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StickySaveBar } from "@/components/ui/StickySaveBar";
import { PageCanvas } from "@/components/ui/page-canvas";
import { FadeUp } from "@/components/shared/Animations";
import { useMemo, useState, useTransition, useEffect } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  reorderProductImages,
  updateProduct,
  uploadProductImages,
} from "@/lib/actions/products";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  upsertPromotion,
  deactivatePromotionByProductId,
  type PromotionRecord,
} from "@/lib/actions/promotions";
import { formatPrice } from "@/lib/format";
import type {
  CategoryRecord,
  ProductRecord,
  ProductVariantRecord,
} from "@/lib/types";
import {
  productSchema,
  type ProductFormValues,
} from "@/lib/validations/product";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { CategoryCombobox } from "./CategoryCombobox";
import { VariantEditor } from "./VariantEditor";
import { VariantForm } from "./VariantForm";

/* ─── SortableImage (internal) ─── */

function SortableImage({
  id, url, onRemove, isPending,
}: {
  id: string; url: string; onRemove: () => void; isPending: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined, opacity: isDragging ? 0.5 : undefined };

  return (
    <div ref={setNodeRef} style={style} className="group relative rounded-xl border border-brand-midnight/5 bg-white p-2 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-brand-bg">
        <Image src={url} alt="Imagem do produto" fill className="object-cover" sizes="(max-width: 768px) 100vw, 300px" />
        <div {...attributes} {...listeners} className="absolute inset-0 flex cursor-grab items-center justify-center bg-slate-950/0 transition-colors group-hover:bg-slate-950/20 active:cursor-grabbing">
          <GripVertical className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
      <button type="button" disabled={isPending} onClick={onRemove} className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-brand-midnight/10 bg-white text-red-500 shadow-sm transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ─── Main Component ─── */

type ProductEditorProps = {
  product: ProductRecord | null;
  categories: CategoryRecord[];
  initialPromotion: PromotionRecord | null;
};

export function ProductEditor({ product, categories, initialPromotion }: ProductEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"produto" | "variantes">("produto");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Variant editor state
  const [activeVariant, setActiveVariant] = useState<ProductVariantRecord | null>(null);
  const [isVariantEditorOpen, setIsVariantEditorOpen] = useState(false);
  const [expandedVariantId, setExpandedVariantId] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Promotion state
  const [promoPrice, setPromoPrice] = useState<string>(
    initialPromotion?.is_active ? initialPromotion.promo_price.toString() : ""
  );

  // Helper for error toasts
  const showErrorToast = (rawError: string, retryAction?: () => void) => {
    // Basic error categorization for user-friendliness
    let friendlyMessage = "Ocorreu um erro ao processar o seu pedido.";
    let errorCode = "ERR_GENERIC";

    if (rawError.includes("category_id")) {
      friendlyMessage = "Não foi possível associar as categorias selecionadas.";
      errorCode = "ERR_DB_RELATION";
    } else if (rawError.includes("price") || rawError.includes("stock")) {
      friendlyMessage = "Os valores de preço ou stock parecem ser inválidos.";
      errorCode = "ERR_VALIDATION";
    } else if (rawError.includes("network") || rawError.includes("fetch")) {
      friendlyMessage = "Verifique a sua ligação à internet.";
      errorCode = "ERR_NETWORK";
    }

    toast((t) => (
      <div className="flex items-center gap-4 bg-white p-1">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-brand-midnight">{friendlyMessage}</span>
          <span className="text-[10px] uppercase tracking-wider text-brand-midnight/40">
            Código: {errorCode} · Tente novamente
          </span>
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
    ), { duration: Infinity, id: "save-error" });
  };

  // Image ordering
  const [localProductImages, setLocalProductImages] = useState<{ id: string; url: string; position: number }[]>([]);
  useEffect(() => {
    const sorted = [...(product?.product_images ?? [])].sort((a, b) => a.position - b.position);
    setLocalProductImages(sorted);
  }, [product?.product_images]);

  // Form
  const productForm = useForm<ProductFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      category_ids: product?.categories?.map((c) => c.id) ?? [],
      stock: product?.stock ?? 0,
      is_active: product?.is_active ?? true,
      is_featured: product?.is_featured ?? false,
    },
  });

  // Dirty tracking
  const isFormDirty = productForm.formState.isDirty;
  const isImagesDirty = useMemo(() => {
    const propIds = (product?.product_images ?? []).sort((a, b) => a.position - b.position).map((img) => img.id).join(",");
    return propIds !== localProductImages.map((img) => img.id).join(",");
  }, [product?.product_images, localProductImages]);
  const isPromoDirty = promoPrice !== (initialPromotion?.is_active ? initialPromotion.promo_price.toString() : "");
  const isDirty = isFormDirty || isImagesDirty || isPromoDirty;

  // eslint-disable-next-line react-hooks/incompatible-library
  const isActive = productForm.watch("is_active");

  // Submit
  const onProductSubmit = async (values: ProductFormValues) => {
    startTransition(async () => {
      const result = product ? await updateProduct(product.id, values) : await createProduct(values);
      if (!result.success) { 
        showErrorToast(result.error ?? "Erro ao guardar produto.", () => onProductSubmit(values));
        return; 
      }

      const pid = product?.id || ("id" in result ? (result.id as string) : "");

      if (isPromoDirty && pid) {
        if (promoPrice) {
          const r = await upsertPromotion({ product_id: pid, promo_price: parseFloat(promoPrice), is_active: true });
          if (!r.success) {
            showErrorToast("Erro ao guardar promoção.", () => onProductSubmit(values));
            return;
          }
        } else {
          const r = await deactivatePromotionByProductId(pid);
          if (!r.success) {
            showErrorToast("Erro ao desactivar promoção.", () => onProductSubmit(values));
            return;
          }
        }
      }

      if (isImagesDirty && pid) {
        const r = await reorderProductImages(pid, localProductImages.map((img) => img.id));
        if (!r.success) {
          showErrorToast("Erro ao guardar ordem das imagens.", () => onProductSubmit(values));
          return;
        }
      }

      toast.success("Alterações guardadas.", { 
        duration: 3000,
        position: isDesktop ? "top-right" : "top-center"
      });
      if (!product && pid) { 
        router.push(`/produtos/${pid}`); 
      }
    });
  };

  // Image upload
  const handleImageUpload = (fileList: FileList | null) => {
    if (!product || !fileList?.length) return;
    const formData = new FormData();
    Array.from(fileList).forEach((f) => formData.append("files", f));
    startTransition(async () => {
      const r = await uploadProductImages(product.id, formData);
      if (!r.success) { toast.error(r.error ?? "Erro no upload."); return; }
      toast.success("Imagens carregadas.");
      router.refresh();
    });
  };

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLocalProductImages((items) => {
      const oi = items.findIndex((img) => img.id === active.id);
      const ni = items.findIndex((img) => img.id === over.id);
      return arrayMove(items, oi, ni);
    });
  };

  /* ─── Render ─── */

  return (
    <PageCanvas size="form" className="pb-40 pt-8">
      {/* Header */}
      <FadeUp>
        <div className="flex items-center justify-between pb-6">
          <div>
            <h1 className="heading-luxury text-4xl font-light text-brand-midnight">{product ? "Editar Produto" : "Novo Produto"}</h1>
            <p className="text-sm text-brand-midnight/50">Gere os detalhes e visibilidade do teu produto.</p>
          </div>
          {product && (
            <button onClick={() => setIsDeleteConfirmOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-midnight/10 bg-white text-red-500 shadow-sm transition hover:bg-red-50 hover:text-red-600">
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </FadeUp>

      {/* Tab Bar */}
      <nav className="sticky top-0 z-10 -mx-4 border-b border-brand-midnight/5 bg-brand-bg/80 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex">
          {(["produto", "variantes"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative flex h-11 min-w-[44px] items-center justify-center px-5 text-xs font-bold uppercase tracking-widest transition-colors",
                activeTab === tab ? "text-brand-midnight" : "text-brand-midnight/30 hover:text-brand-midnight/60"
              )}
            >
              {tab === "produto" ? "Produto" : "Variantes"}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-midnight" 
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {/* ═══ Tab: Produto ═══ */}
        {activeTab === "produto" && (
          <motion.div
            key="produto"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
            className="mt-8 space-y-8"
          >
            <Form {...productForm}>
              <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-8">
                {/* Geral */}
                <FadeUp delay={0.1}>
                  <div className="rounded-xl bg-white p-6 shadow-sm space-y-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Geral</h2>
                    <FormField control={productForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Nome do Produto</FormLabel>
                        <FormControl>
                          <input {...field} disabled={isPending} className="w-full rounded-xl border border-brand-midnight/5 bg-white/50 px-4 py-3 text-sm outline-none transition focus:border-brand-gold/50" placeholder="Ex: Vestido de Seda..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={productForm.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Descrição</FormLabel>
                        <FormControl>
                          <textarea {...field} disabled={isPending} rows={4} className="w-full rounded-xl border border-brand-midnight/5 bg-white/50 px-4 py-3 text-sm outline-none transition focus:border-brand-gold/50" placeholder="Detalhes sobre o material, corte, etc..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </FadeUp>

                {/* Preço & Stock */}
                <FadeUp delay={0.2}>
                  <div className="rounded-xl bg-white p-6 shadow-sm space-y-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Preço & Stock</h2>
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      <FormField control={productForm.control} name="price" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Preço Base (KZ)</FormLabel>
                          <FormControl><input {...field} type="number" disabled={isPending} className="w-full rounded-xl border border-brand-midnight/5 bg-white/50 px-4 py-3 text-sm outline-none transition focus:border-brand-gold/50" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Stock Total</label>
                        <FormField control={productForm.control} name="stock" render={({ field }) => (
                          <FormItem>
                            <FormControl><input {...field} type="number" disabled={isPending} className="w-full rounded-xl border border-brand-midnight/5 bg-white/50 px-4 py-3 text-sm outline-none transition focus:border-brand-gold/50" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Preço Promocional (KZ)</label>
                        <input type="number" value={promoPrice} onChange={(e) => setPromoPrice(e.target.value)} disabled={isPending} className="w-full rounded-xl border border-brand-midnight/5 bg-white/50 px-4 py-3 text-sm outline-none transition focus:border-brand-gold/50" placeholder="Opcional" />
                      </div>
                    </div>
                  </div>
                </FadeUp>

                {/* Organização */}
                <FadeUp delay={0.3}>
                  <div className="rounded-xl bg-white p-6 shadow-sm space-y-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Organização</h2>
                    <FormField control={productForm.control} name="category_ids" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Categorias</FormLabel>
                        <FormControl>
                          <CategoryCombobox categories={categories} selectedIds={field.value} onChange={field.onChange} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid gap-6 sm:grid-cols-2 pt-2">
                      <FormField control={productForm.control} name="is_active" render={({ field }) => (
                        <FormItem>
                          <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                            <div className="relative flex h-6 w-11 items-center rounded-full bg-brand-midnight/10 transition">
                              <input type="checkbox" checked={field.value} onChange={field.onChange} disabled={isPending} className="peer sr-only" />
                              <div className={cn("absolute inset-0 rounded-full transition-colors peer-checked:bg-brand-olive", "bg-brand-midnight/10")} />
                              <div className="absolute h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-[22px]" />
                            </div>
                            <div className="space-y-0.5">
                              <span className="block text-sm font-medium text-brand-midnight">Estado</span>
                              <span className="block text-[11px] text-brand-midnight/40">{field.value ? "Activo" : "Inactivo"}</span>
                            </div>
                          </label>
                        </FormItem>
                      )} />

                      <FormField control={productForm.control} name="is_featured" render={({ field }) => (
                        <FormItem>
                          <label className={cn("flex min-h-[44px] items-center gap-3", !isActive ? "cursor-not-allowed opacity-40" : "cursor-pointer")}>
                            <div className="relative flex h-6 w-11 items-center rounded-full bg-brand-midnight/10 transition">
                              <input type="checkbox" checked={field.value} onChange={field.onChange} disabled={isPending || !isActive} className="peer sr-only" />
                              <div className={cn("absolute inset-0 rounded-full transition-colors peer-checked:bg-brand-olive", "bg-brand-midnight/10")} />
                              <div className="absolute h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-[22px]" />
                            </div>
                            <div className="space-y-0.5">
                              <span className="block text-sm font-medium text-brand-midnight">Destaque</span>
                              <span className="block text-[11px] text-brand-midnight/40">Página inicial</span>
                            </div>
                          </label>
                        </FormItem>
                      )} />
                    </div>
                  </div>
                </FadeUp>
              </form>
            </Form>

            {/* Imagens (outside <form> since uploads are independent) */}
            <FadeUp delay={0.4}>
              <div className="rounded-xl bg-white p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Imagens</h2>
                  <label className={cn("flex min-h-[44px] cursor-pointer items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-olive hover:text-brand-olive/80 transition", (!product || isPending) && "opacity-50 pointer-events-none")}>
                    <Upload className="h-3.5 w-3.5" />
                    Carregar Imagem
                    <input type="file" multiple className="hidden" onChange={(e) => handleImageUpload(e.target.files)} disabled={!product || isPending} />
                  </label>
                </div>
                {!product ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Images className="h-12 w-12 text-brand-midnight/10 mb-4" />
                    <p className="text-sm text-brand-midnight/40 italic">Guarda o produto primeiro para activar os uploads.</p>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      <SortableContext items={localProductImages.map((img) => img.id)} strategy={rectSortingStrategy}>
                        {localProductImages.map((image) => (
                          <SortableImage key={image.id} id={image.id} url={image.url} isPending={isPending} onRemove={() => {
                            if (confirm("Remover esta imagem?")) {
                              startTransition(async () => { await deleteProductImage(image.id); router.refresh(); });
                            }
                          }} />
                        ))}
                      </SortableContext>
                    </div>
                    {localProductImages.length === 0 && <p className="py-8 text-center text-sm text-brand-midnight/40">Nenhuma imagem carregada.</p>}
                  </DndContext>
                )}
              </div>
            </FadeUp>
          </motion.div>
        )}

        {/* ═══ Tab: Variantes ═══ */}
        {activeTab === "variantes" && (
          <motion.div
            key="variantes"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            <div className="rounded-xl bg-white overflow-hidden shadow-sm">
              {!product ? (
                <p className="p-12 text-center text-sm text-brand-midnight/40">Guarda o produto para adicionar variantes.</p>
              ) : (
                <div className="divide-y divide-brand-midnight/5">
                  {product.product_variants?.map((variant) => (
                    <div key={variant.id}>
                      <button
                        onClick={() => {
                          if (isDesktop) {
                            setExpandedVariantId(expandedVariantId === variant.id ? null : variant.id);
                          } else {
                            setActiveVariant(variant);
                            setIsVariantEditorOpen(true);
                          }
                        }}
                        className={cn(
                          "flex w-full min-h-[44px] items-center justify-between px-6 py-4 text-left transition hover:bg-brand-bg/50 active:bg-brand-bg",
                          expandedVariantId === variant.id && "bg-brand-bg/30"
                        )}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-brand-midnight">{variant.size || "S/T"} · {variant.color || "S/C"}</span>
                          <span className="text-xs text-brand-midnight/40">Stock: {variant.stock} · {variant.is_available ? "Disponível" : "Indisponível"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {variant.variant_images?.length ? <Images className="h-4 w-4 text-brand-midnight/20" /> : null}
                          {variant.price_override && <span className="text-xs font-bold text-brand-olive">{formatPrice(variant.price_override)}</span>}
                          <ChevronRight className={cn("h-4 w-4 text-brand-midnight/20 transition-transform", expandedVariantId === variant.id && "rotate-90")} />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isDesktop && expandedVariantId === variant.id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-brand-bg/10 border-t border-brand-midnight/5"
                          >
                            <div className="px-6 py-8">
                              <VariantForm productId={product.id} variant={variant} onClose={() => setExpandedVariantId(null)} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}

                  <AnimatePresence>
                    {isDesktop && expandedVariantId === "new" && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-brand-bg/10 border-t border-brand-midnight/5"
                      >
                        <div className="px-6 py-8">
                          <VariantForm productId={product.id} variant={null} onClose={() => setExpandedVariantId(null)} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!product.product_variants?.length && !expandedVariantId && (
                    <p className="p-12 text-center text-sm text-brand-midnight/40">Nenhuma variante criada.</p>
                  )}

                  {/* Add variant button */}
                  {product && (
                    <button
                      onClick={() => {
                        if (isDesktop) {
                          setExpandedVariantId(expandedVariantId === "new" ? null : "new");
                        } else {
                          setActiveVariant(null);
                          setIsVariantEditorOpen(true);
                        }
                      }}
                      className="flex w-full min-h-[44px] items-center justify-center gap-2 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-olive transition hover:bg-brand-olive/5"
                    >
                      <Plus className="h-4 w-4" />
                      ADICIONAR VARIANTE
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Bar — monitors both tabs */}
      <StickySaveBar
        isDirty={isDirty}
        isSaving={isPending}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSave={productForm.handleSubmit(onProductSubmit as any)}
        onReset={() => {
          productForm.reset();
          setPromoPrice(initialPromotion?.is_active ? initialPromotion.promo_price.toString() : "");
          setLocalProductImages([...(product?.product_images ?? [])].sort((a, b) => a.position - b.position));
        }}
      />

      {/* Mobile variant drawer */}
      {product && (
        <VariantEditor productId={product.id} variant={activeVariant} isOpen={isVariantEditorOpen} onClose={() => setIsVariantEditorOpen(false)} />
      )}

      {/* Delete dialog */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={async () => {
          if (!product) return;
          const r = await deleteProduct(product.id);
          if (r.success) { toast.success("Produto removido."); router.push("/produtos"); }
          else { toast.error(r.error ?? "Erro ao remover produto."); }
        }}
        title="Apagar Produto"
        description="Tens a certeza? Esta acção é irreversível e removerá todas as variantes e imagens associadas."
        confirmLabel="Sim, apagar"
        variant="destructive"
      />
    </PageCanvas>
  );
}
