import { Card, ComingSoon } from "@/components/ui";

export default function OpsIntelligencePage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-balance text-2xl font-semibold tracking-tight">Pazaryeri Analitiği</h1>
        <p className="text-sm text-muted-foreground">Tekstil lojistik ağının arz, talep, bağlılık ve yoğunluk sağlığı.</p>
      </div>
      <Card className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="max-w-md w-full text-center">
          <ComingSoon
            title="Pazaryeri Analitiği & Raporlama"
            description="Bu sayfa yapım aşamasındadır. Yakında Merter lojistik ağı arz-talep verileri, kurye verimlilik grafikleri ve haftalık büyüme raporları burada yer alacaktır."
          />
        </div>
      </Card>
    </div>
  );
}
