"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Truck, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message === "Invalid login credentials"
        ? "E-posta veya şifre hatalı."
        : error.message === "Email not confirmed"
        ? "E-posta adresiniz henüz onaylanmamış."
        : error.message
      );
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="relative z-10 w-full max-w-sm">
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="flex items-center gap-2 bg-card/50 backdrop-blur border px-4 py-2 rounded-full">
          <Truck className="size-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground">CarryHub</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">Giriş Yap</h1>
        <p className="text-xs text-muted-foreground">Hesabınıza giriş yaparak devam edin</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
            "Giriş Yap"
          )}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Hesabınız yok mu?{" "}
        <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
          Kayıt Ol
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0d1115] flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <Suspense fallback={<div className="text-muted-foreground text-sm">Yükleniyor...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
