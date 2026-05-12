"use client";

import { useEffect } from "react";

export function PushInitializer() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registrado com sucesso:", registration.scope);
        })
        .catch((error) => {
          console.error("Falha ao registar o Service Worker:", error);
        });
    }
  }, []);

  return null;
}
