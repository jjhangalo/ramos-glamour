import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
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
      className={`${playfairDisplay.variable} h-full antialiased`}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="Ramos Glamour" />
      </head>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
