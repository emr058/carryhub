"use client";

import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Route, Building2, Truck, Command, ArrowRight,
  LogIn, UserPlus, ChevronDown, MapPin, Package,
  TrendingUp, ShieldCheck, Navigation,
} from "lucide-react";

const IstanbulLandingMap = dynamic(() => import("@/components/landing-map"), { ssr: false });

export default function LandingPage() {
  const { user, loading } = useAuth();

  // While loading, show minimal
  if (loading) {
    return (
      <main className="min-h-screen bg-[#0d1115] flex items-center justify-center">
        <Route className="size-8 text-primary animate-pulse" />
      </main>
    );
  }

  // If already logged in, this page redirects via middleware — but render a fallback
  if (user) {
    return (
      <main className="min-h-screen bg-[#0d1115] flex items-center justify-center p-4">
        <p className="text-muted-foreground text-sm">Yönlendiriliyorsunuz...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d1115] text-foreground relative overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* ===== MAP GRID BACKGROUND ===== */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* ===== GLOW ORBS ===== */}
      <div className="absolute top-1/4 left-1/5 size-[500px] rounded-full bg-primary/8 blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/5 size-[400px] rounded-full bg-accent/8 blur-[120px] animate-pulse" style={{ animationDelay: "3s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary/5 blur-[150px]" />

      <div className="relative z-10 flex flex-col">
        {/* ===== HERO SECTION ===== */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 pb-16 pt-24">
          <div className="max-w-5xl w-full flex flex-col items-center gap-10">
            {/* Logo Badge */}
            <div className="flex items-center gap-2.5 bg-card/60 backdrop-blur border px-4 py-2 rounded-full shadow-sm">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Route className="size-3.5" />
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                CarryHub Tekstil Lojistiği
              </span>
            </div>

            {/* ===== REAL ISTANBUL MAP ===== */}
            <div className="relative w-full max-w-2xl aspect-[2/1] rounded-2xl border bg-card/40 backdrop-blur overflow-hidden shadow-2xl">
              <IstanbulLandingMap />
            </div>

            {/* ===== HEADLINE ===== */}
            <div className="flex flex-col items-center text-center gap-4 max-w-3xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
                <span className="bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
                  Akıllı Lojistik Platformu
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                  Tekstil Sektörü İçin
                </span>
              </h1>
              <p className="max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
                Merter ve Güngören&apos;in tekstil sevkiyat ihtiyaçları için kurulmuş,
                firmalar ve bağımsız kuryeleri bir araya getiren yeni nesil lojistik pazaryeri.
              </p>
            </div>

            {/* ===== CTA BUTTONS ===== */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/auth/login"
                className="flex items-center gap-2 h-12 px-7 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition shadow-lg shadow-primary/20"
              >
                <LogIn className="size-4" />
                Giriş Yap
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-2 h-12 px-7 rounded-xl border bg-card text-foreground font-bold text-sm hover:bg-card/80 transition"
              >
                <UserPlus className="size-4" />
                Kayıt Ol
              </Link>
            </div>

            {/* Scroll indicator */}
            <ChevronDown className="size-6 text-muted-foreground animate-bounce mt-4" />
          </div>
        </section>

        {/* ===== FEATURES SECTION ===== */}
        <section className="px-4 pb-24">
          <div className="max-w-5xl mx-auto flex flex-col items-center gap-16">
            {/* Section header */}
            <div className="text-center max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Tek Çatı Altında Entegre Lojistik
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Firmalar, kuryeler ve operasyon ekibi için özel olarak tasarlanmış ara yüzler.
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid gap-6 md:grid-cols-3 w-full">
              {/* Company */}
              <div className="rounded-2xl border bg-card/60 p-7 hover:bg-card hover:border-primary/30 transition group">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5">
                  <Building2 className="size-6" />
                </span>
                <h3 className="text-lg font-bold mb-2">Firma Paneli</h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="size-3 mt-0.5 shrink-0 text-primary" />
                    Sevkiyat talebi oluşturma
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="size-3 mt-0.5 shrink-0 text-primary" />
                    Kural bazlı fiyat hesaplama
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="size-3 mt-0.5 shrink-0 text-primary" />
                    Canlı teslimat takibi
                  </li>
                </ul>
                <Link
                  href="/auth/signup?role=company"
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  Firma olarak katıl <ArrowRight className="size-3" />
                </Link>
              </div>

              {/* Courier */}
              <div className="rounded-2xl border bg-card/60 p-7 hover:bg-card hover:border-primary/30 transition group">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5">
                  <Truck className="size-6" />
                </span>
                <h3 className="text-lg font-bold mb-2">Kurye Pazaryeri</h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="size-3 mt-0.5 shrink-0 text-primary" />
                    Bölgedeki işleri keşfet
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="size-3 mt-0.5 shrink-0 text-primary" />
                    Esnek çalışma saatleri
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="size-3 mt-0.5 shrink-0 text-primary" />
                    Anlık ödeme sistemi
                  </li>
                </ul>
                <Link
                  href="/auth/signup?role=courier"
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  Kurye olarak katıl <ArrowRight className="size-3" />
                </Link>
              </div>

              {/* Operations */}
              <div className="rounded-2xl border bg-card/60 p-7 hover:bg-card hover:border-primary/30 transition group">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5">
                  <Command className="size-6" />
                </span>
                <h3 className="text-lg font-bold mb-2">Operasyon Merkezi</h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="size-3 mt-0.5 shrink-0 text-primary" />
                    Sevkiyat dispatch panosu
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="size-3 mt-0.5 shrink-0 text-primary" />
                    Dinamik fiyatlandırma
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="size-3 mt-0.5 shrink-0 text-primary" />
                    Finans ve mutabakat
                  </li>
                </ul>
                <Link
                  href="/auth/login"
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  Operasyon girişi <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===== STATS BAR ===== */}
        <section className="border-t border-b py-14 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "50+", label: "Aktif Firma" },
              { value: "200+", label: "Kayıtlı Kurye" },
              { value: "5K+", label: "Tamamlanan Teslimat" },
              { value: "%98", label: "Zamanında Oranı" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="px-4 py-10">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Route className="size-3.5" />
              <span className="font-semibold text-foreground">CarryHub</span>
              <span>— Tekstil Lojistik Pazaryeri</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link href="/auth/login" className="hover:text-foreground transition">Giriş</Link>
              <Link href="/auth/signup" className="hover:text-foreground transition">Kayıt</Link>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>
        </footer>
      </div>

      {/* ===== KEYFRAMES (injected via style tag) ===== */}
      <style jsx>{`
        @keyframes route-draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        :global(.animate-route-draw) {
          animation: route-draw 3s ease-in-out infinite;
        }

        @keyframes truck-move {
          0% {
            offset-distance: 0%;
          }
          100% {
            offset-distance: 100%;
          }
        }
        :global(.animate-truck-move) {
          offset-path: path("M60,200 C120,60 200,240 300,150 C400,60 480,220 540,180");
          offset-rotate: auto;
          animation: truck-move 4s ease-in-out infinite;
        }

        @keyframes ping-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.1; }
        }
        :global(.animate-ping-slow) {
          animation: ping-slow 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
