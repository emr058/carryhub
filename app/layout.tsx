import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "CarryHub — Tekstil Lojistik Pazaryeri",
  description: "Tekstil şirketleri ve bağımsız kurye iş ortakları için operasyon merkezi.",
};

export const viewport: Viewport = { themeColor: "#0d1115", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr" className="bg-background dark"><body className={`${geist.variable} ${geistMono.variable} font-sans`}>{children}</body></html>;
}
