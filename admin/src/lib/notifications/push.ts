import type { PushSubscriptionRecord } from "../types";

/**
 * Converte a chave VAPID pública de base64 para Uint8Array
 * O método pushManager.subscribe() exige este formato específico.
 */
function urlBase64ToUint8Array(base64String: string) {
  try {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (error) {
    console.error("[WebPush] Erro ao descodificar chave VAPID:", error);
    throw new Error("A chave VAPID fornecida é inválida.");
  }
}

export async function subscribeUserToPush() {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      throw new Error("O seu navegador não suporta notificações push.");
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Permissão para notificações negada.");
    }

    const registration = await navigator.serviceWorker.ready;
    
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      throw new Error("A chave pública VAPID não está configurada (NEXT_PUBLIC_VAPID_PUBLIC_KEY).");
    }

    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    };

    const subscription = await registration.pushManager.subscribe(subscribeOptions);
    console.log("[WebPush] Subscrição efetuada com sucesso:", subscription);

    // Enviar a subscrição para o servidor (Server Action)
    const { updatePushSubscription } = await import("../actions/profile");
    await updatePushSubscription(subscription.toJSON() as PushSubscriptionRecord);

    return subscription;
  } catch (error) {
    console.error("[WebPush] Erro durante o processo de subscrição:", error);
    throw error;
  }
}

export async function getPushSubscription() {
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error("[WebPush] Erro ao recuperar subscrição existente:", error);
    return null;
  }
}

export async function unsubscribeUserFromPush() {
  try {
    const subscription = await getPushSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      const { updatePushSubscription } = await import("../actions/profile");
      await updatePushSubscription(null);
      console.log("[WebPush] Subscrição removida com sucesso.");
    }
  } catch (error) {
    console.error("[WebPush] Erro ao remover subscrição:", error);
    throw error;
  }
}
