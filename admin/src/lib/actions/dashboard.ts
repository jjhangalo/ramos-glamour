"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getDashboardMetrics() {
  const supabase = createAdminClient();
  
  // Estados que contam para a receita (pendentes, em entrega e entregues)
  // Estados excluídos: delivery_failed, refused, cancelled_by_admin, cancelled_by_customer
  const revenueStatuses = ["pending", "delivering", "delivered"];
  const failureStatuses = ["delivery_failed", "refused", "cancelled_by_admin", "cancelled_by_customer"];

  const [
    { count: clientsCount },
    { count: activeProductsCount },
    { data: revenueData },
    { count: pendingOrdersCount },
    { count: failuresCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("role", "client"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("orders")
      .select("total")
      .in("status", revenueStatuses),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", failureStatuses),
  ]);

  const totalRevenue = (revenueData || []).reduce((acc, curr) => acc + (curr.total || 0), 0);

  return {
    clientsCount: clientsCount || 0,
    activeProductsCount: activeProductsCount || 0,
    totalRevenue,
    pendingOrdersCount: pendingOrdersCount || 0,
    failuresCount: failuresCount || 0,
  };
}
