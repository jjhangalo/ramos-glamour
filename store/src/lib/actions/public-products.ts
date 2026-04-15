"use server";

import { createClient } from "@/lib/supabase/server";

export type PublicProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  promo_price: number | null;
  is_featured: boolean;
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
  images: {
    url: string;
    position: number;
  }[];
  rating_avg: number;
  review_count: number;
  created_at: string;
};

export async function getPublicProducts(filters: {
  isFeatured?: boolean;
  hasPromo?: boolean;
  limit?: number;
  categorySlug?: string;
  page?: number;
  search?: string;
} = {}): Promise<PublicProduct[]> {
  try {
    const supabase = await createClient();
    const {
      isFeatured,
      hasPromo,
      limit = 12,
      categorySlug,
      page = 1,
      search,
    } = filters;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Base query
    let query = supabase
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        is_featured,
        created_at,
        categories!products_category_id_fkey!inner(id, name, slug),
        product_images(url, position),
        promotions(promo_price, is_active, updated_at, ends_at)
      `,
      )
      .eq("is_active", true);

    // Apply filters
    if (isFeatured) {
      query = query.eq("is_featured", true);
    }

    if (categorySlug && categorySlug !== "todas") {
      query = query.eq("categories.slug", categorySlug);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (hasPromo) {
      const now = new Date().toISOString();
      // To filter products that HAVE an active promo, we use the !inner join hint on promotions
      // However, since we already have categories!inner, we might need to be careful.
      // Alternatively, we filter by the promotion existence.
      query = query
        .eq("promotions.is_active", true)
        .or(`ends_at.is.null,ends_at.gt.${now}`, { referencedTable: "promotions" })
        .not("promotions", "is", null);
    }

    // Sort and Paginate
    query = query
      .order("created_at", { ascending: false })
      .order("position", { referencedTable: "product_images", ascending: true })
      .order("updated_at", { referencedTable: "promotions", ascending: false })
      .range(from, to);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching public products:", error.message);
      return [];
    }

    const now = new Date();

    return (data || []).map((p: any) => {
      // Find valid promotion
      const activePromo = p.promotions?.find((promo: any) => {
        if (!promo.is_active) return false;
        if (promo.ends_at && new Date(promo.ends_at) < now) return false;
        return true;
      });

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        promo_price: activePromo ? activePromo.promo_price : null,
        is_featured: p.is_featured,
        categories: p.categories || [],
        images: p.product_images || [],
        rating_avg: 5.0, // Default placeholders as schema doesn't have these yet
        review_count: 0,
        created_at: p.created_at,
      };
    });
  } catch (err) {
    console.error("Unexpected error in getPublicProducts:", err);
    return [];
  }
}

export async function getPublicProductById(id: string): Promise<PublicProduct | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        is_featured,
        created_at,
        categories!products_category_id_fkey(id, name, slug),
        product_images(url, position),
        promotions(promo_price, is_active, updated_at, ends_at)
      `,
      )
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching public product by id:", error.message);
      }
      return null;
    }

    const now = new Date();
    const activePromo = data.promotions?.find((promo: any) => {
      if (!promo.is_active) return false;
      if (promo.ends_at && new Date(promo.ends_at) < now) return false;
      return true;
    });

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      promo_price: activePromo ? activePromo.promo_price : null,
      is_featured: data.is_featured,
      categories: data.categories || [],
      images: (data.product_images || []).sort((a: any, b: any) => a.position - b.position),
      rating_avg: 5.0,
      review_count: 0,
      created_at: data.created_at,
    };
  } catch (err) {
    console.error("Unexpected error in getPublicProductById:", err);
    return null;
  }
}
