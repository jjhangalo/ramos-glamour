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
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  const isHomePage = pathname === "/";
  const useWhite = isHomePage && !scrolled && !isMenuOpen;

  // Handle scroll for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const leftLinks = [
    { href: "/catalogo", label: "COLEÇÕES" },
    { href: "/novidades", label: "NOVIDADES" },
  ];

  const rightLinks = [
    { href: "/empresa", label: "A MARCA" },
    { href: "/#contacto", label: "CONTACTO" },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        scrolled ? "glass py-2" : isHomePage ? "bg-transparent py-6" : "bg-brand-bg py-4 border-b border-brand-midnight/5"
      )}
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="flex h-12 items-center">
          
          {/* Left Section: Mobile Toggle & Desktop Left Nav */}
          <div className="flex flex-1 items-center">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 lg:hidden",
                useWhite ? "text-brand-white hover:bg-white/10" : "text-brand-midnight hover:bg-brand-midnight/5"
              )}
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isMenuOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
            </button>

            {/* Left Navigation (Desktop) */}
            <nav className="hidden items-center gap-10 lg:flex">
              {leftLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "group relative py-2 text-[11px] font-semibold tracking-[0.2em] transition-colors",
                      useWhite 
                        ? "text-brand-white/80 hover:text-brand-white" 
                        : isActive ? "text-brand-midnight" : "text-brand-midnight/60 hover:text-brand-midnight"
                    )}
                  >
                    {link.label}
                    <span
                      className={cn(
                        "absolute bottom-0 left-1/2 h-[1px] w-0 bg-brand-gold transition-all duration-300 group-hover:left-0 group-hover:w-full",
                        isActive && !isHomePage ? "left-0 w-full" : ""
                      )}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Section: Logo */}
          <div className="flex shrink-0 items-center justify-center">
            <Link href="/" className="block" onClick={() => setIsMenuOpen(false)}>
              <div className={cn(
                "relative h-10 w-32 lg:h-12 lg:w-48 transition-all duration-500"
              )}>
                <Image
                  src="/logo-gold.png"
                  alt="Ramos Glamour"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 1024px) 128px, 192px"
                />
              </div>
            </Link>
          </div>

          {/* Right Section: Desktop Right Links & Actions */}
          <div className="flex flex-1 items-center justify-end gap-6">
            {/* Desktop Right Links */}
            <nav className="hidden items-center gap-10 lg:flex">
              {rightLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative py-2 text-[11px] font-semibold tracking-[0.2em] transition-colors",
                    useWhite 
                      ? "text-brand-white/80 hover:text-brand-white" 
                      : "text-brand-midnight/60 hover:text-brand-midnight"
                  )}
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 h-[1px] w-0 bg-brand-gold transition-all duration-300 group-hover:left-0 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {/* User Profile */}
              <div className="hidden lg:block">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={cn(
                        "flex h-12 w-12 items-center justify-center overflow-hidden rounded-full transition-all duration-300 focus:outline-none",
                        useWhite ? "hover:bg-white/10" : "hover:bg-brand-midnight/5"
                      )}>
                        {user.avatarUrl ? (
                          <div className="h-9 w-9 overflow-hidden rounded-full border border-brand-midnight/5">
                            <Image
                              src={user.avatarUrl}
                              alt={user.displayName || "Utilizador"}
                              width={36}
                              height={36}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <UserIcon className={cn("h-6 w-6", useWhite ? "text-brand-white" : "text-brand-midnight")} strokeWidth={1.5} />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 glass border-none shadow-xl">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{user.displayName || "Cliente"}</p>
                          <p className="text-xs text-brand-midnight/50">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-brand-midnight/5" />
                      <DropdownMenuItem asChild>
                        <Link href="/perfil" className="cursor-pointer">
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>O meu perfil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-brand-midnight/5" />
                      <DropdownMenuItem
                        onClick={() => signOut()}
                        className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <button
                    onClick={() => signInWithGoogle(pathname)}
                    className={cn(
                      "text-[11px] font-semibold tracking-[0.2em] transition",
                      useWhite ? "text-brand-white/80 hover:text-brand-white" : "text-brand-midnight/70 hover:text-brand-midnight"
                    )}
                  >
                    ENTRAR
                  </button>
                )}
              </div>

              <CartHeaderButton useWhite={useWhite} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute left-0 top-full w-full bg-brand-bg/95 backdrop-blur-xl border-t border-brand-midnight/5 shadow-2xl animate-in slide-in-from-top-2 lg:hidden"
        >
          <div className="flex flex-col p-8 space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] font-bold tracking-[0.3em] text-brand-midnight/40">LOJA</p>
              {leftLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-2xl font-light tracking-tight text-brand-midnight"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold tracking-[0.3em] text-brand-midnight/40">INFO</p>
              {rightLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-xl font-light tracking-tight text-brand-midnight"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-8 border-t border-brand-midnight/5">
              {user ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded-full border border-brand-midnight/10">
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.displayName || "Utilizador"}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-6 w-6 m-auto mt-3 text-brand-midnight" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{user.displayName || "Cliente"}</span>
                      <span className="text-xs text-brand-midnight/50">{user.email}</span>
                    </div>
                  </div>
                  <Link
                    href="/perfil"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 text-sm"
                  >
                    <UserIcon className="h-4 w-4" />
                    O meu perfil
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 text-sm text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signInWithGoogle(pathname)}
                  className="w-full rounded-full bg-brand-midnight py-4 text-sm font-semibold tracking-[0.2em] text-brand-white"
                >
                  ENTRAR COM GOOGLE
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
