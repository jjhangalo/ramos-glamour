"use client";

import { useTransition } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  MoreHorizontal, 
  Eye, 
  ExternalLink, 
  CheckCircle, 
  Truck, 
  XCircle, 
  Package 
} from "lucide-react";
import { cn } from "@/lib/utils";

import { updateOrderStatus } from "@/lib/actions/orders";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import type { OrderRecord } from "@/lib/types";
import { StaggerContainer, StaggerItem } from "@/components/shared/Animations";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";

type OrderListClientProps = {
  initialOrders: OrderRecord[];
};

export function OrderListClient({ initialOrders }: OrderListClientProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusUpdate = (orderId: string, newStatus: OrderRecord["status"]) => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (!result.success) {
        toast.error(result.error ?? "Erro ao actualizar.");
      } else {
        toast.success("Estado actualizado.");
      }
    });
  };

  const getAvailableTransitions = (currentStatus: OrderRecord["status"]) => {
    const terminalStates = ["delivered", "refused"];
    if (terminalStates.includes(currentStatus)) return [];

    const allStatuses: { value: OrderRecord["status"]; label: string; icon: React.ElementType }[] = [
      { value: "pending", label: "Pendente", icon: Package },
      { value: "delivering", label: "Em Entrega", icon: Truck },
      { value: "delivered", label: "Entregar", icon: CheckCircle },
      { value: "refused", label: "Cancelar / Recusar", icon: XCircle },
    ];

    return allStatuses.filter((s) => s.value !== currentStatus);
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden overflow-visible rounded-2xl border border-brand-midnight/5 bg-white shadow-sm md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-brand-bg/40 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-midnight/40">
            <tr className="border-b border-brand-midnight/5">
              <th className="px-5 py-4 pl-8">Encomenda</th>
              <th className="px-5 py-4">Cliente</th>
              <th className="hidden px-5 py-4 lg:table-cell">Itens</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Estado</th>
              <th className="hidden px-5 py-4 xl:table-cell">Data</th>
              <th className="px-5 py-4 text-right pr-8">Acções</th>
            </tr>
          </thead>
          <StaggerContainer as="tbody" className="divide-y divide-brand-midnight/5">
            {initialOrders.map((order) => {
              const transitions = getAvailableTransitions(order.status);
              return (
                <StaggerItem
                  as="tr"
                  key={order.id}
                  className="group transition-colors hover:bg-brand-bg/30"
                >
                  <td className="px-5 py-4 pl-8">
                    <span className="font-mono text-xs font-bold text-brand-midnight">
                      #{shortId(order.id)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="max-w-[160px] truncate text-sm font-medium text-brand-midnight">
                      {order.profiles?.full_name || order.profiles?.display_name || "—"}
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 text-xs text-brand-midnight/50 lg:table-cell">
                    {order.order_items?.length ?? 0}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-brand-midnight">{formatPrice(order.total)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="hidden px-5 py-4 text-xs text-brand-midnight/40 xl:table-cell">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right pr-8">
                    <DropdownMenu 
                      trigger={
                        <button 
                          disabled={isPending}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-midnight/10 text-brand-midnight/40 transition hover:border-brand-midnight hover:text-brand-midnight disabled:opacity-50"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      }
                    >
                      <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-brand-midnight/30">
                        Acções
                      </div>
                      <Link
                        href={`/encomendas/${order.id}`}
                        className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-brand-midnight hover:bg-brand-bg rounded-xl transition"
                      >
                        <Eye className="h-4 w-4 opacity-40" />
                        Ver Detalhes
                      </Link>
                      
                      {transitions.length > 0 && (
                        <>
                          <div className="my-1 h-px bg-brand-midnight/5" />
                          <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-brand-midnight/30">
                            Alterar Estado
                          </div>
                          {transitions.map((t) => (
                            <DropdownMenuItem
                              key={t.value}
                              onClick={() => handleStatusUpdate(order.id, t.value)}
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-wider",
                                t.value === "refused" ? "text-red-600 hover:bg-red-50" : "text-brand-midnight/70"
                              )}
                            >
                              <t.icon className="h-4 w-4 opacity-40" />
                              {t.label}
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                    </DropdownMenu>
                  </td>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </table>
      </div>

      {/* Mobile Card List */}
      <StaggerContainer className="space-y-3 md:hidden">
        {initialOrders.map((order) => {
          const transitions = getAvailableTransitions(order.status);
          return (
            <StaggerItem key={order.id}>
              <div className="group relative overflow-hidden rounded-[2rem] border border-brand-midnight/5 bg-white p-6 shadow-sm transition-all hover:border-brand-gold/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-midnight">
                      #{shortId(order.id)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  
                  <DropdownMenu
                    trigger={
                      <button 
                        disabled={isPending}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-brand-bg text-brand-midnight/40 disabled:opacity-50"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    }
                  >
                    <Link
                      href={`/encomendas/${order.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-brand-midnight hover:bg-brand-bg rounded-xl transition"
                    >
                      <Eye className="h-4 w-4 opacity-40" />
                      Ver Detalhes
                    </Link>
                    
                    {transitions.length > 0 && (
                      <>
                        <div className="my-1 h-px bg-brand-midnight/5" />
                        {transitions.map((t) => (
                          <DropdownMenuItem
                            key={t.value}
                            onClick={() => handleStatusUpdate(order.id, t.value)}
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider",
                              t.value === "refused" ? "text-red-600" : "text-brand-midnight/70"
                            )}
                          >
                            <t.icon className="h-4 w-4 opacity-40" />
                            {t.label}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                  </DropdownMenu>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="truncate text-sm font-bold text-brand-midnight">
                      {order.profiles?.full_name || order.profiles?.display_name || "Cliente sem nome"}
                    </p>
                    {order.profiles?.phone && (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-midnight/30">
                        {order.profiles.phone}
                      </p>
                    )}
                  </div>

                  <div className="flex items-end justify-between border-t border-brand-midnight/5 pt-4">
                    <div>
                      <p className="text-xl font-light text-brand-midnight">{formatPrice(order.total)}</p>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-midnight/20">
                        {order.order_items?.length ?? 0} itens · {formatDate(order.created_at)}
                      </p>
                    </div>
                    
                    <Link
                      href={`/encomendas/${order.id}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-bg text-brand-midnight transition-colors hover:bg-brand-midnight hover:text-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </>
  );
}

