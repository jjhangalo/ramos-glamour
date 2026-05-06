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
  email,
  avatarUrl,
  role,
}: SidebarUserProps) {
  const isMasterAdmin = id === process.env.NEXT_PUBLIC_MASTER_ADMIN_ID;

  return (
    <div className="mt-auto border-t border-brand-midnight/5 pt-5">
      <div className="flex items-center gap-3 px-1">
        <Avatar className="h-10 w-10 border border-brand-midnight/10">
          <AvatarImage src={avatarUrl ?? ""} alt={name} />
          <AvatarFallback className="bg-brand-midnight/5 text-xs font-medium text-brand-midnight/60">
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
            <p className="truncate text-sm font-semibold text-brand-midnight">
              {name}
            </p>
            {isMasterAdmin && (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand-gold" />
            )}
          </div>
          <p 
            className="truncate text-[11px] text-brand-midnight/50" 
            title={email}
          >
            {email}
          </p>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-gold/70">
            {role === "admin" ? "Administrador" : role || "Utilizador"}
          </p>
        </div>
      </div>

      <form action={signOut} className="mt-4">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-brand-midnight/10 px-3 py-2 text-sm font-medium text-brand-midnight/60 transition hover:bg-brand-midnight/5 hover:text-brand-midnight"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </form>
    </div>
  );
}
