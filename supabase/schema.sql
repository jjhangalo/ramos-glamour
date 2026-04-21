-- Base Product Schema
CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    price decimal(12,2) NOT NULL DEFAULT 0.00,
    category_id uuid, -- legacy/first category reference
    stock integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    is_featured boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    parent_id uuid REFERENCES public.categories(id),
    created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.product_categories (
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

CREATE TABLE IF NOT EXISTS public.product_images (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    url text NOT NULL,
    position integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.product_variants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    size text,
    color text,
    stock integer NOT NULL DEFAULT 0,
    is_available boolean NOT NULL DEFAULT true,
    price_override decimal(12,2),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.variant_images (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
    url text NOT NULL,
    position integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.promotions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    promo_price decimal(12,2) NOT NULL,
    is_active boolean DEFAULT true,
    ends_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY,
    full_name text,
    display_name text,
    phone text,
    whatsapp text,
    avatar_url text,
    role text DEFAULT 'client'
);
