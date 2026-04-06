"use server";

import { revalidatePath } from "next/cache";

import { buildWhatsAppUrl } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderRecord } from "@/lib/types";

export async function getOrders(status?: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select(
      "id, user_id, address_id, status, notes, total, created_at, updated_at, profiles(id, full_name, display_name, phone, whatsapp), addresses(id, label, city), order_items(id, quantity)",
    )
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as OrderRecord[];
}

export async function getOrder(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, user_id, address_id, status, notes, total, created_at, updated_at, profiles(id, full_name, display_name, phone, whatsapp), addresses(*), order_items(*)",
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as OrderRecord;
}

export async function updateOrderStatus(
  id: string,
  status: OrderRecord["status"],
) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/encomendas");
  revalidatePath(`/encomendas/${id}`);
  return { success: true };
}

export async function getOrderWhatsappLink(id: string) {
  const order = await getOrder(id);
  const profile = order.profiles;
  const phone = profile?.whatsapp || profile?.phone;

  if (!phone) {
    return null;
  }

  const customerName =
    profile?.full_name || profile?.display_name || "cliente";
  const message = `Olá ${customerName}, a encomenda #${order.id.slice(
    0,
    8,
  )} está com o estado "${order.status}".`;

  return buildWhatsAppUrl(phone, message);
}
