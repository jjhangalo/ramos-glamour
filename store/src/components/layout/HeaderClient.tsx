"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, User as UserIcon, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { signOut, signInWithGoogle } from "@/lib/actions/auth";
import { CartHeaderButton } from "@/components/cart/CartHeaderButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderClientProps {
  user: {
    avatarUrl: string | null;
    displayName: string | null;
    email: string | null;
  } | null;
}

export function HeaderClient({ user }: HeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/catalogo", label: "Catálogo" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4 md:h-16">
          {/* Logo Section */}
          <div className="flex flex-1 items-center justify-start md:flex-none">
            <Link
              href="/"
              className="flex items-center gap-3"
              onClick={() => setIsMenuOpen(false)}
            >
              {/* Mobile Logo (Symbol) */}
              <div className="relative h-10 w-10 md:hidden">
                <Image
                  src="/icon1.png"
                  alt="Ramos Glamour"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              {/* Desktop Logo (Horizontal) */}
              <div className="relative hidden h-12 w-48 md:block">
                <Image
                  src="/logo-horizontal.png"
                  alt="Ramos Glamour"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-brand-charcoal"
                      : "text-brand-charcoal/70 hover:text-brand-charcoal"
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 h-0.5 w-full bg-brand-olive transition-transform duration-300",
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Section (Cart + Auth) */}
          <div className="flex flex-1 items-center justify-end gap-3 md:flex-none">
            <CartHeaderButton />

            {/* User Auth Section (Desktop) */}
            <div className="hidden md:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-brand-charcoal/10 transition hover:border-brand-olive focus:outline-none">
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.displayName || "Utilizador"}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-5 w-5 text-brand-charcoal" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="z-50 w-56 rounded-lg border border-gray-200 bg-white shadow-lg"
                  >
                    <DropdownMenuLabel className="font-normal text-brand-charcoal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.displayName || "Cliente"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/perfil" className="cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>O meu perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="cursor-pointer text-red-600 focus:text-red-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => signInWithGoogle(pathname)}
                  className="rounded-full border border-brand-charcoal px-5 py-2 text-sm font-medium text-brand-charcoal transition hover:bg-brand-bg md:px-6"
                >
                  Entrar
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-brand-charcoal transition hover:bg-brand-bg md:hidden"
              aria-label="Abrir menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute left-0 top-full w-full border-t border-brand-charcoal/5 bg-white shadow-lg animate-in slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:hidden"
        >
          <div className="flex flex-col py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "px-6 py-4 text-sm font-medium transition-colors hover:bg-brand-bg",
                  pathname === link.href
                    ? "text-brand-charcoal"
                    : "text-brand-charcoal/70"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-brand-charcoal/5" />
            <div className="px-6 py-4">
              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-brand-charcoal/10">
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.displayName || "Utilizador"}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-5 w-5 m-auto mt-2 text-brand-charcoal" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-brand-charcoal">
                        {user.displayName || "Cliente"}
                      </span>
                      <span className="text-xs text-brand-charcoal/60">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/perfil"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-brand-charcoal hover:text-brand-olive"
                  >
                    <UserIcon className="h-4 w-4" />
                    O meu perfil
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signInWithGoogle(pathname)}
                  className="w-full rounded-full border border-brand-charcoal py-3 text-sm font-medium text-brand-charcoal transition hover:bg-brand-bg"
                >
                  Entrar com Google
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
