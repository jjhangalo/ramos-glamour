import { LogOut } from "lucide-react";

import { signOut } from "@/lib/actions/auth";

type SidebarUserProps = {
  name: string;
  email: string;
};

export function SidebarUser({ name, email }: SidebarUserProps) {
  return (
    <div className="mt-auto border-t border-slate-200 pt-5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-950">{name}</p>
        <p className="truncate text-xs text-slate-500">{email}</p>
      </div>
      <form action={signOut} className="mt-4">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </form>
    </div>
  );
}
