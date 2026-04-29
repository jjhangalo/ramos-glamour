"use server";

import { revalidatePath } from "next/cache";

import { buildWhatsAppUrl } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderRecord } from "@/lib/types";

export async function getOrders(status?: string, search?: string) {
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

  if (search) {
    // Priority: ID (exact), then name/phone/email (ilike)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search);
    if (isUuid) {
      query = query.eq("id", search);
    } else {
      // Fuzzy search across multiple related tables is limited in simple select, 
      // but we can use or filter if the fields were in the same table.
      // Since they are in joined tables, we'll use a text search if configured, 
      // or filter in the profiles join.
      // For simplicity and speed in this operational context, we search by ID (partial if not UUID) or Name
      query = query.or(`id.ilike.%${search}%,notes.ilike.%${search}%`);
      // Note: Full cross-table fuzzy search usually requires a more complex query or RPC.
    }
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((order: unknown) => {
    const o = order as OrderRecord;
    return {
      ...o,
      profiles: Array.isArray(o.profiles) ? (o.profiles as unknown as unknown[])[0] : o.profiles,
      addresses: Array.isArray(o.addresses) ? (o.addresses as unknown as unknown[])[0] : o.addresses,
    };
  }) as OrderRecord[];
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

  if (!data) return null;

  return {
    ...data,
    profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
    addresses: Array.isArray(data.addresses) ? data.addresses[0] : data.addresses,
  } as unknown as OrderRecord;
}

export async function updateOrderStatus(
  id: string,
  status: OrderRecord["status"],
) {
  const supabase = createAdminClient();
  
  // State machine validation
  const { data: order } = await supabase.from("orders").select("status").eq("id", id).single();
  if (!order) return { success: false, error: "Encomenda não encontrada." };
  
  const currentStatus = order.status;
  const terminalStates = ["delivered", "cancelled", "refused"];
  
  if (terminalStates.includes(currentStatus)) {
    return { success: false, error: "Não é possível alterar o estado de uma encomenda finalizada." };
  }

  const { error } = await supabase.from("orders").update({ status }).eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/encomendas");
  revalidatePath(`/encomendas/${id}`);
  return { success: true };
}

export async function updateOrdersBulk(
  ids: string[],
  status: OrderRecord["status"],
) {
  const supabase = createAdminClient();
  
  // Fetch all selected orders to validate their current state
  const { data: orders, error: fetchError } = await supabase
    .from("orders")
    .select("id, status")
    .in("id", ids);
    
  if (fetchError) return { success: false, error: fetchError.message };
  
  const terminalStates = ["delivered", "cancelled", "refused"];
  const invalidOrders = orders?.filter(o => terminalStates.includes(o.status)) || [];
  
  if (invalidOrders.length > 0) {
    return { 
      success: false, 
      error: `Falha: ${invalidOrders.length} encomendas selecionadas já estão em estados finais e não podem ser alteradas.` 
    };
  }

  const { error } = await supabase.from("orders").update({ status }).in("id", ids);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/encomendas");
  return { success: true };
}

export async function migrateLegacyStatuses() {
  const supabase = createAdminClient();
  
  // 1. Map 'delivering' to 'out_for_delivery'
  const { error: err1 } = await supabase
    .from("orders")
    .update({ status: "out_for_delivery" })
    .eq("status", "delivering");
    
  // 2. Ensure all other legacy statuses are normalized if needed
  // (Assuming 'pending', 'delivered', 'refused' are already snake_case or match the new model)
  
  if (err1) return { success: false, error: err1.message };
  
  revalidatePath("/encomendas");
  return { success: true };
}

export async function getOrderWhatsappLink(id: string) {
  const order = await getOrder(id);
  if (!order) {
    return null;
  }
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
