import type { Metadata, Viewport } from "next";

import { Providers } from "@/app/providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "DESCO MALL — Le Distributeur qui Distribue les Distributeurs",
    template: "%s | DESCO MALL",
  },
  description:
    "Vêtements et accessoires pour femme, homme et enfant au Cameroun. Livraison à Douala et Yaoundé, paiement MTN Mobile Money et Orange Money.",
  keywords: [
    "DESCO MALL",
    "vêtements Cameroun",
    "boutique en ligne Douala",
    "wax",
    "mode africaine",
    "MTN MoMo",
    "Orange Money",
  ],
  openGraph: {
    title: "DESCO MALL",
    description:
      "Le Distributeur qui Distribue les Distributeurs. Mode camerounaise livrée à Douala et Yaoundé.",
    locale: "fr_CM",
    type: "website",
    images: ["/products/photo-1496747611176-843222e1e57c.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CM">
      <head>
        <link
          rel="preload"
          href="/fonts/inter-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/inter-latin-ext.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
