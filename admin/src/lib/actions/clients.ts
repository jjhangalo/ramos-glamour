"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import type { AddressRecord, ClientRecord, OrderRecord } from "@/lib/types";

type ClientFilters = {
  search?: string;
  status?: "all" | "active" | "inactive";
  role?: "client" | "admin";
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
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
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Status Filter
  if (filters.status === "active") {
    query = query.eq("is_active", true);
  } else if (filters.status === "inactive") {
    query = query.eq("is_active", false);
  }

  // Role Filter
  if (filters.role) {
    query = query.eq("role", filters.role);
  }

  // Date Filters
  if (filters.date) {
    const startOfDay = new Date(filters.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(filters.date);
    endOfDay.setHours(23, 59, 59, 999);
    
    query = query
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString());
  } else {
    if (filters.dateFrom) {
      query = query.gte("created_at", new Date(filters.dateFrom).toISOString());
    }
    if (filters.dateTo) {
      const endTo = new Date(filters.dateTo);
      endTo.setHours(23, 59, 59, 999);
      query = query.lte("created_at", endTo.toISOString());
    }
  }

  // Search Logic (Initial DB filter)
  if (filters.search) {
    const s = `%${filters.search}%`;
    query = query.or(
      `full_name.ilike.${s},display_name.ilike.${s},admin_notes.ilike.${s},phone.ilike.${s},whatsapp.ilike.${s}`
    );
  }

  // Apply Pagination Range (only if no client-side search is needed)
  // NOTE: If we search by email (which is not in profiles), we MUST fetch all profiles that match the rest, 
  // then filter by email client-side, then paginate. This is a limitation of the current split auth/profile schema.
  const needsClientSideFilter = !!filters.search;
  
  if (!needsClientSideFilter) {
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const emailMap = await getEmailMap();
  let clients = ((data ?? []) as ClientRecord[]).map((client) => ({
    ...client,
    email: emailMap.get(client.id) ?? null,
  }));

  let totalCount = count ?? 0;

  // Client-side search for email & other fields (to ensure consistency after manual email join)
  if (filters.search) {
    const normalizedSearch = filters.search.toLowerCase();
    clients = clients.filter((client) =>
      [
        client.full_name, 
        client.display_name, 
        client.email, 
        client.admin_notes, 
        client.phone, 
        client.whatsapp
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearch)),
    );
    
    // Update total count after manual filter
    totalCount = clients.length;
    
    // Manual pagination if we filtered client-side
    clients = clients.slice(from, to + 1);
  }

  return {
    clients,
    totalCount,
    page,
    pageSize,
  };
}

export async function requestPromotion(candidateId: string) {
  const supabase = createAdminClient();
  const serverClient = await (await import("@/lib/supabase/server")).createClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) throw new Error("Não autorizado");

  // Verificar se já existe um pedido pendente
  const { data: existing } = await supabase
    .from("promotion_requests")
    .select("id")
    .eq("candidate_id", candidateId)
    .eq("status", "pending")
    .single();

  if (existing) throw new Error("Já existe um pedido de promoção pendente para este cliente");

  const { data: request, error } = await supabase
    .from("promotion_requests")
    .insert({
      candidate_id: candidateId,
      requester_id: user.id,
      status: "pending"
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Voto automático do solicitante (quem pede, aprova implicitamente)
  await supabase
    .from("promotion_votes")
    .insert({
      request_id: request.id,
      voter_id: user.id,
      decision: "approve"
    });

  revalidatePath(`/clientes/${candidateId}`);
  revalidatePath("/administradores");
  return { success: true };
}

export async function submitPromotionVote(requestId: string, decision: "approve" | "reject") {
  const supabase = createAdminClient();
  const serverClient = await (await import("@/lib/supabase/server")).createClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) throw new Error("Não autorizado");

  // 1. Registar o voto
  const { error: voteError } = await supabase
    .from("promotion_votes")
    .insert({
      request_id: requestId,
      voter_id: user.id,
      decision
    });

  if (voteError) throw new Error("Erro ao registar voto ou já votou neste pedido");

  // 2. Se for rejeição, encerrar o pedido imediatamente
  if (decision === "reject") {
    await supabase
      .from("promotion_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);
  } else {
    // 3. Se for aprovação, verificar se todos os admins votaram 'approve'
    const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin");
    const { data: votes } = await supabase.from("promotion_votes").select("voter_id").eq("request_id", requestId).eq("decision", "approve");

    if (admins && votes && votes.length === admins.length) {
      // Unanimidade alcançada!
      const { data: request } = await supabase
        .from("promotion_requests")
        .select("candidate_id")
        .eq("id", requestId)
        .single();

      if (request) {
        // Atualizar estado do pedido
        await supabase
          .from("promotion_requests")
          .update({ status: "approved" })
          .eq("id", requestId);

        // Promover o utilizador
        await supabase
          .from("profiles")
          .update({ role: "admin" })
          .eq("id", request.candidate_id);
      }
    }
  }

  revalidatePath("/administradores");
  revalidatePath("/clientes");
  return { success: true };
}

export async function getAllPendingPromotions() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promotion_requests")
    .select(`
      *,
      candidate:profiles!candidate_id(full_name, display_name, avatar_url, email),
      requester:profiles!requester_id(full_name, display_name),
      votes:promotion_votes(
        *,
        voter:profiles!voter_id(full_name, display_name)
      )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return [];
  
  // Note: email is in profiles but getClients handles manual email join. 
  // For simplicity here, we'll assume the email is available or fetched if needed.
  // Actually, profiles table does NOT have email. I need to join with emailMap.
  
  const emailMap = await getEmailMap();
  return (data || []).map(req => ({
    ...req,
    candidate: {
      ...req.candidate,
      email: emailMap.get(req.candidate_id) || null
    }
  }));
}

export async function getPromotionStatus(candidateId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promotion_requests")
    .select(`
      *,
      requester:profiles!requester_id(full_name, display_name),
      votes:promotion_votes(
        *,
        voter:profiles!voter_id(full_name, display_name)
      )
    `)
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function getClient(id: string) {
  const supabase = createAdminClient();
  const [
    { data: profile, error: profileError }, 
    { data: addresses, error: addressesError }, 
    { data: orders, error: ordersError }, 
    { data: userData, error: userError },
    promotionRequest
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("addresses").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id, user_id, address_id, status, notes, total, created_at, updated_at, addresses(id, label, city), order_items(id, quantity, product_name)")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    supabase.auth.admin.getUserById(id),
    getPromotionStatus(id)
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
      promotion_request: promotionRequest
    },
    addresses: (addresses ?? []) as AddressRecord[],
    orders: (orders ?? []).map((order: unknown) => {
      const o = order as OrderRecord & { addresses: unknown };
      return {
        ...o,
        addresses: Array.isArray(o.addresses) ? (o.addresses as unknown[])[0] : o.addresses,
      };
    }) as OrderRecord[],
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
  if (id === process.env.MASTER_ADMIN_ID) {
    return {
      success: false,
      error: "Não é permitido desativar a conta do administrador mestre.",
    };
  }

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
  if (userId === process.env.MASTER_ADMIN_ID) {
    return {
      success: false,
      error: "Não é permitido alterar o papel do administrador mestre.",
    };
  }

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
