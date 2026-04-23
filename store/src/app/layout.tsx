import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartPreservedToast } from "@/components/auth/CartPreservedToast";
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
  return (
    <html
      lang="pt"
      className={`${playfairDisplay.variable} h-full overflow-x-hidden antialiased`}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="apple-mobile-web-app-title" content="Ramos Glamour" />
      </head>
      <body className="flex min-h-screen w-full flex-col overflow-x-hidden bg-brand-bg font-sans text-brand-charcoal">
        <CartPreservedToast />
        <Header />
        <main className="flex-1 pt-2">
          {children}
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#626260",
              borderRadius: "999px",
              padding: "14px 18px",
            },
          }}
        />
      </body>
    </html>
  );
}
