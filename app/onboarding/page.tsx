"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Check, Building2, Bike, ArrowRight, Store, MapPin, Phone, FileText, Truck, Package, Navigation } from "lucide-react";
import { completeCompanyOnboarding, completeCourierOnboarding } from "@/app/actions/onboarding";

type OnboardingStep = "role" | "company" | "courier" | "done";

const VEHICLE_OPTIONS = [
  { value: "Motorsiklet", label: "Motorsiklet", icon: Bike, desc: "Hafif ve hizli, dar alanlara girer" },
  { value: "Scooter", label: "Scooter", icon: Bike, desc: "Sehir ici kisa mesafe" },
  { value: "Panelvan", label: "Panelvan", icon: Truck, desc: "Orta boy kargolar, raf alani" },
  { value: "Kamyonet", label: "Kamyonet", icon: Truck, desc: "Buyuk hacimli teslimatlar" },
  { value: "Doblo", label: "Doblo / Kombi", icon: Package, desc: "Esnek kullanim, orta hacim" },
];

const DISTRICTS = [
  "Avcilar", "Bagcilar", "Bahcelievler", "Bakirkoy", "Basaksehir",
  "Bayrampasa", "Besiktas", "Beylikduzu", "Beyoglu", "Buyukcekmece",
  "Catalca", "Esenler", "Esenyurt", "Fatih", "Gaziosmanpasa",
  "Gungoren", "Kadikoy", "Kagithane", "Kucukcekmece", "Maltepe",
  "Sariyer", "Silivri", "Sultanbeyli", "Sultangazi", "Sisli",
  "Tuzla", "Umraniye", "Uskudar", "Zeytinburnu",
];

