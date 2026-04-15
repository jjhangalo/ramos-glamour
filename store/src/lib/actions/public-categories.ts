"use server";

import { createClient } from "@/lib/supabase/server";

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  products_count?: number;
};

export async function getPublicCategories(): Promise<PublicCategory[]> {
  try {
    const supabase = await createClient();

    // Fetch categories with product counts to filter categories with no products if needed.
    // However, the simplest is to just fetch all categories and maybe filter those with is_active = true.
    // The requirement says: "Retorna apenas categorias ativas ou que possuam produtos associados."
    
    // We can use count on joined products to filter.
    const { data, error } = await supabase
      .from("categories")
      .select(`
        id,
        name,
        slug,
        products!products_category_id_fkey(count)
      `)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching public categories:", error.message);
      return [];
    }

    // Filter categories that are active (assuming name existence here as a proxy for active, 
    // but the schema I saw in admin types didn't have is_active for categories, 
    // it had products_count)
    
    return (data || [])
      .map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        products_count: cat.products?.[0]?.count || 0,
      }))
      .filter((cat) => cat.products_count > 0); // Requirement: "possuam produtos associados"
  } catch (err) {
    console.error("Unexpected error in getPublicCategories:", err);
    return [];
  }
}
