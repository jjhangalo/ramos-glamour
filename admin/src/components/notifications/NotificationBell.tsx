"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
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
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute left-0 top-12 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-3">
            <h2 className="text-sm font-semibold text-slate-950">Notificações</h2>
            {isPending ? (
              <span className="text-xs text-slate-500">A actualizar...</span>
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
                    className="block rounded-xl px-3 py-3 text-sm transition hover:bg-slate-50"
                    onClick={() => setOpen(false)}
                  >
                    <p className="font-medium text-slate-900">
                      Nova encomenda de {customerName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {orderId ? `#${shortId(orderId)} · ` : null}
                      {formatTime(notification.created_at)}
                    </p>
                  </Link>
                );
              })
            ) : (
              <p className="px-3 py-6 text-sm text-slate-500">
                Não há notificações não lidas.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
