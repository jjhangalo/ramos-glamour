"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, Images, Pencil, Trash2, Upload } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";

import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  reorderProductImages,
  updateProduct,
  uploadProductImage,
} from "@/lib/actions/products";
import {
  createVariant,
  deleteVariant,
  deleteVariantImage,
  updateVariant,
  uploadVariantImage,
} from "@/lib/actions/variants";
import { allowedImageMimeTypes, maxImageSize } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { CategoryRecord, ProductRecord, ProductVariantRecord } from "@/lib/types";

type ProductEditorProps = {
  product: ProductRecord | null;
  categories: CategoryRecord[];
};

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  category_ids: string[];
  is_active: boolean;
};

type VariantFormState = {
  id?: string;
  size: string;
  color: string;
  stock: string;
  is_available: boolean;
  price_override: string;
};

const initialVariantForm: VariantFormState = {
  size: "",
  color: "",
  stock: "0",
  is_available: true,
  price_override: "",
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
  const [productForm, setProductForm] = useState<ProductFormState>({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    category_ids: product?.categories?.map((category) => category.id) ?? [],
    is_active: product?.is_active ?? true,
  });
  const [variantForm, setVariantForm] =
    useState<VariantFormState>(initialVariantForm);
  const [activeVariantForImages, setActiveVariantForImages] =
    useState<ProductVariantRecord | null>(null);

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
        { id: category.id, name: category.name, slug: category.slug, parent_id: category.parent_id },
        ...(category.children ?? []).map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          parent_id: child.parent_id,
        })),
      ]),
    [categories],
  );
  const selectedCategories = useMemo(
    () =>
      flatCategories.filter((category) =>
        productForm.category_ids.includes(category.id),
      ),
    [flatCategories, productForm.category_ids],
  );

  function toggleCategory(categoryId: string) {
    setProductForm((current) => ({
      ...current,
      category_ids: current.category_ids.includes(categoryId)
        ? current.category_ids.filter((id) => id !== categoryId)
        : [...current.category_ids, categoryId],
    }));
  }

  function handleSaveProduct() {
    startTransition(async () => {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price || 0),
        category_ids: productForm.category_ids,
        is_active: productForm.is_active,
      };

      const result = product
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);

      if (!result.success) {
        toast.error(result.error ?? "Não foi possível guardar o produto.");
        return;
      }

      toast.success(product ? "Produto actualizado." : "Produto criado.");
      if (!product && (result as any).id) {
        router.push(`/produtos/${(result as any).id}`);
      } else {
        router.refresh();
      }
    });
  }

  function handleDeleteProduct() {
    if (!product) {
      return;
    }

    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (!result.success) {
        toast.error(result.error ?? "Não foi possível remover o produto.");
        return;
      }

      toast.success("Produto removido.");
      router.push("/produtos");
      router.refresh();
    });
  }

  function handleProductImageUpload(fileList: FileList | null) {
    if (!product || !fileList?.length) {
      return;
    }

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
        toast.error(result.error ?? "Não foi possível enviar a imagem.");
        return;
      }

      toast.success("Imagem adicionada.");
      router.refresh();
    });
  }

  function handleVariantImageUpload(fileList: FileList | null) {
    if (!activeVariantForImages || !fileList?.length) {
      return;
    }

    const file = fileList[0];
    const clientError = validateClientFile(file);
    if (clientError) {
      toast.error(clientError);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadVariantImage(activeVariantForImages.id, formData);
      if (!result.success) {
        toast.error(result.error ?? "Não foi possível enviar a imagem.");
        return;
      }

      toast.success("Imagem da variação adicionada.");
      router.refresh();
    });
  }

  function handleImageReorder(imageId: string, direction: "up" | "down") {
    if (!product) {
      return;
    }

    const orderedIds = [...images].map((image) => image.id);
    const currentIndex = orderedIds.indexOf(imageId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= orderedIds.length) {
      return;
    }

    [orderedIds[currentIndex], orderedIds[targetIndex]] = [
      orderedIds[targetIndex],
      orderedIds[currentIndex],
    ];

    startTransition(async () => {
      const result = await reorderProductImages(product.id, orderedIds);
      if (!result.success) {
        toast.error(result.error ?? "Não foi possível reordenar as imagens.");
        return;
      }

      router.refresh();
    });
  }

  function handleVariantSubmit() {
    if (!product) {
      return;
    }

    startTransition(async () => {
      const payload = {
        size: variantForm.size,
        color: variantForm.color,
        stock: Number(variantForm.stock || 0),
        is_available: variantForm.is_available,
        price_override: variantForm.price_override
          ? Number(variantForm.price_override)
          : null,
      };

      const result = variantForm.id
        ? await updateVariant(variantForm.id, product.id, payload)
        : await createVariant(product.id, payload);

      if (!result.success) {
        toast.error(result.error ?? "Não foi possível guardar a variação.");
        return;
      }

      toast.success(
        variantForm.id ? "Variação actualizada." : "Variação criada.",
      );
      setVariantForm(initialVariantForm);
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
              onClick={handleDeleteProduct}
              className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
            >
              Remover produto
            </button>
          ) : null}
          <button
            type="button"
            disabled={isPending}
            onClick={handleSaveProduct}
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Guardar produto
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-950">Informação base</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Nome</label>
            <input
              value={productForm.name}
              onChange={(event) =>
                setProductForm({ ...productForm, name: event.target.value })
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Descrição
            </label>
            <textarea
              value={productForm.description}
              onChange={(event) =>
                setProductForm({ ...productForm, description: event.target.value })
              }
              rows={5}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Preço base
            </label>
            <input
              value={productForm.price}
              onChange={(event) =>
                setProductForm({ ...productForm, price: event.target.value })
              }
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">
              Categorias
            </label>
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
                            className="flex items-center gap-3 text-sm text-slate-700"
                          >
                            <input
                              type="checkbox"
                              checked={productForm.category_ids.includes(child.id)}
                              onChange={() => toggleCategory(child.id)}
                              className="h-4 w-4 rounded border-slate-300"
                            />
                            <span>{child.name}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <label className="mt-3 flex items-center gap-3 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={productForm.category_ids.includes(category.id)}
                          onChange={() => toggleCategory(category.id)}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        <span>{category.name}</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
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
          </div>
          <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={productForm.is_active}
              onChange={(event) =>
                setProductForm({ ...productForm, is_active: event.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300"
            />
            Produto activo
          </label>
        </div>
      </section>

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
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
            <Upload className="h-4 w-4" />
            Carregar imagem
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={!product}
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
                      disabled={index === 0}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleImageReorder(image.id, "down")}
                      disabled={index === images.length - 1}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      startTransition(async () => {
                        const result = await deleteProductImage(image.id);
                        if (!result.success) {
                          toast.error(result.error ?? "Não foi possível remover a imagem.");
                          return;
                        }

                        toast.success("Imagem removida.");
                        router.refresh();
                      })
                    }
                    className="rounded-lg border border-red-200 p-2 text-red-700 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {!images.length ? (
              <p className="text-sm text-slate-500">Ainda não há imagens carregadas.</p>
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
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={variantForm.size}
                  onChange={(event) =>
                    setVariantForm({ ...variantForm, size: event.target.value })
                  }
                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                  placeholder="Tamanho (opcional)"
                />
                <input
                  value={variantForm.color}
                  onChange={(event) =>
                    setVariantForm({ ...variantForm, color: event.target.value })
                  }
                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                  placeholder="Cor (opcional)"
                />
                <input
                  value={variantForm.stock}
                  onChange={(event) =>
                    setVariantForm({ ...variantForm, stock: event.target.value })
                  }
                  type="number"
                  min="0"
                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                  placeholder="Stock"
                />
                <input
                  value={variantForm.price_override}
                  onChange={(event) =>
                    setVariantForm({
                      ...variantForm,
                      price_override: event.target.value,
                    })
                  }
                  type="number"
                  min="0"
                  step="0.01"
                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                  placeholder="Preço override"
                />
              </div>
              <label className="mt-3 inline-flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={variantForm.is_available}
                  onChange={(event) =>
                    setVariantForm({
                      ...variantForm,
                      is_available: event.target.checked,
                    })
                  }
                />
                Disponível
              </label>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleVariantSubmit}
                  className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  {variantForm.id ? "Guardar variação" : "Adicionar variação"}
                </button>
                {variantForm.id ? (
                  <button
                    type="button"
                    onClick={() => setVariantForm(initialVariantForm)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                ) : null}
              </div>
            </div>
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
                    <td className="py-4 pr-4 text-slate-700">{variant.size || "—"}</td>
                    <td className="py-4 pr-4 text-slate-700">{variant.color || "—"}</td>
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
                          onClick={() =>
                            setVariantForm({
                              id: variant.id,
                              size: variant.size ?? "",
                              color: variant.color ?? "",
                              stock: String(variant.stock),
                              is_available: variant.is_available,
                              price_override: variant.price_override
                                ? String(variant.price_override)
                                : "",
                            })
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveVariantForImages(variant)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          <Images className="h-4 w-4" />
                          Imagens da variação
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            startTransition(async () => {
                              const result = await deleteVariant(variant.id, product.id);
                              if (!result.success) {
                                toast.error(result.error ?? "Não foi possível remover a variação.");
                                return;
                              }

                              toast.success("Variação removida.");
                              router.refresh();
                            })
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remover
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

            <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              <Upload className="h-4 w-4" />
              Carregar imagem
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => handleVariantImageUpload(event.target.files)}
              />
            </label>

            <div className="mt-5 space-y-4">
              {(activeVariantForImages.variant_images ?? []).length ? (
                activeVariantForImages.variant_images!.map((image) => (
                  <div key={image.id} className="rounded-2xl border border-slate-200 p-3">
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
                      onClick={() =>
                        startTransition(async () => {
                          const result = await deleteVariantImage(image.id, product?.id ?? "");
                          if (!result.success) {
                            toast.error(result.error ?? "Não foi possível remover a imagem.");
                            return;
                          }

                          toast.success("Imagem removida.");
                          router.refresh();
                        })
                      }
                      className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
