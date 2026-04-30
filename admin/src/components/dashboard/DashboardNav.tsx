"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Menu } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarUser } from "@/components/dashboard/SidebarUser";
import { dashboardNavItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MobileDashboardNavProps = {
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    role?: string | null;
    email: string;
  };
};

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopDashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-8 space-y-1">
      {dashboardNavItems.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
              active 
                ? "bg-slate-900 text-white shadow-sm" 
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            )}
          >
            <Icon className={cn(
              "h-4 w-4 transition-colors",
              active ? "text-white" : "text-slate-400 group-hover:text-slate-950"
            )} />
            <span className={cn(active ? "font-medium" : "font-normal")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileDashboardNav({ user }: MobileDashboardNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Abrir menu de navegação"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="flex flex-col px-0 py-6">
        <SheetHeader className="px-6">
          <Link href="/" onClick={() => setOpen(false)}>
            <Image
              src="/icon1.png"
              alt="Ramos Glamour"
              width={140}
              height={35}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        </SheetHeader>

        <nav className="mt-4 flex flex-1 flex-col gap-0.5 px-3">
          {dashboardNavItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all duration-200",
                  active 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-white" : "text-slate-400 group-hover:text-slate-950"
                )} />
                <span className={cn(active ? "font-medium" : "font-normal")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4">
          <SidebarUser
            id={user.id}
            name={user.name}
            avatarUrl={user.avatarUrl}
            role={user.role}
            email={user.email}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
