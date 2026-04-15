"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";

export type PromotionRecord = {
  id: string;
  product_id: string;
  promo_price: number;
  is_active: boolean;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  products?: {
    id: string;
    name: string;
    price: number;
    product_images?: { url: string; position: number }[];
  } | null;
};

type PromotionInput = {
  product_id: string;
  promo_price: number;
  is_active: boolean;
  ends_at?: string | null;
};

export async function getPromotedProducts(): Promise<PromotionRecord[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promotions")
    .select(
      "id, product_id, promo_price, is_active, ends_at, created_at, updated_at, products(id, name, price, product_images(url, position))",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rawData = data || [];
  return rawData.map((promo: any) => ({
    ...promo,
    products: Array.isArray(promo.products) ? promo.products[0] : promo.products || null,
  })) as PromotionRecord[];
}

export async function getActivePromotions(): Promise<PromotionRecord[]> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("promotions")
    .select(
      "id, product_id, promo_price, is_active, ends_at, created_at, updated_at, products(id, name, price, product_images(url, position))",
    )
    .eq("is_active", true)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rawData = data || [];
  return rawData.map((promo: any) => ({
    ...promo,
    products: Array.isArray(promo.products) ? promo.products[0] : promo.products || null,
  })) as PromotionRecord[];
}

export async function createPromotion(input: PromotionInput) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("promotions").insert({
    product_id: input.product_id,
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
