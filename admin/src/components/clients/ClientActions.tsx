"use client";

import { useTransition } from "react";
import { Eye, UserMinus, UserCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toggleClientStatus } from "@/lib/actions/clients";
import { cn } from "@/lib/utils";

interface ClientActionsProps {
  clientId: string;
  isActive: boolean;
}

export function ClientActions({ clientId, isActive }: ClientActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggleStatus = () => {
    startTransition(async () => {
      const result = await toggleClientStatus(clientId, isActive);

      if (!result.success) {
        toast.error(result.error ?? "Não foi possível alterar o estado da conta.");
        return;
      }

      toast.success(
        isActive ? "Conta desativada com sucesso." : "Conta ativada com sucesso."
      );
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuItem
        onClick={() => router.push(`/clientes/${clientId}`)}
      >
        <Eye className="h-4 w-4" />
        Ver Detalhes
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={handleToggleStatus}
        disabled={isPending}
        className={cn(
          isActive 
            ? "text-red-500 hover:bg-red-50 hover:text-red-600" 
            : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
        )}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isActive ? (
          <UserMinus className="h-4 w-4" />
        ) : (
          <UserCheck className="h-4 w-4" />
        )}
        {isActive ? "Desativar Conta" : "Ativar Conta"}
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
