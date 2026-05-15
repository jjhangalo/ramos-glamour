"use server";
 
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
 
/**
 * Atualiza a subscrição de notificações push do administrador autenticado.
 */
export async function updatePushSubscription(subscription: any) {
  try {
    const supabase = await createClient();
 
    // Obter o utilizador autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
 
    if (userError || !user) {
      throw new Error("Não autorizado.");
    }
 
    // Sanitizar e atualizar a subscrição na tabela 'profiles'
    // O objeto subscription é transformado em JSONB no Supabase
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        push_subscription: subscription,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
 
    if (updateError) {
      console.error("[PushAction] Erro ao atualizar subscrição:", updateError);
      throw new Error("Erro ao guardar subscrição no servidor.");
    }
 
    revalidatePath("/configuracoes");
    return { success: true };
  } catch (error) {
    console.error("[PushAction] Erro crítico:", error);
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido." };
  }
}
