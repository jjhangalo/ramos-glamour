"use client";

import * as React from "react";
import { UserMinus, Loader2 } from "lucide-react";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { toggleAdminRole } from "@/lib/actions/clients";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type AdminActionsProps = {
  userId: string;
};

export function AdminActions({ userId }: AdminActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const router = useRouter();

  function handleDemote() {
    startTransition(async () => {
      const result = await toggleAdminRole(userId, "client");
      if (!result.success) {
        toast.error(result.error ?? "Erro ao despromover utilizador.");
        return;
      }
      toast.success("Utilizador despromovido a cliente.");
      router.refresh();
    });
  }

  if (userId === process.env.NEXT_PUBLIC_MASTER_ADMIN_ID) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsConfirmOpen(true)}
        disabled={isPending}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-midnight/5 bg-white text-red-600 shadow-sm transition-all hover:bg-red-50 hover:border-red-100 disabled:opacity-50 active:scale-95"
        title="Despromover a cliente"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-brand-gold" />
        ) : (
          <UserMinus className="h-4 w-4" />
        )}
      </button>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Despromover administrador"
        description="Tens a certeza que pretendes despromover este administrador a cliente? Esta acção removerá todos os privilégios administrativos."
        confirmLabel="Sim, despromover"
        variant="destructive"
        onConfirm={handleDemote}
      />
    </>
  );
}
