"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import type { AddressRecord, ClientRecord, OrderRecord } from "@/lib/types";

type ClientFilters = {
  search?: string;
  status?: "all" | "active" | "inactive";
  role?: "client" | "admin";
};

async function getEmailMap() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw new Error(error.message);
  }

  return new Map(
    (data.users ?? []).map((user) => [user.id, user.email ?? null]),
  );
}

export async function getClients(filters: ClientFilters = {}) {
  const supabase = createAdminClient();
  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.status === "active") {
    query = query.eq("is_active", true);
  }

  if (filters.status === "inactive") {
    query = query.eq("is_active", false);
  }

  if (filters.role) {
    query = query.eq("role", filters.role);
  }

  if (filters.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,display_name.ilike.%${filters.search}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const emailMap = await getEmailMap();
  let clients = ((data ?? []) as ClientRecord[]).map((client) => ({
    ...client,
    email: emailMap.get(client.id) ?? null,
  }));

  if (filters.search) {
    const normalizedSearch = filters.search.toLowerCase();
    clients = clients.filter((client) =>
      [client.full_name, client.display_name, client.email]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearch)),
    );
  }

  return clients;
}

export async function getClient(id: string) {
  const supabase = createAdminClient();
  const [{ data: profile, error: profileError }, { data: addresses, error: addressesError }, { data: orders, error: ordersError }, { data: userData, error: userError }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("addresses").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id, user_id, address_id, status, notes, total, created_at, updated_at, addresses(id, label, city), order_items(id, quantity, product_name)")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    supabase.auth.admin.getUserById(id),
  ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (addressesError) {
    throw new Error(addressesError.message);
  }

  if (ordersError) {
    throw new Error(ordersError.message);
  }

  if (userError) {
    throw new Error(userError.message);
  }

  return {
    client: {
      ...(profile as ClientRecord),
      email: userData.user.email ?? null,
    },
    addresses: (addresses ?? []) as AddressRecord[],
    orders: (orders ?? []).map((order: any) => ({
      ...order,
      addresses: Array.isArray(order.addresses) ? order.addresses[0] : order.addresses,
    })) as OrderRecord[],
  };
}

export async function updateAdminNotes(id: string, notes: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ admin_notes: notes, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/clientes/${id}`);
  return { success: true };
}

export async function toggleClientStatus(id: string, isActive: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: !isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/clientes");
  revalidatePath("/administradores");
  revalidatePath(`/clientes/${id}`);
  return { success: true };
}

export async function toggleAdminRole(userId: string, newRole: "client" | "admin") {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/clientes");
  revalidatePath("/administradores");
  revalidatePath(`/clientes/${userId}`);
  return { success: true };
}
