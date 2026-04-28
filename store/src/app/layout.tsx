import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartPreservedToast } from "@/components/auth/CartPreservedToast";
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
  title: "Ramos Glamour",
  description: "Loja feminina Ramos Glamour",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${cormorantGaramond.variable} ${outfit.variable} h-full overflow-x-hidden antialiased`}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="apple-mobile-web-app-title" content="Ramos Glamour" />
      </head>
      <body className="flex min-h-screen w-full flex-col overflow-x-hidden bg-brand-bg font-sans text-foreground">
        <CartPreservedToast />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#121212",
              borderRadius: "999px",
              padding: "14px 18px",
            },
          }}
        />
      </body>
    </html>
  );
}
