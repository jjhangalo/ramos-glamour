"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import type { NotificationItem } from "@/lib/types";

export async function getUnreadNotifications() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as NotificationItem[];
}

export async function markNotificationsAsRead(ids: string[]) {
  if (!ids.length) {
    return { success: true };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .in("id", ids);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}
