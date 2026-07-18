import { Card, ComingSoon } from "@/components/ui";

export default function OpsSecurityPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-balance text-2xl font-semibold tracking-tight">Güven, Doğrulama & Yetkiler</h1>
        <p className="text-sm text-muted-foreground">Pazaryeri güvenliği, denetim izleri ve rol bazlı erişim yönetimi.</p>
      </div>
      <Card className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="max-w-md w-full text-center">
          <ComingSoon
            title="Güvenlik ve Yetkilendirme"
            description="Bu sayfa yapım aşamasındadır. Telefon maskeleme kuralları, QR doğrulama sistemi logları ve detaylı rol bazlı erişim denetim tablosu yakında aktif edilecektir."
          />
        </div>
      </Card>
    </div>
  );
}
