"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/perfil", label: "Os meus dados" },
  { href: "/perfil/moradas", label: "As minhas moradas" },
  { href: "/perfil/encomendas", label: "As minhas encomendas" },
];

export function ProfileNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden lg:flex lg:flex-col lg:gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-2xl px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "bg-brand-olive text-brand-white"
                  : "text-brand-charcoal hover:bg-brand-bg",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
                isActive
                  ? "border-brand-olive bg-brand-olive text-brand-white"
                  : "border-brand-charcoal/10 bg-white text-brand-charcoal hover:bg-brand-bg",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
