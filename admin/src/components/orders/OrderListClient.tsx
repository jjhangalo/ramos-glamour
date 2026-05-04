"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, CheckCircle2, Truck, Ban, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import type { OrderRecord } from "@/lib/types";
import { OrderBulkBar } from "./OrderBulkBar";
import { StaggerContainer, StaggerItem } from "@/components/shared/Animations";

type OrderListClientProps = {
  initialOrders: OrderRecord[];
};

export function OrderListClient({ initialOrders }: OrderListClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === initialOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(initialOrders.map((o) => o.id));
    }
  };

  const selectedOrders = initialOrders.filter((o) => selectedIds.includes(o.id));
  const allSelected = selectedIds.length > 0 && selectedIds.length === initialOrders.length;

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-2xl border border-brand-midnight/5 bg-white shadow-sm md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-brand-bg/40 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-midnight/40">
            <tr className="border-b border-brand-midnight/5">
              <th className="w-10 px-5 py-4">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-brand-midnight/20 text-brand-midnight focus:ring-brand-midnight/20 accent-brand-midnight"
                  checked={allSelected}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-5 py-4">Encomenda</th>
              <th className="px-5 py-4">Cliente</th>
              <th className="hidden px-5 py-4 lg:table-cell">Itens</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Estado</th>
              <th className="hidden px-5 py-4 xl:table-cell">Data</th>
              <th className="px-5 py-4 text-right">Acções</th>
            </tr>
          </thead>
          <StaggerContainer as="tbody" className="divide-y divide-brand-midnight/5">
            {initialOrders.map((order) => {
              const isSelected = selectedIds.includes(order.id);
              return (
                <StaggerItem
                  as="tr"
                  key={order.id}
                  className={cn(
                    "group transition-colors hover:bg-brand-bg/30",
                    isSelected ? "bg-brand-gold/5" : ""
                  )}
                >
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer rounded border-brand-midnight/20 accent-brand-midnight"
                      checked={isSelected}
                      onChange={() => toggleSelection(order.id)}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-bold text-brand-midnight">
                      #{shortId(order.id)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="max-w-[160px] truncate text-sm font-medium text-brand-midnight">
                      {order.profiles?.full_name || order.profiles?.display_name || "—"}
                    </div>
                    {order.profiles?.phone && (
                      <p className="mt-0.5 text-[10px] text-brand-midnight/40">{order.profiles.phone}</p>
                    )}
                  </td>
                  <td className="hidden px-5 py-4 text-xs text-brand-midnight/50 lg:table-cell">
                    {order.order_items?.length ?? 0} {(order.order_items?.length ?? 0) === 1 ? "item" : "itens"}
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
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/encomendas/${order.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-midnight/10 text-brand-midnight/40 transition hover:border-brand-midnight hover:text-brand-midnight"
                      title="Ver detalhes"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
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
          const isSelected = selectedIds.includes(order.id);
          return (
            <StaggerItem key={order.id}>
              <div
                className={cn(
                  "group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all",
                  isSelected
                    ? "border-brand-gold/30 bg-brand-gold/5 shadow-brand-gold/10"
                    : "border-brand-midnight/5"
                )}
              >
                {/* Selection checkbox in corner */}
                <input
                  type="checkbox"
                  className="absolute right-4 top-4 h-4 w-4 cursor-pointer rounded border-brand-midnight/20 accent-brand-midnight"
                  checked={isSelected}
                  onChange={() => toggleSelection(order.id)}
                />

                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand-midnight">
                        #{shortId(order.id)}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>

                    <p className="mt-2 truncate text-sm font-medium text-brand-midnight">
                      {order.profiles?.full_name || order.profiles?.display_name || "Cliente sem nome"}
                    </p>
                    {order.profiles?.phone && (
                      <p className="text-xs text-brand-midnight/40">{order.profiles.phone}</p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-light text-brand-midnight">{formatPrice(order.total)}</p>
                        <p className="text-[10px] uppercase tracking-widest text-brand-midnight/40">
                          {order.order_items?.length ?? 0} itens · {formatDate(order.created_at)}
                        </p>
                      </div>
                      <Link
                        href={`/encomendas/${order.id}`}
                        className="flex items-center gap-1 rounded-xl bg-brand-midnight px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-brand-charcoal"
                      >
                        <Eye className="h-3 w-3" />
                        Ver
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      <OrderBulkBar
        selectedIds={selectedIds}
        selectedOrders={selectedOrders}
        onComplete={() => setSelectedIds([])}
      />
    </>
  );
}

// Reexport icons used in bulk bar for it to use the brand style
export { CheckCircle2, Truck, Ban, Loader2, Info };
