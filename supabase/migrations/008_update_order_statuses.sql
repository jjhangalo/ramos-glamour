-- Update orders_status_check to include all required states
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status = ANY (ARRAY[
  'pending'::text, 
  'confirmed'::text, 
  'out_for_delivery'::text, 
  'delivered'::text, 
  'cancelled'::text, 
  'refused'::text
]));
