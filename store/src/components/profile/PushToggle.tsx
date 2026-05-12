"use client";

import { useState, useEffect } from "react";
import { subscribeUserToPush, unsubscribeUserFromPush, getPushSubscription } from "@/lib/notifications/push";
import { toast } from "react-hot-toast";

export function PushToggle({ initialSubscription }: { initialSubscription: unknown }) {
  const [isSubscribed, setIsSubscribed] = useState(!!initialSubscription);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Verificar se o navegador suporta push
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    // Sincronizar estado real da subscrição no navegador
    getPushSubscription().then(sub => {
      setIsSubscribed(!!sub);
    });
  }, []);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribeUserFromPush();
        setIsSubscribed(false);
        toast.success("Notificações desativadas.");
      } else {
        await subscribeUserToPush();
        setIsSubscribed(true);
        toast.success("Notificações ativadas com sucesso!");
      }
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Erro ao configurar notificações.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (typeof window !== "undefined" && (!("serviceWorker" in navigator) || !("PushManager" in window))) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white border border-brand-midnight/5 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
            Notificações
          </h4>
          <p className="text-sm font-medium text-brand-midnight">
            Alertas no Telemóvel
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            isSubscribed ? "bg-brand-gold" : "bg-brand-midnight/10"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isSubscribed ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      <p className="mt-4 text-[10px] leading-relaxed text-brand-midnight/40 uppercase tracking-wider">
        {isSubscribed 
          ? "Receberá atualizações sobre o estado das suas encomendas."
          : "Ative para receber atualizações em tempo real sobre os seus pedidos."}
      </p>
    </div>
  );
}
