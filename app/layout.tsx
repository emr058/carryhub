import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "CarryHub — Tekstil Lojistik Pazaryeri",
  description: "Tekstil şirketleri ve bağımsız kurye iş ortakları için operasyon merkezi.",
};

export const viewport: Viewport = { themeColor: "#0d1115", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className="bg-background dark" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
