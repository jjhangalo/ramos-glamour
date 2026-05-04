import type { Metadata } from "next";

import { AppToaster } from "@/components/shared/AppToaster";

import { Cormorant_Garamond, Outfit } from "next/font/google";

import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ramos Glamour | Administração",
  description: "Painel administrativo Ramos Glamour",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="pt" 
      className={`${cormorantGaramond.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="Ramos Glamour | Administração" />
        <script dangerouslySetInnerHTML={{ __html: `
          // Unregister any service workers that might be lingering from other local apps (like the store)
          if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
              for (let registration of registrations) {
                registration.unregister();
              }
            });
          }
        ` }} />
      </head>
      <body className="min-h-full bg-brand-bg font-sans text-brand-midnight">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
