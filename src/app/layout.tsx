import type { Metadata, Viewport } from "next";
import { Lilita_One, Nunito } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

const lilita = Lilita_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-lilita",
  display: "swap",
});

const SHARE_TITLE = "Sprout Wars";
const SHARE_DESCRIPTION =
  "Juego para el celular: sacale una foto a una planta real, digitalizala como luchadora y peleá en el ring.";

function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const host =
    (process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : undefined) ?? process.env.VERCEL_URL;
  return host ? `https://${host}` : "http://localhost:3000";
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Sprout Wars",
    template: "%s · Sprout Wars",
  },
  description: SHARE_DESCRIPTION,
  applicationName: "Sprout Wars",
  openGraph: {
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    type: "website",
    locale: "es_AR",
    siteName: "Sprout Wars",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "Sprout Wars",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    title: "Sprout Wars",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#102117",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${nunito.variable} ${lilita.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-foreground antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
