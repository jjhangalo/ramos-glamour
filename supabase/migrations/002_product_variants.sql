create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete cascade,
  size text,
  color text,
  stock integer not null default 0,
  is_available boolean default true,
  price_override decimal(10, 2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.variant_images (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid references public.product_variants (id) on delete cascade,
  url text not null,
  position integer default 0,
  created_at timestamptz default now()
);

alter table public.order_items
  add column if not exists variant_id uuid references public.product_variants (id),
  add column if not exists variant_size text,
  add column if not exists variant_color text;

create trigger set_product_variants_updated_at
before update on public.product_variants
for each row
execute function public.set_updated_at();

alter table public.product_variants enable row level security;
alter table public.variant_images enable row level security;

create policy "product_variants_public_read"
on public.product_variants
for select
to anon, authenticated
using (true);

create policy "product_variants_service_role_insert"
on public.product_variants
for insert
to service_role
with check (true);

create policy "product_variants_service_role_update"
on public.product_variants
for update
to service_role
using (true)
with check (true);

create policy "product_variants_service_role_delete"
on public.product_variants
for delete
to service_role
using (true);

create policy "variant_images_public_read"
on public.variant_images
for select
to anon, authenticated
using (true);

create policy "variant_images_service_role_insert"
on public.variant_images
for insert
to service_role
with check (true);

create policy "variant_images_service_role_update"
on public.variant_images
for update
to service_role
using (true)
with check (true);

create policy "variant_images_service_role_delete"
on public.variant_images
for delete
to service_role
using (true);
