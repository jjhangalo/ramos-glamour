"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  Trash2,
  Upload,
  GripVertical,
  Check,
  Plus,
  Images,
  ExternalLink,
} from "lucide-react";
import { StickySaveBar } from "@/components/ui/StickySaveBar";
import { PageCanvas } from "@/components/ui/page-canvas";
import { useMemo, useState, useTransition, useCallback, useEffect } from "react";
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
  type PromotionRecord 
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

type SortableImageProps = {
  id: string;
  url: string;
  onRemove: () => void;
  isPending: boolean;
  aspectClassName?: string;
};

function SortableImage({
  id,
  url,
  onRemove,
  isPending,
  aspectClassName = "aspect-square",
}: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className={cn("relative overflow-hidden rounded-lg bg-slate-100", aspectClassName)}>
        <Image 
          src={url} 
          alt="Imagem do produto" 
          fill 
          className="object-cover" 
          sizes="(max-width: 768px) 100vw, 300px"
        />
        <div 
          {...attributes} 
          {...listeners}
          className="absolute inset-0 flex cursor-grab items-center justify-center bg-slate-950/0 transition-colors group-hover:bg-slate-950/20 active:cursor-grabbing"
        >
          <GripVertical className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={onRemove}
        className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-red-500 shadow-sm transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

type ProductEditorProps = {
  product: ProductRecord | null;
  categories: CategoryRecord[];
  initialPromotion: PromotionRecord | null;
};

export function ProductEditor({ product, categories, initialPromotion }: ProductEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [activeVariant, setActiveVariant] = useState<ProductVariantRecord | null>(null);
  const [isVariantEditorOpen, setIsVariantEditorOpen] = useState(false);
  const [expandedVariantId, setExpandedVariantId] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Promotion state
  const [promoPrice, setPromoPrice] = useState<string>(
    initialPromotion?.is_active ? initialPromotion.promo_price.toString() : ""
  );

  // Local state for image ordering
  const [localProductImages, setLocalProductImages] = useState<{ id: string; url: string; position: number }[]>([]);

  useEffect(() => {
    const sorted = [...(product?.product_images ?? [])].sort((a, b) => a.position - b.position);
    setLocalProductImages(sorted);
  }, [product?.product_images]);

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
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

  const isFormDirty = productForm.formState.isDirty;
  const isImagesDirty = useMemo(() => {
    const propIds = (product?.product_images ?? [])
      .sort((a, b) => a.position - b.position)
      .map((img) => img.id)
      .join(",");
    const localIds = localProductImages.map((img) => img.id).join(",");
    return propIds !== localIds;
  }, [product?.product_images, localProductImages]);
  
  const isPromoDirty = promoPrice !== (initialPromotion?.is_active ? initialPromotion.promo_price.toString() : "");

  const isDirty = isFormDirty || isImagesDirty || isPromoDirty;

  const onProductSubmit = async (values: ProductFormValues) => {
    startTransition(async () => {
      // 1. Save Product
      const result = product
        ? await updateProduct(product.id, values)
        : await createProduct(values);

      if (!result.success) {
        toast.error(result.error ?? "Erro ao guardar produto.");
        return;
      }

      const currentProductId = product?.id || ("id" in result ? (result.id as string) : "");

      // 2. Save Promotion if changed
      if (isPromoDirty && currentProductId) {
        if (promoPrice) {
          const promoResult = await upsertPromotion({
            product_id: currentProductId,
            promo_price: parseFloat(promoPrice),
            is_active: true,
          });
          if (!promoResult.success) toast.error("Erro ao guardar promoção.");
        } else {
          const promoResult = await deactivatePromotionByProductId(currentProductId);
          if (!promoResult.success) toast.error("Erro ao desactivar promoção.");
        }
      }

      // 3. Save Image Order if changed
      if (isImagesDirty && currentProductId) {
        const orderResult = await reorderProductImages(currentProductId, localProductImages.map(img => img.id));
        if (!orderResult.success) toast.error("Erro ao guardar ordem das imagens.");
      }

      toast.success("Alterações guardadas.");
      
      if (!product && currentProductId) {
        router.push(`/produtos/${currentProductId}`);
      } else {
        router.refresh();
      }
    });
  };

  const handleProductImageUpload = async (fileList: FileList | null) => {
    if (!product || !fileList?.length) return;

    const formData = new FormData();
    Array.from(fileList).forEach(file => formData.append("files", file));

    startTransition(async () => {
      const result = await uploadProductImages(product.id, formData);
      if (!result.success) {
        toast.error(result.error ?? "Erro no upload.");
        return;
      }
      toast.success("Imagens carregadas.");
      router.refresh();
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalProductImages((items) => {
      const oldIndex = items.findIndex((img) => img.id === active.id);
      const newIndex = items.findIndex((img) => img.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const [activeSection, setActiveSection] = useState("geral");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["geral", "preco-stock", "organizacao", "imagens", "variantes"];
      const scrollPosition = window.scrollY + 150;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && el.offsetTop <= scrollPosition && (el.offsetTop + el.offsetHeight) > scrollPosition) {
          setActiveSection(section);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "geral", label: "Geral" },
    { id: "preco-stock", label: "Preço & Stock" },
    { id: "organizacao", label: "Organização" },
    { id: "imagens", label: "Imagens" },
    { id: "variantes", label: "Variantes" },
  ];

  const isActive = productForm.watch("is_active");

  return (
    <PageCanvas size="form" className="pb-40 pt-8">
      <div className="flex items-center justify-between pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            {product ? "Editar Produto" : "Novo Produto"}
          </h1>
          <p className="text-sm text-slate-500">
            Gere os detalhes e visibilidade do teu produto no catálogo.
          </p>
        </div>
        {product && (
          <button
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-red-500 shadow-sm transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="sticky top-0 z-20 -mx-4 mb-8 border-b border-slate-200 bg-slate-50/80 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "relative flex h-11 items-center whitespace-nowrap text-xs font-bold uppercase tracking-wider transition-colors",
                activeSection === item.id ? "text-slate-950" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {item.label}
              {activeSection === item.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-950" />
              )}
            </a>
          ))}
        </div>
      </nav>

      <Form {...productForm}>
        <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-12">
          {/* Geral */}
          <section id="geral" className="scroll-mt-24 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-6">
                <FormField
                  control={productForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Nome do Produto</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          disabled={isPending}
                          className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-400"
                          placeholder="Ex: Vestido de Seda..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Descrição</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          disabled={isPending}
                          rows={6}
                          className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                          placeholder="Detalhes sobre o material, corte, etc..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </section>

          {/* Preço & Stock */}
          <section id="preco-stock" className="scroll-mt-24 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 px-1">Preço & Stock</h2>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={productForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Preço Base (KZ)</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="number"
                          disabled={isPending}
                          className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Preço Promocional (KZ)</label>
                  <input
                    type="number"
                    value={promoPrice}
                    onChange={(e) => setPromoPrice(e.target.value)}
                    disabled={isPending}
                    className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-400"
                    placeholder="Opcional"
                  />
                </div>
                <FormField
                  control={productForm.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Stock Total</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="number"
                          disabled={isPending}
                          className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </section>

          {/* Organização */}
          <section id="organizacao" className="scroll-mt-24 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 px-1">Organização</h2>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-8">
              <FormField
                control={productForm.control}
                name="category_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Categorias</FormLabel>
                    <FormControl>
                      <CategoryCombobox
                        categories={categories}
                        selectedIds={field.value}
                        onChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 sm:grid-cols-2 pt-2">
                <FormField
                  control={productForm.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3">
                      <label className="flex cursor-pointer items-center gap-3">
                        <div className="relative flex h-6 w-11 items-center rounded-full bg-slate-200 transition focus-within:ring-2 focus-within:ring-slate-950">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            disabled={isPending}
                            className="peer sr-only"
                          />
                          <div className={cn(
                            "absolute inset-0 rounded-full transition-colors peer-checked:bg-emerald-500",
                            "bg-slate-200"
                          )} />
                          <div className="absolute h-5 w-5 translate-x-0.5 rounded-full bg-white transition peer-checked:translate-x-5.5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="block text-sm font-medium text-slate-700">Estado</span>
                          <span className="block text-[11px] text-slate-400">{field.value ? "Activo" : "Inactivo"}</span>
                        </div>
                      </label>
                    </FormItem>
                  )}
                />

                <FormField
                  control={productForm.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3">
                      <label className={cn(
                        "flex items-center gap-3",
                        !isActive ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                      )}>
                        <div className="relative flex h-6 w-11 items-center rounded-full bg-slate-200 transition focus-within:ring-2 focus-within:ring-slate-950">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            disabled={isPending || !isActive}
                            className="peer sr-only"
                          />
                          <div className={cn(
                            "absolute inset-0 rounded-full transition-colors peer-checked:bg-emerald-500",
                            "bg-slate-200"
                          )} />
                          <div className="absolute h-5 w-5 translate-x-0.5 rounded-full bg-white transition peer-checked:translate-x-5.5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="block text-sm font-medium text-slate-700">Destaque</span>
                          <span className="block text-[11px] text-slate-400">Página inicial</span>
                        </div>
                      </label>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </section>
        </form>
      </Form>

      {/* Imagens */}
      <section id="imagens" className="scroll-mt-24 space-y-4 mt-12">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Imagens</h2>
          <label className={cn(
            "flex cursor-pointer items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition",
            (!product || isPending) && "opacity-50 pointer-events-none"
          )}>
            <Upload className="h-3.5 w-3.5" />
            Carregar Imagem
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleProductImageUpload(e.target.files)}
              disabled={!product || isPending}
            />
          </label>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {!product ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Images className="h-12 w-12 text-slate-200 mb-4" />
              <p className="text-sm text-slate-500">Guarda o produto primeiro para activar os uploads.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                <SortableContext items={localProductImages.map(img => img.id)} strategy={rectSortingStrategy}>
                  {localProductImages.map((image) => (
                    <SortableImage
                      key={image.id}
                      id={image.id}
                      url={image.url}
                      isPending={isPending}
                      onRemove={() => {
                        if (confirm("Remover esta imagem?")) {
                          startTransition(async () => {
                            await deleteProductImage(image.id);
                            router.refresh();
                          });
                        }
                      }}
                    />
                  ))}
                </SortableContext>
              </div>
              {localProductImages.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">Nenhuma imagem carregada.</p>
              )}
            </DndContext>
          )}
        </div>
      </section>

      {/* Variantes */}
      <section id="variantes" className="scroll-mt-24 space-y-4 mt-12">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Variantes</h2>
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
              className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar Variante
            </button>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {!product ? (
            <p className="p-12 text-center text-sm text-slate-500">Guarda o produto para adicionar variantes.</p>
          ) : (
            <div className="divide-y divide-slate-100">
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
                      "flex w-full min-h-[44px] items-center justify-between px-6 py-4 text-left transition hover:bg-slate-50 active:bg-slate-100",
                      expandedVariantId === variant.id && "bg-slate-50/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-950">
                          {variant.size || "S/T"} · {variant.color || "S/C"}
                        </span>
                        <span className="text-xs text-slate-500">
                          Stock: {variant.stock} · {variant.is_available ? "Disponível" : "Indisponível"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {variant.variant_images?.length ? (
                        <Images className="h-4 w-4 text-slate-300" />
                      ) : null}
                      {variant.price_override && (
                        <span className="text-xs font-bold text-emerald-600">
                          {formatPrice(variant.price_override)}
                        </span>
                      )}
                      <ExternalLink className="h-4 w-4 text-slate-300 transition-transform group-hover:scale-110" />
                    </div>
                  </button>
                  
                  {isDesktop && expandedVariantId === variant.id && (
                    <div className="bg-slate-50/30 px-6 py-8 border-t border-slate-100">
                      <VariantForm
                        productId={product.id}
                        variant={variant}
                        onClose={() => setExpandedVariantId(null)}
                      />
                    </div>
                  )}
                </div>
              ))}
              
              {isDesktop && expandedVariantId === "new" && (
                <div className="bg-slate-50/30 px-6 py-8 border-t border-slate-100">
                  <VariantForm
                    productId={product.id}
                    variant={null}
                    onClose={() => setExpandedVariantId(null)}
                  />
                </div>
              )}

              {!product.product_variants?.length && !expandedVariantId && (
                <p className="p-12 text-center text-sm text-slate-400">Nenhuma variante criada.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Save Bar */}
      <StickySaveBar
        isDirty={isDirty}
        isSaving={isPending}
        onSave={productForm.handleSubmit(onProductSubmit)}
        onReset={() => {
          productForm.reset();
          setPromoPrice(initialPromotion?.is_active ? initialPromotion.promo_price.toString() : "");
          const sorted = [...(product?.product_images ?? [])].sort((a, b) => a.position - b.position);
          setLocalProductImages(sorted);
        }}
      />

      {/* Variant Editor Drawer */}
      {product && (
        <VariantEditor
          productId={product.id}
          variant={activeVariant}
          isOpen={isVariantEditorOpen}
          onClose={() => setIsVariantEditorOpen(false)}
        />
      )}

      {/* Delete Product Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={async () => {
          if (!product) return;
          const result = await deleteProduct(product.id);
          if (result.success) {
            toast.success("Produto removido.");
            router.push("/produtos");
          } else {
            toast.error(result.error ?? "Erro ao remover produto.");
          }
        }}
        title="Apagar Produto"
        description="Tens a certeza? Esta acção é irreversível e removerá todas as variantes e imagens associadas."
        confirmText="Sim, apagar"
        variant="danger"
      />
    </PageCanvas>
  );
}
