import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:noreply@ramosglamour.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function sendPushNotification(
  userId: string,
  subscription: any,
  title: string,
  body: string,
  url: string = "/perfil/encomendas"
) {
  if (!subscription) return;

  try {
    const payload = JSON.stringify({
      title,
      body,
      url,
    });

    await webpush.sendNotification(subscription, payload);
    console.log(`Notificação push enviada para o utilizador ${userId}`);
  } catch (error: any) {
    console.error(`Erro ao enviar push para ${userId}:`, error.statusCode, error.message);

    // Se o erro for 410 (Gone) ou 404 (Not Found), a subscrição expirou
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log(`Limpando subscrição expirada para o utilizador ${userId}`);
      const supabase = createAdminClient();
      await supabase
        .from("profiles")
        .update({ push_subscription: null })
        .eq("id", userId);
    }
  }
}
