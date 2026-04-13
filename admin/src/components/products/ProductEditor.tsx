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
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  reorderProductImages,
  updateProduct,
  uploadProductImage,
} from "@/lib/actions/products";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  createVariant,
  deleteVariant,
  deleteVariantImage,
  updateVariant,
  uploadVariantImage,
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

type ProductEditorProps = {
  product: ProductRecord | null;
  categories: CategoryRecord[];
};

function validateClientFile(file: File) {
  if (!allowedImageMimeTypes.includes(file.type)) {
    return "Formato não suportado. Usa JPEG, PNG ou WebP.";
  }

  if (file.size > maxImageSize) {
    return "A imagem não pode ter mais de 5 MB.";
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

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      category_ids: product?.categories?.map((category) => category.id) ?? [],
      is_active: product?.is_active ?? true,
    },
  });

  const variantForm = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema) as any,
    defaultValues: {
      size: "",
      color: "",
      stock: 0,
      is_available: true,
      price_override: null,
    },
  });

  const images = useMemo(
    () =>
      [...(product?.product_images ?? [])].sort(
        (left, right) => left.position - right.position,
      ),
    [product?.product_images],
  );

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

  const selectedCategories = useMemo(() => {
    const ids = productForm.watch("category_ids") ?? [];
    return flatCategories.filter((category) => ids.includes(category.id));
  }, [flatCategories, productForm.watch("category_ids")]);

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
      if (!product && (result as any).id) {
        router.push(`/produtos/${(result as any).id}`);
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

    const file = fileList[0];
    const clientError = validateClientFile(file);
    if (clientError) {
      toast.error(clientError);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadProductImage(product.id, formData);
      if (!result.success) {
        toast.error(result.error ?? "Erro ao enviar a imagem.");
        return;
      }

      toast.success("Imagem adicionada.");
      router.refresh();
    });
  }

  function handleVariantImageUpload(fileList: FileList | null) {
    if (!activeVariantForImages || !fileList?.length) return;

    const file = fileList[0];
    const clientError = validateClientFile(file);
    if (clientError) {
      toast.error(clientError);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadVariantImage(
        activeVariantForImages.id,
        formData,
      );
      if (!result.success) {
        toast.error(result.error ?? "Erro ao enviar a imagem.");
        return;
      }

      toast.success("Imagem da variação adicionada.");
      router.refresh();
    });
  }

  function handleImageReorder(imageId: string, direction: "up" | "down") {
    if (!product) return;

    const orderedIds = [...images].map((image) => image.id);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Produtos
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">
            {product ? product.name : "Novo produto"}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/produtos"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Voltar
          </Link>
          {product ? (
            <button
              type="button"
              disabled={isPending}
              onClick={handleDeleteProduct}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Remover produto
            </button>
          ) : null}
          <button
            type="submit"
            form="product-form"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Guardar produto
          </button>
        </div>
      </div>

      <Form {...productForm}>
        <form
          id="product-form"
          onSubmit={productForm.handleSubmit(onProductSubmit)}
          className="space-y-6"
        >
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Informação base
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <FormField
                control={productForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        disabled={isPending}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500 disabled:bg-slate-50"
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

              <FormField
                control={productForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço base</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        disabled={isPending}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500 disabled:bg-slate-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={productForm.control}
                name="category_ids"
                render={() => (
                  <FormItem className="space-y-3">
                    <FormLabel>Categorias</FormLabel>
                    <FormControl>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="space-y-4">
                          {categories.map((category) => (
                            <div key={category.id}>
                              <p className="text-sm font-semibold text-slate-900">
                                {category.name}
                              </p>
                              {category.children?.length ? (
                                <div className="mt-3 space-y-2 border-l border-slate-200 pl-4">
                                  {category.children.map((child) => (
                                    <label
                                      key={child.id}
                                      className="flex cursor-pointer items-center gap-3 text-sm text-slate-700"
                                    >
                                      <input
                                        type="checkbox"
                                        disabled={isPending}
                                        checked={productForm
                                          .watch("category_ids")
                                          .includes(child.id)}
                                        onChange={() => toggleCategory(child.id)}
                                        className="h-4 w-4 rounded border-slate-300 cursor-pointer"
                                      />
                                      <span>{child.name}</span>
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <label className="mt-3 flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                                  <input
                                    type="checkbox"
                                    disabled={isPending}
                                    checked={productForm
                                      .watch("category_ids")
                                      .includes(category.id)}
                                    onChange={() => toggleCategory(category.id)}
                                    className="h-4 w-4 rounded border-slate-300 cursor-pointer"
                                  />
                                  <span>{category.name}</span>
                                </label>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    {selectedCategories.length ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedCategories.map((category) => (
                          <span
                            key={category.id}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Nenhuma categoria seleccionada.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={productForm.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        disabled={isPending}
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-slate-300 cursor-pointer"
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Produto activo
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </section>
        </form>
      </Form>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Imagens do produto
            </h2>
            <p className="text-sm text-slate-500">
              Formatos aceites: JPEG, PNG, WebP. Máximo 5 MB.
            </p>
          </div>
          <label
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100",
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
              disabled={!product || isPending}
              onChange={(event) => handleProductImageUpload(event.target.files)}
            />
          </label>
        </div>

        {product ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="rounded-2xl border border-slate-200 p-3"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-slate-100">
                  <Image
                    src={image.url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleImageReorder(image.id, "up")}
                      disabled={index === 0 || isPending}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleImageReorder(image.id, "down")}
                      disabled={index === images.length - 1 || isPending}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
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
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
            {!images.length ? (
              <p className="text-sm text-slate-500">
                Ainda não há imagens carregadas.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">
            Guarda primeiro o produto para activar os uploads.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Variações</h2>
            <p className="text-sm text-slate-500">
              Define opções por tamanho, cor, stock e preço específico.
            </p>
          </div>
          {product ? (
            <Form {...variantForm}>
              <form
                onSubmit={variantForm.handleSubmit(onVariantSubmit)}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField
                    control={variantForm.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <input
                            {...field}
                            disabled={isPending}
                            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100 placeholder:text-slate-400"
                            placeholder="Tamanho (opcional)"
                          />
                        </FormControl>
                        <FormMessage />
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
                            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100 placeholder:text-slate-400"
                            placeholder="Cor (opcional)"
                          />
                        </FormControl>
                        <FormMessage />
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
                            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100 placeholder:text-slate-400"
                            placeholder="Stock"
                          />
                        </FormControl>
                        <FormMessage />
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
                            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100 placeholder:text-slate-400"
                            placeholder="Preço override"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={variantForm.control}
                  name="is_available"
                  render={({ field }) => (
                    <FormItem className="mt-3 flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          disabled={isPending}
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-slate-300 cursor-pointer"
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">
                        Disponível
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <div className="mt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
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
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
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
              <button
                type="button"
                onClick={() => setActiveVariantForImages(null)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Fechar
              </button>
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
                disabled={isPending}
                onChange={(event) =>
                  handleVariantImageUpload(event.target.files)
                }
              />
            </label>

            <div className="mt-5 space-y-4">
              {(activeVariantForImages.variant_images ?? []).length ? (
                activeVariantForImages.variant_images!.map((image) => (
                  <div
                    key={image.id}
                    className="rounded-2xl border border-slate-200 p-3"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-slate-100">
                      <Image
                        src={image.url}
                        alt="Imagem da variação"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
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
                      className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Remover
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Esta variação ainda não tem imagens próprias.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}

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
    </div>
  );
}
