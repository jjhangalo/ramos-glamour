"use client";

import { useTransition } from "react";
import Link from "next/link";
import { MoreHorizontal, Eye, Power, Star } from "lucide-react";
import toast from "react-hot-toast";

import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toggleProductActive, toggleProductFeatured } from "@/lib/actions/products";
import { cn } from "@/lib/utils";

type ProductRowActionsProps = {
  productId: string;
  isActive: boolean;
  isFeatured: boolean;
};

export function ProductRowActions({
  productId,
  isActive,
  isFeatured,
}: ProductRowActionsProps) {
  const [, startTransition] = useTransition();

  const handleToggleActive = () => {
    startTransition(async () => {
      const result = await toggleProductActive(productId, isActive);
      if (!result.success) {
        toast.error(result.error ?? "Erro ao alterar estado.");
      } else {
        toast.success(isActive ? "Produto desactivado." : "Produto activado.");
      }
    });
  };

  const handleToggleFeatured = () => {
    if (!isActive) return;
    
    startTransition(async () => {
      const result = await toggleProductFeatured(productId, isFeatured);
      if (!result.success) {
        toast.error(result.error ?? "Erro ao alterar destaque.");
      } else {
        toast.success(isFeatured ? "Destaque removido." : "Produto destacado.");
      }
    });
  };

  return (
    <DropdownMenu
      trigger={
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-slate-900 hover:text-slate-900 shadow-sm"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      }
    >
      <Link href={`/produtos/${productId}`} className="w-full">
        <DropdownMenuItem className="min-h-[44px]">
          <Eye className="h-4 w-4" />
          <span>Ver Detalhes</span>
        </DropdownMenuItem>
      </Link>

      <DropdownMenuItem
        onClick={handleToggleActive}
        className="min-h-[44px]"
      >
        <Power className={cn("h-4 w-4", isActive ? "text-red-500" : "text-emerald-500")} />
        <span>{isActive ? "Desativar" : "Ativar"}</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={handleToggleFeatured}
        className={cn(
          "min-h-[44px]",
          !isActive && "opacity-50 grayscale cursor-not-allowed pointer-events-none"
        )}
      >
        <Star className={cn("h-4 w-4", isFeatured ? "text-slate-400" : "text-amber-500")} />
        <span>{isFeatured ? "Remover Destaque" : "Destacar"}</span>
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
