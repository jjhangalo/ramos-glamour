"use client";

import { UserMinus, Loader2 } from "lucide-react";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { toggleAdminRole } from "@/lib/actions/clients";

type AdminActionsProps = {
  userId: string;
};

export function AdminActions({ userId }: AdminActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDemote() {
    if (!confirm("Tens a certeza que pretendes despromover este administrador a cliente?")) {
      return;
    }

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
    <button
      onClick={handleDemote}
      disabled={isPending}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-700 transition hover:bg-red-50 disabled:opacity-50"
      title="Despromover a cliente"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <UserMinus className="h-4 w-4" />
      )}
    </button>
  );
}
