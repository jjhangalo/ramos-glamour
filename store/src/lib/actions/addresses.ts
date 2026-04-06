"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sessão inválida.");
  }

  return { supabase, user };
}

function extractAddressPayload(formData: FormData) {
  return {
    label: String(formData.get("label") ?? "").trim() || null,
    recipient_name:
      String(formData.get("recipient_name") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    province: String(formData.get("province") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim() || null,
    neighborhood: String(formData.get("neighborhood") ?? "").trim() || null,
    street: String(formData.get("street") ?? "").trim() || null,
    reference: String(formData.get("reference") ?? "").trim() || null,
  };
}

function revalidateAddressPaths() {
  revalidatePath("/perfil/moradas");
  revalidatePath("/checkout");
}

export async function getAddresses() {
  const { supabase, user } = await getAuthenticatedUser();
  const { data, error } = await supabase
    .from("addresses")
    .select(
      "id, label, recipient_name, phone, province, city, neighborhood, street, reference, is_default",
    )
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createAddress(formData: FormData) {
  const { supabase, user } = await getAuthenticatedUser();
  const payload = extractAddressPayload(formData);

  const { data: currentAddresses, error: currentAddressesError } = await supabase
    .from("addresses")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (currentAddressesError) {
    throw new Error(currentAddressesError.message);
  }

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    ...payload,
    is_default: currentAddresses.length === 0,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidateAddressPaths();
}

export async function updateAddress(id: string, formData: FormData) {
  const { supabase, user } = await getAuthenticatedUser();
  const payload = extractAddressPayload(formData);

  const { error } = await supabase
    .from("addresses")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAddressPaths();
}

export async function deleteAddress(id: string) {
  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAddressPaths();
}

export async function setDefaultAddress(id: string) {
  const { supabase, user } = await getAuthenticatedUser();

  const { error: resetError } = await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", user.id);

  if (resetError) {
    throw new Error(resetError.message);
  }

  const { error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAddressPaths();
}
