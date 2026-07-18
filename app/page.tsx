"use client";

import Link from "next/link";
import { Building2, Truck, Command, Route, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0d1115] text-foreground flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <div className="absolute top-1/4 left-1/4 size-96 rounded-full bg-primary/20 blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 size-96 rounded-full bg-accent/20 blur-3xl -z-10 animate-pulse" style={{ animationDelay: "2s" }} />

      <div className="max-w-4xl w-full flex flex-col items-center gap-12 z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex items-center gap-3 bg-card/50 backdrop-blur border px-4 py-2 rounded-full shadow-sm">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Route className="size-4" />
            </span>
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">CarryHub Tekstil Lojistiği</span>
          </div>
          <h1 className="text-balance text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Smart Logistics Platform for Textile
          </h1>
          <p className="max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Merter ve Güngören tekstil merkezlerinin sevkiyat, kurye pazaryeri ve operasyonel takip ihtiyaçlarını tek çatı altında birleştiren yeni nesil lojistik platformu.
          </p>
        </div>

        {/* Portals grid */}
        <div className="grid gap-6 md:grid-cols-3 w-full">
          {/* Company Portal */}
          <Link href="/company" className="group flex flex-col justify-between rounded-2xl border bg-card/60 p-6 shadow-md transition-all hover:bg-card hover:border-primary/50 hover:shadow-primary/5 hover:translate-y-[-2px]">
            <div className="flex flex-col gap-4">
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Building2 className="size-6" />
              </span>
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold group-hover:text-primary transition-colors">Firma Paneli</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tekstil sevkiyat talepleri oluşturun, kural bazlı maliyet hesaplayın ve canlı teslimatlarınızı yönetin.
                </p>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between text-xs font-semibold text-primary">
              <span>Portala Git</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Courier Portal */}
          <Link href="/courier" className="group flex flex-col justify-between rounded-2xl border bg-card/60 p-6 shadow-md transition-all hover:bg-card hover:border-primary/50 hover:shadow-primary/5 hover:translate-y-[-2px]">
            <div className="flex flex-col gap-4">
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Truck className="size-6" />
              </span>
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold group-hover:text-primary transition-colors">Kurye Pazaryeri</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bölgedeki aktif sevkiyat işlerini bulun, kapasitenizi yönetin ve güvenli teslimat araçlarını kullanın.
                </p>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between text-xs font-semibold text-primary">
              <span>Portala Git</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Operations Portal */}
          <Link href="/ops" className="group flex flex-col justify-between rounded-2xl border bg-card/60 p-6 shadow-md transition-all hover:bg-card hover:border-primary/50 hover:shadow-primary/5 hover:translate-y-[-2px]">
            <div className="flex flex-col gap-4">
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Command className="size-6" />
              </span>
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold group-hover:text-primary transition-colors">Operasyon Merkezi</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sevkiyat haritası, dispatch panosu, fiyat kuralları ve mutabakat sistemlerini tek ekran üzerinden yönetin.
                </p>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between text-xs font-semibold text-primary">
              <span>Portala Git</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
