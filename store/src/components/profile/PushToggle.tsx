"use client";

import { useState, useEffect } from "react";
import { subscribeUserToPush, unsubscribeUserFromPush, getPushSubscription } from "@/lib/notifications/push";
import { toast } from "react-hot-toast";

export function PushToggle({ initialSubscription }: { initialSubscription: unknown }) {
  const [isSubscribed, setIsSubscribed] = useState(!!initialSubscription);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if browser supports push
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    // Sync real subscription state
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
        toast.success("Notifications deactivated.");
      } else {
        await subscribeUserToPush();
        setIsSubscribed(true);
        toast.success("Notifications activated successfully!");
      }
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Error configuring notifications.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (typeof window !== "undefined" && (!("serviceWorker" in navigator) || !("PushManager" in window))) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white border border-brand-midnight/5 p-8 shadow-[0_16px_35px_rgba(98,98,96,0.08)]">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
            NOTIFICATIONS
          </h4>
          <p className="text-base font-light tracking-tight text-brand-midnight">
            Mobile Push Alerts
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
      <p className="mt-4 text-[10px] leading-relaxed text-brand-midnight/40 uppercase tracking-[0.1em]">
        {isSubscribed 
          ? "You will receive real-time updates about your order status."
          : "Enable to receive real-time updates about your orders directly on your device."}
      </p>
    </div>
  );
}
