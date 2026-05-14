"use server";

import { revalidatePath } from "next/cache";

import { slugify } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CategoryRecord } from "@/lib/types";

type CategoryInput = {
  name: string;
  slug: string;
  parent_id?: string | null;
};

async function validateParentCategory(parentId: string | null | undefined) {
  if (!parentId) {
    return { success: true as const };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, parent_id")
    .eq("id", parentId)
    .maybeSingle();

  if (error) {
    return { success: false as const, error: error.message };
  }

  if (!data) {
    return { success: false as const, error: "Categoria pai inválida." };
  }

  if (data.parent_id) {
    return {
      success: false as const,
      error: "Só é possível usar categorias raiz como categoria pai.",
    };
  }

  return { success: true as const };
}

export async function getCategories() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, created_at")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CategoryRecord[];
}

export async function createCategory(input: CategoryInput) {
  const parentValidation = await validateParentCategory(input.parent_id);
  if (!parentValidation.success) {
    return parentValidation;
  }

  const supabase = createAdminClient();
  const payload = {
    name: input.name.trim(),
    slug: slugify(input.slug || input.name),
    parent_id: input.parent_id || null,
  };

  const { error } = await supabase.from("categories").insert(payload);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/categorias");
  revalidatePath("/produtos");
  return { success: true };
}

export async function updateCategory(id: string, input: CategoryInput) {
  if (input.parent_id === id) {
    return {
      success: false,
      error: "Uma categoria não pode ser pai de si própria.",
    };
  }

  const parentValidation = await validateParentCategory(input.parent_id);
  if (!parentValidation.success) {
    return parentValidation;
  }

  const supabase = createAdminClient();
  const payload = {
    name: input.name.trim(),
    slug: slugify(input.slug || input.name),
    parent_id: input.parent_id || null,
  };

  const { error } = await supabase.from("categories").update(payload).eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/categorias");
  revalidatePath("/produtos");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient();

  const [{ count: childCount, error: childError }, { count: relationCount, error: relationError }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id", { count: "exact", head: true })
        .eq("parent_id", id),
      supabase
        .from("product_categories")
        .select("product_id", { count: "exact", head: true })
        .eq("category_id", id),
    ]);

  if (childError) {
    return { success: false, error: childError.message };
  }

  if ((childCount ?? 0) > 0) {
    return {
      success: false,
      error:
        "Não é possível remover uma categoria com subcategorias. Remove primeiro as subcategorias.",
    };
  }

  if (relationError) {
    return { success: false, error: relationError.message };
  }

  if ((relationCount ?? 0) > 0) {
    return {
      success: false,
      error: "Não é possível remover uma categoria com produtos associados.",
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/categorias");
  revalidatePath("/produtos");
  return { success: true };
}
