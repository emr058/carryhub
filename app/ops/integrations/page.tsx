import { Card, ComingSoon } from "@/components/ui";

export default function OpsIntegrationsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-balance text-2xl font-semibold tracking-tight">Entegrasyonlar & API</h1>
        <p className="text-sm text-muted-foreground">CarryHub iş akışlarını ERP, muhasebe ve iletişim kanallarına bağlayın.</p>
      </div>
      <Card className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="max-w-md w-full text-center">
          <ComingSoon
            title="Sistem Entegrasyonları"
            description="Bu sayfa yapım aşamasındadır. Logo ERP, Paraşüt, Shopify ve WhatsApp Business API bağlantı ayarları yakında burada yapılandırılabilecektir."
          />
        </div>
      </Card>
    </div>
  );
}
