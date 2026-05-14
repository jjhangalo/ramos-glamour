"use server";

import { createClient } from "@/lib/supabase/server";

export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  stock: number;
  is_available: boolean;
  price_override: number | null;
  variant_images: {
    id: string;
    url: string;
    position: number;
  }[];
};

export type ProductReview = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  promo_price: number | null;
  is_featured: boolean;
  is_active: boolean;
  stock: number;
  created_at: string;
  categories: Category[];
  images: {
    url: string;
    position: number;
  }[];
  variants?: ProductVariant[];
  reviews?: ProductReview[];
  rating_avg: number;
  review_count: number;
};

// Internal types for database responses to satisfy lint
type DbProductBase = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_featured: boolean;
  is_active: boolean;
  stock: number;
  created_at: string;
  product_categories: { categories: Category }[];
  product_images: { url: string; position: number }[];
  reviews: { rating: number }[];
  promotions: { promo_price: number | null; is_active: boolean; ends_at: string | null }[];
};

type DbProductDetail = Omit<DbProductBase, "reviews"> & {
  product_variants: (ProductVariant & { variant_images: { id: string, url: string, position: number }[] })[];
  reviews: (ProductReview & { profiles: { display_name: string | null; avatar_url: string | null } | { display_name: string | null; avatar_url: string | null }[] })[];
  promotions: { promo_price: number | null; is_active: boolean; ends_at: string | null }[];
};

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error.message);
    return [];
  }

  return data || [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function getProducts(filters: {
  categorySlug?: string;
  order?: "newest" | "price-asc" | "price-desc";
  limit?: number;
  search?: string;
} = {}): Promise<Product[]> {
  const supabase = await createClient();
  const { categorySlug, order = "newest", limit, search } = filters;

  let query = supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      price,
      stock,
      is_featured,
      is_active,
      created_at,
      product_categories!inner(
        categories!inner(id, name, slug, parent_id)
      ),
      product_images(url, position),
      reviews(rating),
      promotions(promo_price, is_active, ends_at)
    `)
    .eq("is_active", true);

  if (categorySlug && categorySlug !== "todas") {
    query = query.eq("product_categories.categories.slug", categorySlug);
  }

  if (search?.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  // Sorting
  if (order === "newest") {
    query = query.order("created_at", { ascending: false });
  } else if (order === "price-asc") {
    query = query.order("price", { ascending: true });
  } else if (order === "price-desc") {
    query = query.order("price", { ascending: false });
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error.message);
    return [];
  }

  const now = new Date();
  const typedData = (data || []) as unknown as DbProductBase[];

  return typedData.map((p) => {
    const ratings = p.reviews?.map((r) => r.rating) || [];
    const avg = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 5.0;
    
    const activePromo = p.promotions?.find((promo) => {
      return promo.is_active && (!promo.ends_at || new Date(promo.ends_at) > now);
    });

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      promo_price: activePromo?.promo_price || null,
      is_featured: p.is_featured,
      is_active: p.is_active,
      stock: p.stock ?? 0,
      created_at: p.created_at,
      categories: p.product_categories.map((pc) => pc.categories),
      images: (p.product_images || []).sort((a, b) => a.position - b.position),
      rating_avg: avg,
      review_count: ratings.length,
    };
  });
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts({ limit: 4 });
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      price,
      stock,
      is_featured,
      is_active,
      created_at,
      product_categories(
        categories(id, name, slug, parent_id)
      ),
      product_images(url, position),
      product_variants(
        id,
        product_id,
        size,
        color,
        stock,
        is_available,
        price_override,
        variant_images(id, url, position)
      ),
      reviews(
        id,
        rating,
        comment,
        created_at,
        profiles(display_name, avatar_url)
      ),
      promotions(promo_price, is_active, ends_at)
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error && error.code !== "PGRST116") {
      console.error("Error fetching product:", error.message);
    }
    return null;
  }

  const now = new Date();
  const typedData = data as unknown as DbProductDetail;
  const ratings = typedData.reviews?.map((r) => r.rating) || [];
  const avg = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 5.0;

  const activePromo = typedData.promotions?.find((promo) => {
    return promo.is_active && (!promo.ends_at || new Date(promo.ends_at) > now);
  });

  return {
    id: typedData.id,
    name: typedData.name,
    description: typedData.description,
    price: typedData.price,
    promo_price: activePromo?.promo_price || null,
    is_featured: typedData.is_featured,
    is_active: typedData.is_active,
    stock: typedData.stock ?? 0,
    created_at: typedData.created_at,
    categories: typedData.product_categories.map((pc) => pc.categories),
    images: (typedData.product_images || []).sort((a, b) => a.position - b.position),
    variants: (typedData.product_variants || []).map((v) => ({
      ...v,
      variant_images: (v.variant_images || []).sort((a, b) => a.position - b.position),
    })),
    reviews: (typedData.reviews || []).map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles,
    })),
    rating_avg: avg,
    review_count: ratings.length,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  // Attempt to fetch by slug, fallback to ID if slug field is missing or it looks like a UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);
  
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      price,
      stock,
      is_featured,
      is_active,
      created_at,
      product_categories(
        categories(id, name, slug, parent_id)
      ),
      product_images(url, position),
      reviews(rating),
      promotions(promo_price, is_active, ends_at)
    `)
    .or(`id.eq.${isUUID ? slug : "00000000-0000-0000-0000-000000000000"}${!isUUID ? `,slug.eq.${slug}` : ""}`)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const typedData = data as unknown as DbProductBase;
  const now = new Date();
  const ratings = typedData.reviews?.map((r) => r.rating) || [];
  const avg = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 5.0;

  const activePromo = typedData.promotions?.find((promo) => {
    return promo.is_active && (!promo.ends_at || new Date(promo.ends_at) > now);
  });

  return {
    id: typedData.id,
    name: typedData.name,
    description: typedData.description,
    price: typedData.price,
    promo_price: activePromo?.promo_price || null,
    is_featured: typedData.is_featured,
    is_active: typedData.is_active,
    stock: typedData.stock ?? 0,
    created_at: typedData.created_at,
    categories: typedData.product_categories.map((pc) => pc.categories),
    images: (typedData.product_images || []).sort((a, b) => a.position - b.position),
    rating_avg: avg,
    review_count: ratings.length,
  };
}
