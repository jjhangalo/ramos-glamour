"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";

import { markNotificationsAsRead } from "@/lib/actions/notifications";
import { formatTime, shortId } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { NotificationItem } from "@/lib/types";

type NotificationBellProps = {
  initialNotifications: NotificationItem[];
};

export function NotificationBell({
  initialNotifications,
}: NotificationBellProps) {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    const channelName =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? `admin-notifications-${crypto.randomUUID()}`
        : `admin-notifications-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const notification = payload.new as NotificationItem;
          if (notification.type !== "new_order") {
            return;
          }

          setNotifications((current) => [notification, ...current].slice(0, 10));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications],
  );

  function handleOpen() {
    const unreadIds = notifications
      .filter((notification) => !notification.is_read)
      .map((notification) => notification.id);

    setOpen((current) => !current);

    if (!unreadIds.length) {
      return;
    }

    startTransition(async () => {
      const result = await markNotificationsAsRead(unreadIds);
      if (!result.success) {
        toast.error(result.error ?? "Não foi possível actualizar notificações.");
        return;
      }

      setNotifications((current) =>
        current.map((notification) =>
          unreadIds.includes(notification.id)
            ? { ...notification, is_read: true }
            : notification,
        ),
      );
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-midnight/10 text-brand-midnight/60 transition-all",
          open ? "bg-brand-midnight/5 text-brand-midnight shadow-inner" : "hover:bg-brand-midnight/5 hover:text-brand-midnight"
        )}
        aria-label="Notificações"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[9px] font-bold text-brand-white shadow-sm ring-2 ring-brand-bg">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute left-0 top-11 z-[100] w-80 max-w-[calc(100vw-32px)] rounded-xl border border-brand-midnight/5 bg-white/90 backdrop-blur-md p-3 shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-brand-midnight/5 px-2 pb-3">
            <h2 className="text-sm font-semibold text-brand-midnight">Notificações</h2>
            {isPending ? (
              <span className="text-xs text-brand-midnight/40">A actualizar...</span>
            ) : null}
          </div>
          <div className="mt-2 space-y-2">
            {notifications.length ? (
              notifications.map((notification) => {
                const customerName =
                  notification.payload?.customer_name ?? "cliente";
                const orderId = notification.payload?.order_id;

                return (
                  <Link
                    key={notification.id}
                    href={orderId ? `/encomendas/${orderId}` : "/encomendas"}
                    className="block rounded-xl px-3 py-3 text-sm transition hover:bg-brand-midnight/5"
                    onClick={() => setOpen(false)}
                  >
                    <p className="font-medium text-brand-midnight">
                      Nova encomenda de {customerName}
                    </p>
                    <p className="mt-1 text-xs text-brand-midnight/40">
                      {orderId ? `#${shortId(orderId)} · ` : null}
                      {formatTime(notification.created_at)}
                    </p>
                  </Link>
                );
              })
            ) : (
              <p className="px-3 py-6 text-sm text-brand-midnight/40">
                Não há notificações não lidas.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
