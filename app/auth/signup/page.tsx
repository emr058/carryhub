"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck, Eye, EyeOff, Check } from "lucide-react";

type RoleOption = "COMPANY" | "COURIER";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<RoleOption>("COMPANY");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          phone,
        },
      },
    });

    if (authError) {
      setError(
        authError.message === "User already registered"
          ? "Bu e-posta adresi zaten kayıtlı."
          : authError.message
      );
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError("Hesap oluşturulamadı. Lütfen tekrar deneyin.");
      setLoading(false);
      return;
    }

    // 2. Create user record in our DB via server action
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: authData.user.id,
        email,
        role,
        name,
        phone,
      }),
    });

    if (!res.ok) {
      const { error: msg } = await res.json();
      setError(msg || "Profil oluşturulamadı.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    // Yönlendir
    setTimeout(() => router.push("/onboarding"), 800);
  };

  if (success) {
    return (
      <main className="min-h-screen bg-[#0d1115] flex items-center justify-center p-4">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/20">
            <Check className="size-8 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold">Hesap Oluşturuldu!</h1>
          <p className="text-sm text-muted-foreground">
            E-posta adresinize bir doğrulama bağlantısı gönderdik.{role === "COMPANY" ? " Firma panelinize giriş yapabilirsiniz." : " Kurye pazaryerine giriş yapabilirsiniz."}
          </p>
          <Link
            href="/auth/login"
            className="mt-4 h-11 px-8 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition flex items-center gap-2"
          >
            Giriş Yap
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d1115] flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center gap-2 bg-card/50 backdrop-blur border px-4 py-2 rounded-full">
            <Truck className="size-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground">CarryHub</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Hesap Oluştur</h1>
          <p className="text-xs text-muted-foreground">Platforma katılmak için bilgilerinizi girin</p>
        </div>

        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            type="button"
            onClick={() => setRole("COMPANY")}
            className={`py-3 px-4 rounded-xl border text-xs font-bold transition ${
              role === "COMPANY"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            🏭 Firma
          </button>
          <button
            type="button"
            onClick={() => setRole("COURIER")}
            className={`py-3 px-4 rounded-xl border text-xs font-bold transition ${
              role === "COURIER"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            🚚 Kurye
          </button>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          {role === "COMPANY" ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Firma Adı</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Firma Adı"
                className="h-10 px-3 rounded-lg border bg-background text-sm outline-none focus:border-primary transition"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Ad Soyad</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ad Soyad"
                className="h-10 px-3 rounded-lg border bg-background text-sm outline-none focus:border-primary transition"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Telefon</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05XX XXX XX XX"
              className="h-10 px-3 rounded-lg border bg-background text-sm outline-none focus:border-primary transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">E-posta</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@firma.com"
              className="h-10 px-3 rounded-lg border bg-background text-sm outline-none focus:border-primary transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Şifre</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 6 karakter"
                className="w-full h-10 px-3 pr-10 rounded-lg border bg-background text-sm outline-none focus:border-primary transition"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-500 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              "Kayıt Ol"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Zaten hesabınız var mı?{" "}
          <Link href="/auth/login" className="text-primary font-semibold hover:underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </main>
  );
}
