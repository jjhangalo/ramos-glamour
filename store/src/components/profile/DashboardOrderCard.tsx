"use client";

import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils/format";

const statusStyles = {
  pending: "bg-brand-bg text-brand-midnight/60",
  delivering: "bg-blue-50 text-blue-700",
  delivered: "bg-green-50 text-green-700",
  refused: "bg-red-50 text-red-700",
} as const;

const statusLabels = {
  pending: "Pendente",
  delivering: "Em entrega",
  delivered: "Entregue",
  refused: "Recusada",
} as const;

const dateFormatter = new Intl.DateTimeFormat("pt-AO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

interface OrderItem {
  quantity: number;
}

interface Order {
  id: string;
  status: string;
  total: number | string;
  created_at: string;
  order_items?: OrderItem[];
}

interface DashboardOrderCardProps {
  order: Order;
}

export function DashboardOrderCard({ order }: DashboardOrderCardProps) {
  if (!order) return null;

  const status = (order.status as keyof typeof statusLabels) || "pending";
  const itemsCount = order.order_items?.reduce((acc: number, item: OrderItem) => acc + item.quantity, 0) || 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-brand-midnight/5 p-8 transition-all hover:border-brand-gold/20">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
              Última Encomenda
            </p>
            <h3 className="text-sm font-medium text-brand-midnight">
              #{order.id.slice(0, 8).toUpperCase()}
            </h3>
          </div>
          <span className={cn(
            "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
            statusStyles[status]
          )}>
            {statusLabels[status]}
          </span>
        </div>

        {/* Content */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
              Data
            </p>
            <p className="text-sm text-brand-midnight/70">
              {dateFormatter.format(new Date(order.created_at))}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
              Total
            </p>
            <p className="text-sm font-semibold text-brand-midnight">
              {formatPrice(Number(order.total))}
            </p>
          </div>
          <div className="hidden space-y-1 md:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
              Itens
            </p>
            <p className="text-sm text-brand-midnight/70">
              {itemsCount} {itemsCount === 1 ? "item" : "itens"}
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="flex items-center justify-between border-t border-brand-midnight/5 pt-6">
          <Link 
            href="/perfil/encomendas" 
            className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold hover:text-brand-gold/80 transition-colors"
          >
            Ver Detalhes
            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
          
          {status !== 'delivered' && status !== 'refused' && (
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">
              <Package className="h-3 w-3" />
              Acompanhar Envio
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

