import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { ShoppingBag } from "lucide-react";

import { AuthButton } from "@/components/auth/AuthButton";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ramos Glamour",
  description: "Loja feminina Ramos Glamour",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();

  return (
    <html
      lang="pt"
      className={`${playfairDisplay.variable} h-full antialiased`}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="Ramos Glamour" />
      </head>
      <body className="min-h-full bg-brand-bg font-sans text-brand-charcoal">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 border-b border-brand-charcoal/10 bg-white/95 shadow-sm backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <Link
                href="/"
                className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-brand-bg">
                  <Image
                    src="/icon1.png"
                    alt="Ramos Glamour"
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-2xl font-semibold text-brand-charcoal">
                    Ramos Glamour
                  </p>
                  <p className="truncate text-xs uppercase tracking-[0.3em] text-brand-charcoal/60">
                    Loja feminina
                  </p>
                </div>
              </Link>

              <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center gap-2 rounded-full border border-brand-charcoal/10 bg-brand-bg/50 px-4 py-2 text-sm font-medium text-brand-charcoal transition hover:bg-brand-bg"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Carrinho</span>
                  <span className="rounded-full bg-brand-charcoal px-2 py-0.5 text-xs text-brand-white">
                    0
                  </span>
                </Link>
                <AuthButton />
              </div>
            </div>
          </header>

          <div className="flex flex-1 flex-col pt-2">{children}</div>

          <footer className="mt-12 border-t border-brand-charcoal/10 bg-white/80">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-brand-charcoal/75 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <p>Ramos Glamour</p>
              <p>{currentYear}</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
