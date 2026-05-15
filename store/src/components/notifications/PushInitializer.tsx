"use client";

import { useEffect } from "react";

export function PushInitializer() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[ServiceWorker] Registado com sucesso no scope:", registration.scope);
        })
        .catch((error) => {
          console.error("[ServiceWorker] Erro crítico no registo:", error);
        });
    } else {
      console.warn("[ServiceWorker] Notificações push não são suportadas neste navegador.");
    }
  }, []);

  return null;
}
