"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, MapPin, Package, Settings, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";

const links = [
  { href: "/profile/orders", label: "ORDERS", icon: Package },
  { href: "/profile/data", label: "PERSONAL DATA", icon: User },
  { href: "/profile/addresses", label: "ADDRESSES", icon: MapPin },
  { href: "/profile/settings", label: "SETTINGS", icon: Settings },
];

export function ProfileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 py-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "group flex items-center gap-3 py-3.5 text-[10px] font-bold tracking-[0.3em] transition-all border-r-2",
              isActive
                ? "text-brand-gold border-brand-gold"
                : "text-brand-midnight/40 hover:text-brand-midnight border-transparent"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-brand-gold" : "text-brand-midnight/20 group-hover:text-brand-midnight")} />
            {link.label}
          </Link>
        );
      })}
      
      <form action={() => signOut()} className="mt-8">
        <button
          type="submit"
          className="flex items-center gap-3 py-3.5 text-[10px] font-bold tracking-[0.3em] text-red-600/60 hover:text-red-600 transition-all w-full"
        >
          <LogOut className="h-4 w-4 shrink-0 text-red-600/20 group-hover:text-red-600" />
          SIGN OUT
        </button>
      </form>
    </nav>
  );
}
