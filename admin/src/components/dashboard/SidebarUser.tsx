"use client";

import { LogOut, ShieldCheck } from "lucide-react";

import { signOut } from "@/lib/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type SidebarUserProps = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role?: string | null;
};

export function SidebarUser({
  id,
  name,
  avatarUrl,
  role,
}: Omit<SidebarUserProps, "email">) {
  const isMasterAdmin = id === process.env.NEXT_PUBLIC_MASTER_ADMIN_ID;

  return (
    <div className="mt-auto border-t border-slate-200 pt-5">
      <div className="flex items-center gap-3 px-1">
        <Avatar className="h-10 w-10 border border-slate-200">
          <AvatarImage src={avatarUrl ?? ""} alt={name} />
          <AvatarFallback className="bg-slate-100 text-xs font-medium text-slate-600">
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-slate-950">
              {name}
            </p>
            {isMasterAdmin && (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand-olive" />
            )}
          </div>
          <p className="truncate text-xs text-slate-500">
            {role === "admin" ? "Administrador" : role || "Utilizador"}
          </p>
        </div>
      </div>

      <form action={signOut} className="mt-4">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </form>
    </div>
  );
}
