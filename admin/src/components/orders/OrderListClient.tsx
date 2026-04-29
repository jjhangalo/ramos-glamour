"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import type { OrderRecord } from "@/lib/types";
import { OrderBulkBar } from "./OrderBulkBar";

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

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="px-5 py-3 w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  checked={selectedIds.length > 0 && selectedIds.length === initialOrders.length}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-5 py-3">ID</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="hidden px-5 py-3 md:table-cell">Itens</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Estado</th>
              <th className="hidden px-5 py-3 lg:table-cell">Data</th>
              <th className="px-5 py-3 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {initialOrders.map((order) => {
              const isSelected = selectedIds.includes(order.id);
              return (
                <tr 
                  key={order.id} 
                  className={cn(
                    "group transition-colors hover:bg-slate-50/50",
                    isSelected ? "bg-slate-50" : ""
                  )}
                >
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                      checked={isSelected}
                      onChange={() => toggleSelection(order.id)}
                    />
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-950">
                    #{shortId(order.id)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="max-w-[120px] truncate text-sm font-medium text-slate-700 md:max-w-none">
                      {order.profiles?.full_name || order.profiles?.display_name || "Cliente sem nome"}
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 text-xs text-slate-500 md:table-cell">
                    {order.order_items?.length ?? 0}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="hidden px-5 py-4 text-xs text-slate-500 lg:table-cell">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap w-[1%]">
                    <Link
                      href={`/encomendas/${order.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-slate-900 hover:text-slate-900"
                      title="Ver detalhes"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <OrderBulkBar 
        selectedIds={selectedIds} 
        selectedOrders={selectedOrders}
        onComplete={() => setSelectedIds([])}
      />
    </>
  );
}
