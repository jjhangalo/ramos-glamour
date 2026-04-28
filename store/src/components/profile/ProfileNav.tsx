"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, MapPin, Package, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";

const links = [
  { href: "/perfil/dados", label: "OS MEUS DADOS", icon: User },
  { href: "/perfil/moradas", label: "MORADAS DE ENVIO", icon: MapPin },
  { href: "/perfil/encomendas", label: "ENCOMENDAS", icon: Package },
];

export function ProfileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row lg:flex-col items-center lg:items-start gap-8 lg:gap-1 overflow-x-auto lg:overflow-x-visible scrollbar-hide py-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "group flex items-center gap-3 py-4 text-[10px] font-bold tracking-[0.3em] transition-all whitespace-nowrap border-b-2 lg:border-b-0 lg:border-r-2",
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
      
      <button
        onClick={() => signOut()}
        className="flex items-center gap-3 py-4 text-[10px] font-bold tracking-[0.3em] text-red-600/60 hover:text-red-600 transition-all whitespace-nowrap lg:mt-8"
      >
        <LogOut className="h-4 w-4 shrink-0 text-red-600/20 group-hover:text-red-600" />
        SAIR DA CONTA
      </button>
    </nav>
  );
}
