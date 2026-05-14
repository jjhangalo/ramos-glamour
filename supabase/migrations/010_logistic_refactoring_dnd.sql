ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'delivering', 'delivered', 'delivery_failed', 'refused', 'cancelled_by_admin', 'cancelled_by_customer'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS dnd_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dnd_start_time TIME,
ADD COLUMN IF NOT EXISTS dnd_end_time TIME;
