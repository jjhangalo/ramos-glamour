"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { dashboardNavItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",
              active && "bg-gray-100 font-medium text-slate-950",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileDashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-screen-sm grid-cols-5 px-2 py-2">
        {dashboardNavItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 items-center justify-center rounded-xl text-slate-500 transition",
                active && "bg-gray-100 text-slate-950",
              )}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
