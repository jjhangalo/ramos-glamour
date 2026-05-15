"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sessão inválida.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, display_name, phone, whatsapp")
    .eq("id", user.id)
    .maybeSingle();

  return {
    full_name: profile?.full_name ?? user.user_metadata.full_name ?? null,
    display_name: profile?.display_name ?? null,
    phone: profile?.phone ?? null,
    whatsapp: profile?.whatsapp ?? null,
    email: user.email ?? "",
    avatar_url:
      (typeof user.user_metadata.avatar_url === "string"
        ? user.user_metadata.avatar_url
        : null) ?? null,
    created_at: user.created_at,
    email_verified: !!user.email_confirmed_at,
  };
}

export async function getDashboardData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sessão inválida.");
  }

  // Fetch Latest Order
  const { data: latestOrder } = await supabase
    .from("orders")
    .select("*, order_items(*), addresses(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch Default Address
  const { data: defaultAddress } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .maybeSingle();

  // Determine Location Signal (Default address city or latest order city)
  let location = null;
  if (defaultAddress?.city) {
    location = `${defaultAddress.city}, AO`;
  } else if (latestOrder?.addresses?.city) {
    location = `${latestOrder.addresses.city}, AO`;
  }

  return {
    latestOrder,
    defaultAddress,
    location,
  };
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sessão inválida.");
  }

  const payload = {
    id: user.id,
    full_name: String(formData.get("full_name") ?? "").trim() || null,
    display_name: String(formData.get("display_name") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("profiles").upsert(payload, {
    onConflict: "id",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profile");
}
