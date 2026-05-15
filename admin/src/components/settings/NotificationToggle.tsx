"use client";
 
import { useState, useEffect } from "react";
import { subscribeUserToPush, unsubscribeUserFromPush, getPushSubscription } from "@/lib/notifications/push";
import { toast } from "react-hot-toast";
import { Bell, BellOff, Loader2 } from "lucide-react";
 
import { PushSubscriptionRecord } from "@/lib/types";
 
 export function NotificationToggle({ initialSubscription }: { initialSubscription: PushSubscriptionRecord | null }) {
  const [isSubscribed, setIsSubscribed] = useState(!!initialSubscription);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
 
  useEffect(() => {
    // Verificar suporte do navegador
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSupported(false);
      return;
    }
 
    // Sincronizar estado real da subscrição
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
 
  if (!isSupported) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-brand-midnight/[0.02] p-4 text-brand-midnight/40">
        <BellOff className="h-4 w-4" />
        <p className="text-[10px] font-bold uppercase tracking-wider">
          Push não suportado neste navegador
        </p>
      </div>
    );
  }
 
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
            isSubscribed ? "bg-brand-gold/10 text-brand-gold" : "bg-brand-midnight/5 text-brand-midnight/40"
          }`}>
            {isSubscribed ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-sm font-medium text-brand-midnight">
              Notificações em Tempo Real
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-midnight/30">
              Alertas de Novas Encomendas
            </p>
          </div>
        </div>
 
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none disabled:opacity-50 ${
            isSubscribed ? "bg-brand-gold" : "bg-brand-midnight/10"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              isSubscribed ? "translate-x-6" : "translate-x-1"
            }`}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/20 rounded-full">
              <Loader2 className="h-3 w-3 animate-spin text-brand-midnight" />
            </div>
          )}
        </button>
      </div>
 
      <div className="rounded-2xl bg-brand-midnight/[0.02] p-4">
        <p className="text-[10px] leading-relaxed text-brand-midnight/40 uppercase tracking-wider">
          {isSubscribed 
            ? "Está a receber notificações instantâneas sobre novas encomendas e atualizações críticas do sistema."
            : "Ative para receber alertas imediatos quando surgirem novas encomendas ou mensagens de clientes."}
        </p>
      </div>
    </div>
  );
}
