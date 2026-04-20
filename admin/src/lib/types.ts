export type DashboardMetric = {
  label: string;
  value: number;
};

export type NotificationItem = {
  id: string;
  created_at: string;
  is_read: boolean;
  type: string;
  payload: {
    order_id?: string;
    customer_name?: string;
    [key: string]: unknown;
  } | null;
};

export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
  children?: CategoryRecord[];
  products_count?: { count: number }[];
};

export type ProductImageRecord = {
  id: string;
  product_id: string;
  url: string;
  position: number;
};

export type VariantImageRecord = {
  id: string;
  variant_id: string;
  url: string;
  position: number;
};

export type ProductVariantRecord = {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  stock: number;
  is_available: boolean;
  price_override: number | null;
  created_at: string;
  updated_at: string;
  variant_images?: VariantImageRecord[];
};

export type ProductRecord = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
  }>;
  product_images?: ProductImageRecord[];
  product_variants?: ProductVariantRecord[];
};

export type AddressRecord = {
  id: string;
  user_id: string;
  label: string | null;
  recipient_name: string | null;
  phone: string | null;
  province: string | null;
  city: string | null;
  neighborhood: string | null;
  street: string | null;
  reference: string | null;
  is_default: boolean;
};

export type OrderItemRecord = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  variant_size: string | null;
  variant_color: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
};

export type OrderRecord = {
  id: string;
  user_id: string;
  address_id: string | null;
  status: "pending" | "delivering" | "delivered" | "refused";
  notes: string | null;
  total: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
    display_name: string | null;
    phone: string | null;
    whatsapp: string | null;
  } | null;
  addresses?: AddressRecord | null;
  order_items?: OrderItemRecord[];
};

export type ClientRecord = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  admin_notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  email?: string | null;
  role: "client" | "admin";
};
