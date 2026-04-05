import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="Ramos Glamour | Administração" />
      </head>
      <body className="min-h-full bg-slate-100 font-sans text-slate-950">
        {children}
      </body>
    </html>
  );
}
