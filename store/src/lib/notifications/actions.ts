"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function savePushSubscription(subscription: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Utilizador não autenticado.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ push_subscription: subscription })
    .eq("id", user.id);

  if (error) {
    throw new Error(`Erro ao guardar subscrição: ${error.message}`);
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function getProfileSubscription() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("push_subscription")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;

  return data.push_subscription;
}
