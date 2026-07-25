"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { User, Building2, Truck, Save, Loader2 } from "lucide-react";

interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "tel";
  placeholder?: string;
}

interface ProfileConfig {
  title: string;
  icon: typeof User;
  fields: FieldDef[];
}

const roleConfigs: Record<string, ProfileConfig> = {
  ADMIN: {
    title: "Admin Profili",
    icon: User,
    fields: [
      { name: "name", label: "Ad Soyad", placeholder: "Operasyon sorumlusu" },
      { name: "phone", label: "Telefon", type: "tel", placeholder: "05XX XXX XX XX" },
      { name: "email", label: "E-posta", placeholder: "E-posta adresi" },
    ],
  },
  COMPANY: {
    title: "Firma Profili",
    icon: Building2,
    fields: [
      { name: "name", label: "Firma Adı", placeholder: "Firma ünvanı" },
      { name: "phone", label: "Telefon", type: "tel", placeholder: "05XX XXX XX XX" },
      { name: "defaultAddress", label: "Adres", placeholder: "Merkez adres" },
      { name: "district", label: "İlçe", placeholder: "Merkez ilçe" },
      { name: "taxId", label: "Vergi No", placeholder: "Vergi kimlik numarası" },
    ],
  },
  COURIER: {
    title: "Kurye Profili",
    icon: Truck,
    fields: [
      { name: "name", label: "Ad Soyad", placeholder: "Adınız soyadınız" },
      { name: "phone", label: "Telefon", type: "tel", placeholder: "05XX XXX XX XX" },
      { name: "vehicleType", label: "Araç Tipi", placeholder: "Motorsiklet, araba, vb." },
      { name: "district", label: "Çalışma Bölgesi", placeholder: "Çalıştığınız ilçe" },
    ],
  },
};

export default function ProfilePage({ role }: { role: "ADMIN" | "COMPANY" | "COURIER" }) {
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const config = roleConfigs[role];

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/profile");
        if (res.ok) {
          const data = await res.json();
          const profile = data.profile || {};
          // Populate from user_metadata for ADMIN
          const meta = user?.user_metadata || {};
          setFormData({
            email: data.email ?? "",
            name: profile.name ?? meta.name ?? "",
            phone: profile.phone ?? meta.phone ?? "",
            defaultAddress: profile.defaultAddress ?? "",
            district: profile.district ?? "",
            taxId: profile.taxId ?? "",
            vehicleType: profile.vehicleType ?? "",
          });
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, authLoading]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // Only send profile fields (not email)
      const profileFields = config.fields
        .filter((f) => f.name !== "email")
        .reduce(
          (acc, f) => {
            acc[f.name] = formData[f.name] ?? "";
            return acc;
          },
          {} as Record<string, string>
        );

      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: profileFields }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Profil başarıyla güncellendi." });
      } else {
        setMessage({ type: "error", text: "Güncellenirken bir hata oluştu." });
      }
    } catch {
      setMessage({ type: "error", text: "Bağlantı hatası." });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-7" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{config.title}</h1>
          <p className="text-sm text-muted-foreground">Profil bilgilerinizi görüntüleyin ve düzenleyin</p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border bg-card p-6 md:p-8">
        <div className="grid gap-5">
          {config.fields.map((field) => {
            const isEmail = field.name === "email";
            return (
              <div key={field.name} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  {field.label}
                </label>
                <input
                  type={field.type ?? "text"}
                  value={formData[field.name] ?? ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={isEmail}
                  className={`h-10 px-3 rounded-lg border bg-background text-sm outline-none transition ${
                    isEmail
                      ? "opacity-50 cursor-not-allowed"
                      : "focus:border-primary"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mt-5 rounded-lg p-3 text-xs font-medium ${
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/20 text-green-500"
                : "bg-red-500/10 border border-red-500/20 text-red-500"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
      </div>
    </div>
  );
}
