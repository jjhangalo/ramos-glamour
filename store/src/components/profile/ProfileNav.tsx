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
    <div className="flex flex-col gap-12">
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group flex items-center gap-4 py-4 text-[10px] font-bold tracking-[0.3em] transition-all",
                isActive
                  ? "text-brand-gold border-r-2 border-brand-gold"
                  : "text-brand-midnight/40 hover:text-brand-midnight"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-brand-gold" : "text-brand-midnight/20 group-hover:text-brand-midnight")} />
              {link.label}
            </Link>
          );
        })}
        
        <button
          onClick={() => signOut()}
          className="mt-8 flex items-center gap-4 py-4 text-[10px] font-bold tracking-[0.3em] text-red-600/60 hover:text-red-600 transition-all"
        >
          <LogOut className="h-4 w-4 text-red-600/20 group-hover:text-red-600" />
          SAIR DA CONTA
        </button>
      </nav>

      {/* Mobile view is usually handled differently, but I'll keep it simple for now */}
    </div>
  );
}
