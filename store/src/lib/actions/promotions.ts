"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type PromotionWithProduct = {
  id: string;
  product_id: string;
  promo_price: number;
  is_active: boolean;
  ends_at: string | null;
  products: {
    id: string;
    name: string;
    price: number;
    product_images: { url: string; position: number }[];
    product_variants: { id: string }[];
    categories?: { id: string; name: string; slug: string }[];
  } | null;
};

export async function getStoreActivePromotions(): Promise<PromotionWithProduct[]> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("promotions")
    .select(
      `id, product_id, promo_price, is_active, ends_at,
       products(
         id, name, price,
         product_images(url, position),
         product_variants(id)
       )`,
    )
    .eq("is_active", true)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    console.error("getStoreActivePromotions error:", error.message);
    return [];
  }

  const rawData = (data || []) as unknown as (PromotionWithProduct & { products: { id: string }[] | { id: string } | null })[];
  return rawData.map((promo) => ({
    ...promo,
    products: Array.isArray(promo.products) ? promo.products[0] : promo.products || null,
  })) as PromotionWithProduct[];
}

// Returns promo_price for a specific product_id if an active promotion exists.
export async function getProductPromoPrice(
  productId: string,
): Promise<number | null> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("promotions")
    .select("promo_price")
    .eq("product_id", productId)
    .eq("is_active", true)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .maybeSingle();

  return data?.promo_price ?? null;
}
