"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";

export type PromotionRecord = {
  id: string;
  product_id: string;
  variant_id?: string | null;
  promo_price: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  products?: {
    id: string;
    name: string;
    price: number;
    product_images?: { url: string; position: number }[];
  } | null;
  product_variants?: {
    id: string;
    size: string | null;
    color: string | null;
    price_override: number | null;
  } | null;
};

type PromotionInput = {
  product_id: string;
  variant_id?: string | null;
  promo_price: number;
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
};

export async function getPromotedProducts(
  page = 1,
  limit = 20,
): Promise<{ promotions: PromotionRecord[]; count: number }> {
  const supabase = createAdminClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("promotions")
    .select(
      "id, product_id, promo_price, is_active, ends_at, created_at, updated_at, products(id, name, price, product_images(url, position))",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rawData = data || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const promotions = rawData.map((promo: any) => ({
    ...promo,
    products: Array.isArray(promo.products) ? promo.products[0] : promo.products || null,
  })) as PromotionRecord[];

  return { promotions, count: count ?? 0 };
}

export async function getActivePromotions(): Promise<PromotionRecord[]> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("promotions")
    .select(
      "id, product_id, variant_id, promo_price, is_active, ends_at, created_at, updated_at, products(id, name, price, product_images(url, position)), product_variants(id, size, color, price_override)",
    )
    .eq("is_active", true)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rawData = data || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rawData.map((promo: any) => ({
    ...promo,
    products: Array.isArray(promo.products) ? promo.products[0] : promo.products || null,
  })) as PromotionRecord[];
}

export async function createPromotion(input: PromotionInput) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("promotions").insert({
    product_id: input.product_id,
    variant_id: input.variant_id ?? null,
    promo_price: input.promo_price,
    is_active: input.is_active,
    ends_at: input.ends_at ?? null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/promocoes");
  return { success: true };
}

export async function updatePromotion(id: string, input: PromotionInput) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("promotions")
    .update({
      product_id: input.product_id,
      variant_id: input.variant_id ?? null,
      promo_price: input.promo_price,
      is_active: input.is_active,
      ends_at: input.ends_at ?? null,
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/promocoes");
  return { success: true };
}

export async function deletePromotion(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("promotions").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/promocoes");
  return { success: true };
}

export async function togglePromotion(id: string, isActive: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("promotions")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/promocoes");
  return { success: true };
}

export async function getPromotionByProductId(productId: string): Promise<PromotionRecord | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as PromotionRecord | null;
}

export async function upsertPromotion(input: PromotionInput) {
  const supabase = createAdminClient();
  
  const { data: existing } = await supabase
    .from("promotions")
    .select("id")
    .eq("product_id", input.product_id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("promotions")
      .update({
        variant_id: input.variant_id ?? null,
      promo_price: input.promo_price,
        is_active: true,
      })
      .eq("id", existing.id);

    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("promotions").insert({
      product_id: input.product_id,
      variant_id: input.variant_id ?? null,
      promo_price: input.promo_price,
      is_active: true,
    });

    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/promocoes");
  return { success: true };
}

export async function deactivatePromotionByProductId(productId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("promotions")
    .update({ is_active: false })
    .eq("product_id", productId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/promocoes");
  return { success: true };
}
