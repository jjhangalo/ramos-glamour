"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function updateAdminProfile(formData: FormData) {
  const supabase = createAdminClient();
  const serverClient = await createClient();
  
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) throw new Error("Não autorizado");

  const fullName = formData.get("full_name") as string;
  const avatarFile = formData.get("avatar") as File | null;

  let avatarUrl: string | null = null;

  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, {
        upsert: true,
      });

    if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);
      
    avatarUrl = publicUrl;
  }

  const updateData: {
    full_name: string;
    updated_at: string;
    avatar_url?: string;
  } = {
    full_name: fullName,
    updated_at: new Date().toISOString(),
  };

  if (avatarUrl) {
    updateData.avatar_url = avatarUrl;
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (updateError) throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);

  revalidatePath("/settings");
  return { success: true };
}

export async function updateAdminPassword(newPassword: string) {
  const serverClient = await createClient();
  
  const { error } = await serverClient.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
