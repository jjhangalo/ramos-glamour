import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import Script from "next/script";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { CartPreservedToast } from "@/components/auth/CartPreservedToast";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { PushInitializer } from "@/components/notifications/PushInitializer";
import { SpeedInsights } from "@vercel/speed-insights/next";
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

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ramosglamour.com"),
  title: {
    default: "Ramos Glamour | Moda e Elegância em Luanda",
    template: "%s | Ramos Glamour",
  },
  description: "Ramos Glamour - A sua boutique de luxo em Luanda. Descubra uma coleção exclusiva de moda feminina, acessórios e peças sofisticadas para realçar a sua elegância e estilo único.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ramos Glamour",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_AO",
    url: "https://ramosglamour.com",
    siteName: "Ramos Glamour",
    title: "Ramos Glamour | Moda e Elegância em Luanda",
    description: "Ramos Glamour - A sua boutique de luxo em Luanda. Descubra uma coleção exclusiva de moda feminina, acessórios e peças sofisticadas.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-G98TS5PDM3"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-G98TS5PDM3');
          `}
        </Script>
      </head>
      <body className="flex min-h-screen w-full flex-col overflow-x-hidden bg-brand-bg font-sans text-foreground">
        <PushInitializer />
        <SplashScreen />
        <CartPreservedToast />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <ToastProvider />
        <SpeedInsights />
      </body>
    </html>
  );
}
