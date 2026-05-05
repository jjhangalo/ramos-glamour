alter table public.promotions
  add column if not exists variant_id uuid references public.product_variants (id) on delete cascade,
  add column if not exists starts_at timestamptz default now();

-- Allow public read access to variant_id if not already handled
-- (Rls policies on promotions typically handle the whole table)
