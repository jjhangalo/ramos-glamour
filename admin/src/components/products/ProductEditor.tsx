"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Images,
  Loader2,
  Pencil,
  Trash2,
  Upload,
  GripVertical,
  Check,
  Save,
} from "lucide-react";
import { StickySaveBar } from "@/components/ui/StickySaveBar";
import { useMemo, useState, useTransition, useCallback, useEffect, useRef } from "react";
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
  verticalListSortingStrategy,
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
  createVariant,
  deleteVariant,
  deleteVariantImage,
  updateVariant,
  uploadVariantImages,
  reorderVariantImages,
} from "@/lib/actions/variants";
import { allowedImageMimeTypes, maxImageSize } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type {
  CategoryRecord,
  ProductRecord,
  ProductVariantRecord,
} from "@/lib/types";
import {
  productSchema,
  variantSchema,
  type ProductFormValues,
  type VariantFormValues,
} from "@/lib/validations/product";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

type SortableImageProps = {
  id: string;
  url: string;
  onRemove: () => void;
  isPending: boolean;
  aspectClassName?: string;
  overlayLabel?: string;
};

function SortableImage({
  id,
  url,
  onRemove,
  isPending,
  aspectClassName = "aspect-[4/5]",
  overlayLabel,
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
      className="group relative h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className={cn("relative overflow-hidden rounded-xl bg-slate-100", aspectClassName)}>
        <Image 
          src={url} 
          alt={overlayLabel || "Imagem"} 
          fill 
          className="object-cover" 
          sizes="(max-width: 768px) 100vw, 300px"
        />
        
        {/* Drag Handle Overlay */}
        <div 
          {...attributes} 
          {...listeners}
          className="absolute inset-0 flex cursor-grab items-center justify-center bg-slate-950/0 transition-colors group-hover:bg-slate-950/20 active:cursor-grabbing"
        >
          <GripVertical className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-400">Arraste para reordenar</span>
        <button
          type="button"
          disabled={isPending}
          onClick={onRemove}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

type ProductEditorProps = {
  product: ProductRecord | null;
  categories: CategoryRecord[];
};

function validateClientFile(file: File) {
  if (!allowedImageMimeTypes.includes(file.type)) {
    return "Formato não suportado. Usa JPEG, PNG ou WebP.";
  }

  if (file.size > maxImageSize) {
    return "A imagem não pode ter mais de 10 MB.";
  }

  return null;
}

export function ProductEditor({ product, categories }: ProductEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeVariantForImages, setActiveVariantForImages] =
    useState<ProductVariantRecord | null>(null);
  const [isProductConfirmOpen, setIsProductConfirmOpen] = useState(false);
  const [isVariantConfirmOpen, setIsVariantConfirmOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<{
    id: string;
    productId: string;
  } | null>(null);

  // Local states for image ordering
  const [localProductImages, setLocalProductImages] = useState<{ id: string; url: string; position: number }[]>([]);
  const [localVariantImages, setLocalVariantImages] = useState<{ id: string; url: string; position: number }[]>([]);

  // Sync product images from props
  useEffect(() => {
    const sortedProps = [...(product?.product_images ?? [])].sort(
      (a, b) => a.position - b.position
    );
    setLocalProductImages(sortedProps);
  }, [product?.product_images]);

  // Sync variant images when side panel opens or images change
  useEffect(() => {
    if (activeVariantForImages) {
      const sortedProps = [...(activeVariantForImages.variant_images ?? [])].sort(
        (a, b) => a.position - b.position
      );
      setLocalVariantImages(sortedProps);
    } else {
      setLocalVariantImages([]);
    }
  }, [activeVariantForImages, activeVariantForImages?.variant_images]);

  const hasProductImageChanges = useMemo(() => {
    const propIds = (product?.product_images ?? [])
      .sort((a, b) => a.position - b.position)
      .map((img) => img.id)
      .join(",");
    const localIds = localProductImages.map((img) => img.id).join(",");
    return propIds !== localIds;
  }, [product?.product_images, localProductImages]);

  const hasVariantImageChanges = useMemo(() => {
    if (!activeVariantForImages) return false;
    const propIds = (activeVariantForImages.variant_images ?? [])
      .sort((a, b) => a.position - b.position)
      .map((img) => img.id)
      .join(",");
    const localIds = localVariantImages.map((img) => img.id).join(",");
    return propIds !== localIds;
  }, [activeVariantForImages, localVariantImages]);

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as import("react-hook-form").Resolver<ProductFormValues>,
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      category_ids: product?.categories?.map((category) => category.id) ?? [],
      stock: product?.stock ?? 0,
      is_active: product?.is_active ?? true,
      is_featured: product?.is_featured ?? false,
    },
  });

  const variantForm = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema) as import("react-hook-form").Resolver<VariantFormValues>,
    defaultValues: {
      size: "",
      color: "",
      stock: 0,
      is_available: true,
      price_override: null,
    },
  });

  // Replaced memo with state + useEffect above

  const variants = useMemo(
    () =>
      [...(product?.product_variants ?? [])].sort((left, right) =>
        left.created_at.localeCompare(right.created_at),
      ),
    [product?.product_variants],
  );

  const flatCategories = useMemo(
    () =>
      categories.flatMap((category) => [
        {
          id: category.id,
          name: category.name,
          slug: category.slug,
          parent_id: category.parent_id,
        },
        ...(category.children ?? []).map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          parent_id: child.parent_id,
        })),
      ]),
    [categories],
  );

  const watchedCategoryIds = productForm.watch("category_ids") ?? [];

  const sortedFlatCategories = useMemo(() => {
    return [...flatCategories].sort((a, b) => a.name.localeCompare(b.name));
  }, [flatCategories]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDown.current = true;
    scrollRef.current.classList.add("cursor-grabbing");
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    if (scrollRef.current) scrollRef.current.classList.remove("cursor-grabbing");
  };

  const handleMouseUp = () => {
    isDown.current = false;
    if (scrollRef.current) scrollRef.current.classList.remove("cursor-grabbing");
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  function getParentName(parentId: string | null) {
    if (!parentId) return null;
    return categories.find((c) => c.id === parentId)?.name ?? null;
  }

  function toggleCategory(categoryId: string) {
    const currentIds = productForm.getValues("category_ids");
    const newIds = currentIds.includes(categoryId)
      ? currentIds.filter((id) => id !== categoryId)
      : [...currentIds, categoryId];
    productForm.setValue("category_ids", newIds, { shouldValidate: true });
  }

  const onProductSubmit = (values: ProductFormValues) => {
    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, values)
        : await createProduct(values);

      if (!result.success) {
        toast.error(result.error ?? "Erro ao guardar o produto.");
        return;
      }

      toast.success(product ? "Produto actualizado." : "Produto criado.");
      if (!product && "id" in result && typeof result.id === "string") {
        router.push(`/produtos/${result.id}`);
      } else {
        router.refresh();
      }
    });
  };

  const onVariantSubmit = (values: VariantFormValues) => {
    if (!product) return;

    startTransition(async () => {
      const input = {
        ...values,
        size: values.size ?? "",
        color: values.color ?? "",
        price_override: values.price_override ?? null,
      };

      const result = values.id
        ? await updateVariant(values.id, product.id, input)
        : await createVariant(product.id, input);

      if (!result.success) {
        toast.error(result.error ?? "Erro ao guardar a variação.");
        return;
      }

      toast.success(values.id ? "Variação actualizada." : "Variação criada.");
      variantForm.reset({
        size: "",
        color: "",
        stock: 0,
        is_available: true,
        price_override: null,
      });
      router.refresh();
    });
  };

  function handleDeleteProduct() {
    if (!product) return;
    setIsProductConfirmOpen(true);
  }

  function handleProductImageUpload(fileList: FileList | null) {
    if (!product || !fileList?.length) return;

    const files = Array.from(fileList);
    const formData = new FormData();
    
    for (const file of files) {
      const clientError = validateClientFile(file);
      if (clientError) {
        toast.error(`${file.name}: ${clientError}`);
        return;
      }
      formData.append("files", file);
    }

    startTransition(async () => {
      const result = await uploadProductImages(product.id, formData);
      if (!result.success) {
        toast.error(result.error ?? "Erro ao enviar as imagens.");
        return;
      }

      toast.success(files.length > 1 ? "Imagens adicionadas." : "Imagem adicionada.");
      router.refresh();
    });
  }

  function handleVariantImageUpload(fileList: FileList | null) {
    if (!activeVariantForImages || !fileList?.length) return;

    const files = Array.from(fileList);
    const formData = new FormData();

    for (const file of files) {
      const clientError = validateClientFile(file);
      if (clientError) {
        toast.error(`${file.name}: ${clientError}`);
        return;
      }
      formData.append("files", file);
    }

    startTransition(async () => {
      const result = await uploadVariantImages(
        activeVariantForImages.id,
        formData,
      );
      if (!result.success) {
        toast.error(result.error ?? "Erro ao enviar as imagens.");
        return;
      }

      toast.success(files.length > 1 ? "Imagens da variação adicionadas." : "Imagem da variação adicionada.");
      router.refresh();
    });
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleProductDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalProductImages((items) => {
      const oldIndex = items.findIndex((img) => img.id === active.id);
      const newIndex = items.findIndex((img) => img.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }, []);

  const handleSaveProductOrder = () => {
    if (!product) return;
    const orderedIds = localProductImages.map((img) => img.id);

    startTransition(async () => {
      const result = await reorderProductImages(product.id, orderedIds);
      if (!result.success) {
        toast.error(result.error ?? "Erro ao guardar a ordem das imagens.");
        return;
      }
      toast.success("Ordem das imagens guardada.");
      router.refresh();
    });
  };

  const handleVariantDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalVariantImages((items) => {
      const oldIndex = items.findIndex((img) => img.id === active.id);
      const newIndex = items.findIndex((img) => img.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }, []);

  const handleSaveVariantOrder = () => {
    if (!activeVariantForImages) return;
    const orderedIds = localVariantImages.map((img) => img.id);

    startTransition(async () => {
      const result = await reorderVariantImages(
        activeVariantForImages.id,
        product?.id ?? "",
        orderedIds
      );
      if (!result.success) {
        toast.error(result.error ?? "Erro ao guardar a ordem das imagens.");
        return;
      }
      toast.success("Ordem das imagens da variação guardada.");
      router.refresh();
    });
  };

  function handleImageReorder(imageId: string, direction: "up" | "down") {
    // Mantido apenas para compatibilidade se necessário, mas removido do UI
    if (!product) return;

    const orderedIds = [...localProductImages].map((image) => image.id);
    const currentIndex = orderedIds.indexOf(imageId);
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= orderedIds.length) return;

    [orderedIds[currentIndex], orderedIds[targetIndex]] = [
      orderedIds[targetIndex],
      orderedIds[currentIndex],
    ];

    startTransition(async () => {
      const result = await reorderProductImages(product.id, orderedIds);
      if (!result.success) {
        toast.error(result.error ?? "Erro ao reordenar as imagens.");
        return;
      }
      router.refresh();
    });
  }

  const [activeSection, setActiveSection] = useState("geral");

  const sections = [
    { id: "geral", label: "Informação Geral" },
    { id: "preco", label: "Preço & Stock" },
    { id: "categorias", label: "Categorias" },
    { id: "imagens", label: "Imagens" },
    { id: "variantes", label: "Variantes" },
  ];

  // Scroll spy for side nav
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((s) => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDirty = productForm.formState.isDirty || hasProductImageChanges;

  return (
    <PageCanvas size="form" className="space-y-8 py-8 pb-40">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Produtos
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-950">
              {product ? product.name : "Novo produto"}
            </h1>
          </div>
        </header>

        <nav className="sticky top-0 z-20 -mx-4 border-b border-slate-200 bg-slate-50/90 px-4 py-2 backdrop-blur-md md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all",
                  activeSection === section.id
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                )}
              >
                {section.label}
              </a>
            ))}
          </div>
        </nav>

      <Form {...productForm}>
        <form
          id="product-form"
          onSubmit={productForm.handleSubmit(onProductSubmit)}
          className="space-y-6"
        >
          <section id="geral" className="scroll-mt-32 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-950">Informação Geral</h2>
              <p className="text-sm text-slate-500">Nome e descrição pública do produto.</p>
            </div>
            <div className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm focus-within:shadow-md transition-shadow">
              <FormField
                control={productForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nome</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        disabled={isPending}
                        className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
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
                  <FormItem className="md:col-span-2">
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        disabled={isPending}
                        rows={5}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500 disabled:bg-slate-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
          </section>

          <section id="preco" className="scroll-mt-32 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-950">Preço & Stock</h2>
              <p className="text-sm text-slate-500">Valores base e inventário.</p>
            </div>
            <div className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm focus-within:shadow-md transition-shadow sm:grid-cols-2">
              <FormField
                control={productForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Preço base</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        disabled={isPending}
                        className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={productForm.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Stock disponível</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        type="number"
                        min="0"
                        disabled={isPending}
                        className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <section id="categorias" className="scroll-mt-32 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-950">Categorias & Visibilidade</h2>
              <p className="text-sm text-slate-500">Organização do catálogo e presença na loja.</p>
            </div>
            <div className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm focus-within:shadow-md transition-shadow">
              <FormField
                control={productForm.control}
                name="category_ids"
                render={() => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Categorias</FormLabel>
                    <FormControl>
                      <div 
                        ref={scrollRef}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className="flex w-full cursor-grab select-none gap-2 overflow-x-auto pb-2 scrollbar-hide flex-nowrap [&::-webkit-scrollbar]:hidden"
                      >
                        {sortedFlatCategories.map((category) => {
                          const isSelected = watchedCategoryIds.includes(category.id);
                          const parentName = getParentName(category.parent_id);
                          
                          return (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => toggleCategory(category.id)}
                              disabled={isPending}
                              className={cn(
                                "rounded-md border px-3 py-1.5 text-xs font-medium transition whitespace-nowrap shrink-0",
                                isSelected
                                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                              )}
                            >
                              {parentName && (
                                <span className={isSelected ? "text-slate-400" : "text-slate-400"}>
                                  {parentName} ·{" "}
                                </span>
                              )}
                              {category.name}
                            </button>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={productForm.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border border-slate-100 p-4 transition-colors hover:bg-slate-50">
                      <FormControl>
                        <input
                          type="checkbox"
                          disabled={isPending}
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                        />
                      </FormControl>
                      <div className="space-y-0.5 leading-none">
                        <FormLabel className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Disponível
                        </FormLabel>
                        <p className="text-[11px] text-slate-400">Visível na loja.</p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={productForm.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border border-slate-100 p-4 transition-colors hover:bg-slate-50">
                      <FormControl>
                        <input
                          type="checkbox"
                          disabled={isPending}
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                        />
                      </FormControl>
                      <div className="space-y-0.5 leading-none">
                        <FormLabel className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Destaque
                        </FormLabel>
                        <p className="text-[11px] text-slate-400">Seções especiais.</p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </section>
        </form>
      </Form>

      <section id="imagens" className="scroll-mt-32 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-950">Imagens</h2>
          <p className="text-sm text-slate-500">Gestão de media visual.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm focus-within:shadow-md transition-shadow">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Imagens do produto
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Formatos aceites: JPEG, PNG, WebP. Máximo 10 MB.
            </p>
          </div>
          <div className="flex gap-3">
            {hasProductImageChanges ? (
              <button
                type="button"
                disabled={isPending}
                onClick={handleSaveProductOrder}
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Guardar Ordem
              </button>
            ) : null}
            <label
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50",
                (!product || isPending) && "opacity-50 cursor-not-allowed",
              )}
            >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Carregar imagem
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              multiple
              disabled={!product || isPending}
              onChange={(event) => handleProductImageUpload(event.target.files)}
            />
          </label>
        </div>

        {product ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleProductDragEnd}
          >
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SortableContext
                items={localProductImages.map((img) => img.id)}
                strategy={rectSortingStrategy}
              >
                {localProductImages.map((image) => (
                  <SortableImage
                    key={image.id}
                    id={image.id}
                    url={image.url}
                    isPending={isPending}
                    overlayLabel={product.name}
                    onRemove={() =>
                      startTransition(async () => {
                        const result = await deleteProductImage(image.id);
                        if (!result.success) {
                          toast.error(
                            result.error ?? "Erro ao remover a imagem.",
                          );
                          return;
                        }
                        toast.success("Imagem removida.");
                        router.refresh();
                      })
                    }
                  />
                ))}
              </SortableContext>
              {!localProductImages.length ? (
                <p className="text-sm text-slate-500">
                  Ainda não há imagens carregadas.
                </p>
              ) : null}
            </div>
          </DndContext>
        ) : (
          <p className="mt-5 text-sm text-slate-500">
            Guarda primeiro o produto para activar os uploads.
          </p>
        )}
        </div>
      </div>
      </section>

      <section id="variantes" className="scroll-mt-32 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-950">Variantes</h2>
          <p className="text-sm text-slate-500">Opções de tamanho e cor.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm focus-within:shadow-md transition-shadow">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Variações</h2>
            <p className="mt-1 text-sm text-slate-500">
              Opções por tamanho, cor, stock e preço específico.
            </p>
          </div>
          {product ? (
            <Form {...variantForm}>
              <form
                onSubmit={variantForm.handleSubmit(onVariantSubmit)}
                className="rounded-lg border border-slate-100 bg-slate-50 p-4"
              >
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <FormField
                    control={variantForm.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <input
                            {...field}
                            disabled={isPending}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100 placeholder:text-slate-400"
                            placeholder="Tamanho (ex: XL)"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={variantForm.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <input
                            {...field}
                            disabled={isPending}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100 placeholder:text-slate-400"
                            placeholder="Cor (ex: Preto)"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={variantForm.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <input
                            {...field}
                            type="number"
                            min="0"
                            disabled={isPending}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100 placeholder:text-slate-400"
                            placeholder="Stock"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={variantForm.control}
                    name="price_override"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <input
                            {...field}
                            value={field.value ?? ""}
                            type="number"
                            min="0"
                            step="0.01"
                            disabled={isPending}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100 placeholder:text-slate-400"
                            placeholder="Preço (opcional)"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <FormField
                    control={variantForm.control}
                    name="is_available"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            disabled={isPending}
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                          />
                        </FormControl>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500 cursor-pointer">
                          Disponível
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                    {variantForm.watch("id")
                      ? "Guardar variação"
                      : "Adicionar variação"}
                  </button>
                  {variantForm.watch("id") ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        variantForm.reset({
                          size: "",
                          color: "",
                          stock: 0,
                          is_available: true,
                          price_override: null,
                        })
                      }
                      className="rounded-md border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  ) : null}
                </div>
              </form>
            </Form>
          ) : null}
        </div>

        {product ? (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr className="border-b border-slate-200">
                  <th className="py-3 pr-4 font-medium">Tamanho</th>
                  <th className="py-3 pr-4 font-medium">Cor</th>
                  <th className="py-3 pr-4 font-medium">Stock</th>
                  <th className="py-3 pr-4 font-medium">Disponível</th>
                  <th className="py-3 pr-4 font-medium">Preço override</th>
                  <th className="py-3 font-medium">Acções</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr key={variant.id} className="border-b border-slate-100">
                    <td className="py-4 pr-4 text-slate-700">
                      {variant.size || "—"}
                    </td>
                    <td className="py-4 pr-4 text-slate-700">
                      {variant.color || "—"}
                    </td>
                    <td className="py-4 pr-4 text-slate-700">{variant.stock}</td>
                    <td className="py-4 pr-4 text-slate-700">
                      {variant.is_available ? "Sim" : "Não"}
                    </td>
                    <td className="py-4 pr-4 text-slate-700">
                      {variant.price_override
                        ? formatPrice(variant.price_override)
                        : "Preço base"}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            variantForm.reset({
                              id: variant.id,
                              size: variant.size ?? "",
                              color: variant.color ?? "",
                              stock: variant.stock,
                              is_available: variant.is_available,
                              price_override: variant.price_override,
                            })
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => setActiveVariantForImages(variant)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                          <Images className="h-4 w-4" />
                          Imagens da variação
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => {
                            setSelectedVariant({
                              id: variant.id,
                              productId: product.id,
                            });
                            setIsVariantConfirmOpen(true);
                          }}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!variants.length ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-slate-500">
                      Ainda não há variações cadastradas.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">
            Guarda o produto primeiro para activar as variações.
          </p>
        )}
        </div>
      </section>

      {activeVariantForImages ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 p-4">
          <div className="h-full w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Imagens da variação
                </h2>
                <p className="text-sm text-slate-500">
                  {activeVariantForImages.size || "Sem tamanho"} ·{" "}
                  {activeVariantForImages.color || "Sem cor"}
                </p>
              </div>
              <div className="flex gap-2">
                {hasVariantImageChanges ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleSaveVariantOrder}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-bg text-slate-900 border border-slate-200 transition hover:bg-slate-50 disabled:opacity-50"
                    title="Guardar Ordem"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setActiveVariantForImages(null)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Fechar
                </button>
              </div>
            </div>

            <label
              className={cn(
                "mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100",
                isPending && "opacity-50 cursor-not-allowed",
              )}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Carregar imagem
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                multiple
                disabled={isPending}
                onChange={(event) =>
                  handleVariantImageUpload(event.target.files)
                }
              />
            </label>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleVariantDragEnd}
            >
              <div className="mt-5 space-y-4">
                <SortableContext
                  items={localVariantImages.map((img) => img.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {localVariantImages.length ? (
                    localVariantImages.map((image) => (
                      <SortableImage
                        key={image.id}
                        id={image.id}
                        url={image.url}
                        isPending={isPending}
                        overlayLabel="Imagem da variação"
                        onRemove={() =>
                          startTransition(async () => {
                            const result = await deleteVariantImage(
                              image.id,
                              product?.id ?? "",
                            );
                            if (!result.success) {
                              toast.error(
                                result.error ?? "Erro ao remover a imagem.",
                              );
                              return;
                            }
                            toast.success("Imagem removida.");
                            router.refresh();
                          })
                        }
                      />
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      Esta variação ainda não tem imagens próprias.
                    </p>
                  )}
                </SortableContext>
              </div>
            </DndContext>
          </div>
        </div>
      ) : null}

      <StickySaveBar
        isDirty={isDirty}
        isSaving={isPending}
        onSave={productForm.handleSubmit(onProductSubmit)}
        onReset={() => productForm.reset()}
      />

      <ConfirmDialog
        open={isProductConfirmOpen}
        onOpenChange={setIsProductConfirmOpen}
        title="Eliminar produto"
        description="Esta acção é irreversível. Tens a certeza que pretendes remover este produto?"
        confirmLabel="Sim, eliminar"
        variant="destructive"
        onConfirm={() => {
          if (!product) return;
          startTransition(async () => {
            const result = await deleteProduct(product.id);
            if (!result.success) {
              toast.error(result.error ?? "Erro ao remover o produto.");
              return;
            }

            toast.success("Produto removido.");
            router.push("/produtos");
            router.refresh();
          });
        }}
      />

      <ConfirmDialog
        open={isVariantConfirmOpen}
        onOpenChange={setIsVariantConfirmOpen}
        title="Eliminar variação"
        description="Esta acção é irreversível. Tens a certeza que pretendes remover esta variação?"
        confirmLabel="Sim, eliminar"
        variant="destructive"
        onConfirm={() => {
          if (!selectedVariant) return;
          startTransition(async () => {
            const result = await deleteVariant(
              selectedVariant.id,
              selectedVariant.productId,
            );
            if (!result.success) {
              toast.error(result.error ?? "Erro ao remover a variação.");
              return;
            }
            toast.success("Variação removida.");
            router.refresh();
          });
        }}
      />
    </PageCanvas>
  );
}