function StepIndicator({ current }: { current: number }) {
  const steps = [
    { num: 1, label: "Rol" },
    { num: 2, label: "Profil" },
    { num: 3, label: "Onay" },
  ];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center gap-2">
          <div
            className={`flex size-7 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300 ${
              current >= s.num
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {current > s.num ? (
              <Check className="size-3.5" />
            ) : (
              s.num
            )}
          </div>
          <span className={`text-xs font-medium ${current >= s.num ? "text-foreground" : "text-muted-foreground"}`}>
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div className={`mx-1 h-px w-6 ${current > s.num ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<OnboardingStep>("role");
  const [role, setRole] = useState<"COMPANY" | "COURIER" | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Company fields
  const [address, setAddress] = useState("");
  const [companyDistrict, setCompanyDistrict] = useState("");
  const [taxId, setTaxId] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");

  // Courier fields
  const [vehicleType, setVehicleType] = useState("");
  const [courierDistrict, setCourierDistrict] = useState("");
  const [courierPhone, setCourierPhone] = useState("");

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      const res = await fetch("/api/auth/role");
      if (res.ok) {
        const { role: userRole } = await res.json();
        if (userRole === "COMPANY") {
          setRole(userRole);
          setStep("company");
        } else if (userRole === "COURIER") {
          setRole(userRole);
          setStep("courier");
        }
      }
      setLoading(false);
    }
    init();
  }, [router, supabase]);

  const getStepNum = (): number => {
    switch (step) {
      case "role": return 1;
      case "company":
      case "courier": return 2;
      case "done": return 3;
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !companyDistrict.trim()) return;
    setSaving(true);
    setError("");

    const result = await completeCompanyOnboarding({
      defaultAddress: address,
      district: companyDistrict,
      taxId,
      phone: companyPhone,
    });

    if (result.success) {
      setStep("done");
    } else {
      setError(result.error || "Bir hata olustu.");
    }
    setSaving(false);
  };

  const handleCourierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleType || !courierDistrict.trim()) return;
    setSaving(true);
    setError("");

    const result = await completeCourierOnboarding({
      vehicleType,
      district: courierDistrict,
      phone: courierPhone,
    });

    if (result.success) {
      setStep("done");
    } else {
      setError(result.error || "Bir hata olustu.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <main className="min-h-dvh bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Profiliniz yukleniyor...</span>
        </div>
      </main>
    );
  }

  if (step === "done") {
    return (
      <main className="min-h-dvh bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm flex flex-col items-center gap-5 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15">
            <Check className="size-7 text-emerald-500" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold tracking-tight">Profil Tamamlandi</h1>
            <p className="text-sm text-muted-foreground max-w-[30ch] leading-relaxed">
              {role === "COMPANY"
                ? "Firma panelinize yonlendiriliyorsunuz."
                : "Kurye pazaryerine yonlendiriliyorsunuz."}
            </p>
          </div>
          <button
            onClick={() => router.replace(role === "COMPANY" ? "/company" : "/courier")}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-foreground text-background px-5 text-sm font-semibold hover:opacity-90 transition active:scale-[0.98]"
          >
            {role === "COMPANY" ? "Firma Paneli" : "Kurye Paneli"}
            <ArrowRight className="size-4" />
          </button>
        </div>
      </main>
    );
  }

  if (step === "role") {
    return (
      <main className="min-h-dvh bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <StepIndicator current={1} />
          <div className="space-y-3">
            <h1 className="text-lg font-semibold tracking-tight">Hos Geldiniz</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CarryHub&apos;a katildiginiz icin tesekkurler. Hesap turunuzu secerek profile baslayin.
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            <button
              onClick={() => { setRole("COMPANY"); setStep("company"); }}
              className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 bg-card hover:bg-accent transition-all active:scale-[0.99] text-left"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Store className="size-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">Firma</div>
                <div className="text-xs text-muted-foreground mt-0.5">Teslimat gonderecek sirket</div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground shrink-0" />
            </button>

            <button
              onClick={() => { setRole("COURIER"); setStep("courier"); }}
              className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 bg-card hover:bg-accent transition-all active:scale-[0.99] text-left"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Navigation className="size-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">Kurye</div>
                <div className="text-xs text-muted-foreground mt-0.5">Teslimat yapacak surucu</div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground shrink-0" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (step === "company") {
    return (
      <main className="min-h-dvh bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <StepIndicator current={2} />

          <div className="flex items-center gap-2 mb-6">
            <Building2 className="size-4 text-primary" />
            <span className="text-sm font-semibold">Firma Profili Tamamla</span>
          </div>

          <form onSubmit={handleCompanySubmit} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <MapPin className="size-3" />
                Adres <span className="text-destructive">*</span>
              </label>
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Firma adresiniz (mahalle, sokak, no)"
                rows={3}
                className="w-full resize-none px-3 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Navigation className="size-3" />
                Calisma Bolgesi <span className="text-destructive">*</span>
              </label>
              <select
                required
                value={companyDistrict}
                onChange={(e) => setCompanyDistrict(e.target.value)}
                className="h-10 w-full px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition"
              >
                <option value="">Ilce secin</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <FileText className="size-3" />
                  Vergi No
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="Opsiyonel"
                  className="h-10 w-full px-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Phone className="size-3" />
                  Telefon
                </label>
                <input
                  type="tel"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="h-10 w-full px-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-2 w-full h-10 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {saving ? (
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  Profili Tamamla
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (step === "courier") {
    return (
      <main className="min-h-dvh bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <StepIndicator current={2} />

          <div className="flex items-center gap-2 mb-6">
            <Bike className="size-4 text-primary" />
            <span className="text-sm font-semibold">Kurye Profili Tamamla</span>
          </div>

          <form onSubmit={handleCourierSubmit} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Arac Turu <span className="text-destructive">*</span>
              </label>
              <div className="grid gap-2">
                {VEHICLE_OPTIONS.map((v) => {
                  const Icon = v.icon;
                  return (
                    <button
                      key={v.value}
                      type="button"
                      onClick={() => setVehicleType(v.value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all active:scale-[0.99] ${
                        vehicleType === v.value
                          ? "border-primary bg-primary/[0.08]"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                        vehicleType === v.value ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{v.label}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{v.desc}</div>
                      </div>
                      {vehicleType === v.value && (
                        <Check className="size-4 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Navigation className="size-3" />
                Calisma Bolgesi <span className="text-destructive">*</span>
              </label>
              <select
                required
                value={courierDistrict}
                onChange={(e) => setCourierDistrict(e.target.value)}
                className="h-10 w-full px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition"
              >
                <option value="">Ilce secin</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Phone className="size-3" />
                Telefon
              </label>
              <input
                type="tel"
                value={courierPhone}
                onChange={(e) => setCourierPhone(e.target.value)}
                placeholder="05XX XXX XX XX"
                className="h-10 w-full px-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-2 w-full h-10 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {saving ? (
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  Profili Tamamla
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return null;
}
