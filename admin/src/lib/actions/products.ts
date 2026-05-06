"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { allowedImageMimeTypes, maxImageSize } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProductRecord } from "@/lib/types";

type ProductFilters = {
  category_ids?: string[];
  status?: "all" | "active" | "inactive";
  search?: string;
  is_featured?: boolean;
  page?: number;
  limit?: number;
};

type ProductInput = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category_ids: string[];
  is_active: boolean;
  is_featured: boolean;
};

function getStoragePath(bucket: string, url: string) {
  const marker = `/object/public/${bucket}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(url.slice(markerIndex + marker.length));
}

function validateImage(file: File) {
  if (!allowedImageMimeTypes.includes(file.type)) {
    return "Formato não suportado. Usa JPEG, PNG ou WebP.";
  }

  if (file.size > maxImageSize) {
    return "A imagem não pode ter mais de 10 MB.";
  }

  return null;
}

async function attachCategoriesToProducts(products: ProductRecord[]) {
  const supabase = createAdminClient();
  const productIds = products.map((product) => product.id);

  if (!productIds.length) {
    return products;
  }

  const { data, error } = await supabase
    .from("product_categories")
    .select("product_id, categories(id, name, slug, parent_id)")
    .in("product_id", productIds);

  if (error) {
    throw new Error(error.message);
  }

  const categoriesByProduct = new Map<string, ProductRecord["categories"]>();

  for (const row of data ?? []) {
    const category = Array.isArray(row.categories)
      ? row.categories[0]
      : row.categories;

    if (!category) {
      continue;
    }

    const current = categoriesByProduct.get(row.product_id) ?? [];
    current.push(category);
    categoriesByProduct.set(row.product_id, current);
  }

  return products.map((product) => ({
    ...product,
    categories: categoriesByProduct.get(product.id) ?? [],
  }));
}

async function syncProductCategories(productId: string, categoryIds: string[]) {
  const supabase = createAdminClient();
  const uniqueCategoryIds = [...new Set(categoryIds.filter(Boolean))];

  const { error: deleteError } = await supabase
    .from("product_categories")
    .delete()
    .eq("product_id", productId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (uniqueCategoryIds.length) {
    const { error: insertError } = await supabase.from("product_categories").insert(
      uniqueCategoryIds.map((categoryId) => ({
        product_id: productId,
        category_id: categoryId,
      })),
    );

    if (insertError) {
      throw new Error(insertError.message);
    }
  }
}

export async function getProducts(filters: ProductFilters = {}) {
  const supabase = createAdminClient();
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("products")
    .select(
      "id, name, description, price, stock, is_active, is_featured, created_at, updated_at, product_images(id, product_id, url, position), product_variants(id, product_id, size, color, stock, is_available, price_override, created_at, updated_at)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (filters.category_ids && filters.category_ids.length > 0) {
    const { data: relations, error: relationError } = await supabase
      .from("product_categories")
      .select("product_id")
      .in("category_id", filters.category_ids);

    if (relationError) {
      throw new Error(relationError.message);
    }

    const productIds = [...new Set((relations ?? []).map((row) => row.product_id))];
    if (!productIds.length) {
      return { products: [], count: 0 };
    }

    query = query.in("id", productIds);
  }

  if (filters.status === "active") {
    query = query.eq("is_active", true);
  }

  if (filters.status === "inactive") {
    query = query.eq("is_active", false);
  }

  if (typeof filters.is_featured === "boolean") {
    query = query.eq("is_featured", filters.is_featured);
  }

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const products = await attachCategoriesToProducts((data ?? []) as ProductRecord[]);
  
  return {
    products,
    count: count ?? 0,
  };
}

export async function getProduct(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, description, price, stock, is_active, is_featured, created_at, updated_at, product_images(id, product_id, url, position), product_variants(id, product_id, size, color, stock, is_available, price_override, created_at, updated_at, variant_images(id, variant_id, url, position))",
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const [product] = await attachCategoriesToProducts([data as ProductRecord]);
  return product;
}

export async function createProduct(input: ProductInput) {
  const supabase = createAdminClient();
  const payload = {
    name: input.name.trim(),
    description: input.description.trim() || null,
    price: input.price,
    stock: input.stock,
    is_active: input.is_active,
    is_featured: input.is_featured,
  };

  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  try {
    await syncProductCategories(data.id, input.category_ids);
  } catch (syncError) {
    return {
      success: false,
      error:
        syncError instanceof Error
          ? syncError.message
          : "Não foi possível sincronizar categorias do produto.",
    };
  }

  revalidatePath("/produtos");
  return { success: true, id: data.id };
}

export async function updateProduct(id: string, input: ProductInput) {
  const supabase = createAdminClient();
  const payload = {
    name: input.name.trim(),
    description: input.description.trim() || null,
    price: input.price,
    stock: input.stock,
    is_active: input.is_active,
    is_featured: input.is_featured,
  };

  const { error } = await supabase.from("products").update(payload).eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  try {
    await syncProductCategories(id, input.category_ids);
  } catch (syncError) {
    return {
      success: false,
      error:
        syncError instanceof Error
          ? syncError.message
          : "Não foi possível sincronizar categorias do produto.",
    };
  }

  revalidatePath("/produtos");
  revalidatePath(`/produtos/${id}`);
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/produtos");
  return { success: true };
}

export async function uploadProductImages(productId: string, formData: FormData) {
  const supabase = createAdminClient();
  const files = formData.getAll("files");

  if (!files.length) {
    return { success: false, error: "Selecciona pelo menos uma imagem válida." };
  }

  const results = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;

    const validationError = validateImage(file);
    if (validationError) {
      return { success: false, error: `${file.name}: ${validationError}` };
    }

    const extension = file.name.split(".").pop() ?? "jpg";
    const storagePath = `${productId}/${Date.now()}-${randomUUID()}.${extension}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: `Erro no upload (${file.name}): ${uploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(storagePath);

    results.push({ url: publicUrl });
  }

  const { data: lastImage } = await supabase
    .from("product_images")
    .select("position")
    .eq("product_id", productId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextPosition = (lastImage?.position ?? -1) + 1;

  const { error: insertError } = await supabase.from("product_images").insert(
    results.map((res) => ({
      product_id: productId,
      url: res.url,
      position: nextPosition++,
    })),
  );

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  revalidatePath(`/produtos/${productId}`);
  revalidatePath("/produtos");
  return { success: true };
}

export async function deleteProductImage(imageId: string) {
  const supabase = createAdminClient();
  const { data: image, error: fetchError } = await supabase
    .from("product_images")
    .select("id, product_id, url")
    .eq("id", imageId)
    .single();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  const storagePath = getStoragePath("product-images", image.url);
  if (storagePath) {
    await supabase.storage.from("product-images").remove([storagePath]);
  }

  const { error } = await supabase.from("product_images").delete().eq("id", imageId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/produtos/${image.product_id}`);
  revalidatePath("/produtos");
  return { success: true };
}

export async function reorderProductImages(productId: string, orderedIds: string[]) {
  const supabase = createAdminClient();

  for (const [position, id] of orderedIds.entries()) {
    const { error } = await supabase
      .from("product_images")
      .update({ position })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  revalidatePath(`/produtos/${productId}`);
  revalidatePath("/produtos");
  return { success: true };
}

export async function toggleProductActive(productId: string, currentValue: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: !currentValue })
    .eq("id", productId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/produtos");
  return { success: true };
}

export async function toggleProductFeatured(productId: string, currentValue: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("products")
    .update({ is_featured: !currentValue })
    .eq("id", productId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/produtos");
  return { success: true };
}
