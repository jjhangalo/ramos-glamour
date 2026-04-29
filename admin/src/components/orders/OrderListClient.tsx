"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";

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
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="px-5 py-4 w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  checked={selectedIds.length > 0 && selectedIds.length === initialOrders.length}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="hidden px-5 py-3 font-medium md:table-cell">Itens</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="hidden px-5 py-3 font-medium lg:table-cell">Data</th>
              <th className="px-5 py-3 font-medium text-right">Acções</th>
            </tr>
          </thead>
          <tbody>
            {initialOrders.map((order) => {
              const isSelected = selectedIds.includes(order.id);
              return (
                <tr 
                  key={order.id} 
                  className={`border-b border-slate-100 transition-colors hover:bg-slate-50/50 ${isSelected ? 'bg-slate-50' : ''}`}
                >
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      checked={isSelected}
                      onChange={() => toggleSelection(order.id)}
                    />
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-950">
                    #{shortId(order.id)}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    <div className="max-w-[120px] truncate md:max-w-none">
                      {order.profiles?.full_name || order.profiles?.display_name || "Cliente sem nome"}
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 text-slate-700 md:table-cell">
                    {order.order_items?.length ?? 0}
                  </td>
                  <td className="px-5 py-4 text-slate-700 font-medium">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="hidden px-5 py-4 text-slate-700 lg:table-cell">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap w-[1%]">
                    <Link
                      href={`/encomendas/${order.id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 shadow-sm transition hover:bg-slate-100"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
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
