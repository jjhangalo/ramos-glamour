/**
 * Converte a chave VAPID pública de base64 para Uint8Array
 */
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUserToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("O seu navegador não suporta notificações push.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permissão para notificações negada.");
  }

  const registration = await navigator.serviceWorker.ready;

  const subscribeOptions = {
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    ),
  };

  const subscription = await registration.pushManager.subscribe(subscribeOptions);

  // Enviar a subscrição para o servidor (Server Action)
  const { savePushSubscription } = await import("./actions");
  await savePushSubscription(subscription.toJSON());

  return subscription;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.ready;
  return await registration.pushManager.getSubscription();
}

export async function unsubscribeUserFromPush() {
  const subscription = await getPushSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    const { savePushSubscription } = await import("./actions");
    await savePushSubscription(null);
  }
}
