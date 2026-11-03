import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Fonts are bundled with the site (no calls to Google at runtime).
const cormorant = localFont({
  variable: "--font-cormorant",
  src: [
    { path: "./fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
  ],
  display: "swap",
});

const montserrat = localFont({
  variable: "--font-montserrat",
  src: [
    { path: "./fonts/montserrat-latin-wght-normal.woff2", weight: "100 900", style: "normal" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UMARR Essentials | Premium Snacks",
  description:
    "Order chin chin, plantain chips, coconut flakes and coconut candy from UMARR Essentials in Lagos. Pick your snacks, send your order on WhatsApp, and we'll confirm.",
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
