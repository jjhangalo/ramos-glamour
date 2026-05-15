/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
 
declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (string | PrecacheEntry)[] | undefined;
  }
}
 
declare const self: ServiceWorkerGlobalScope;
 
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});
 
// Push Notification Logic
self.addEventListener("push", (event: PushEvent) => {
  console.log("[ServiceWorker] Evento push recebido.");

  if (!event.data) {
    console.warn("[ServiceWorker] Evento push recebido sem dados.");
    return;
  }

  try {
    const data = event.data.json();
    console.log("[ServiceWorker] Payload push:", data);

    const title = data.title || "Ramos Glamour";
    const options = {
      body: data.body || "Tem uma nova atualização na sua encomenda.",
      icon: "/web-app-manifest-192x192.png",
      badge: "/logo-gold.png",
      data: {
        url: data.url || "/profile/orders",
      },
      vibrate: [100, 50, 100],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("[ServiceWorker] Erro ao processar payload JSON:", err);
    
    // Fallback para texto simples se não for JSON
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("Ramos Glamour", {
        body: text || "Nova notificação recebida.",
        icon: "/web-app-manifest-192x192.png",
      })
    );
  }
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  console.log("[ServiceWorker] Notificação clicada.");
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/profile/orders";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Tentar encontrar uma janela já aberta com o mesmo URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      // Se não encontrar, abrir nova janela
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    }),
  );
});

serwist.addEventListeners();
