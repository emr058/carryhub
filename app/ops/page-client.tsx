"use client";

import { useState } from "react";
import {
  ArrowRight,
  BadgeAlert,
  ChevronRight,
  Clock3,
  Map,
  Plus,
  Truck,
  UserRoundCheck,
} from "lucide-react";
import { Badge, Button, Card, CardHeader, Metric, StatusBadge } from "@/components/ui";
import { DeliveryDrawer, MiniMap } from "@/components/carryhub-views";

export function OpsDashboardClient({ data }: { data: any }) {
  const [selected, setSelected] = useState<any>(null);
  const [assignedId, setAssignedId] = useState<string | null>(null);

  if (!data?.success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <span className="text-4xl">⚠️</span>
        <p className="text-muted-foreground">
          Dashboard verisi yüklenemedi: {data?.error || "Bilinmeyen hata"}
        </p>
      </div>
    );
  }

  const { metrics, deliveries, availableCouriers } = data;

  // Dispatch board gruplama
  const pending = deliveries.filter((d: any) => d.status === "Talep Alındı" || d.status === "Kurye Aranıyor");
  const assigned = deliveries.filter((d: any) => d.status === "Kurye Atandı");
  const inTransit = deliveries.filter((d: any) => d.status === "Yolda");
  const riskItems = deliveries.filter((d: any) => d.risk);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-balance text-2xl font-semibold tracking-tight">
              Operasyon Merkezi
            </h1>
            <Badge tone="positive">CANLI</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Merter tekstil ağının sevkiyat, eşleşme ve müdahale komuta merkezi.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Map />
            Harita görünümü
          </Button>
          <Button>
            <Plus />
            Yeni teslimat
          </Button>
        </div>
      </div>

      {/* Metrik Kartları */}
      <div className="grid overflow-hidden rounded-xl border bg-card sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Canlı teslimat"
          value={String(metrics.activeCount)}
          change={`+${metrics.todayCount} bugün`}
        />
        <Metric
          label="Kurye bekleyen"
          value={String(metrics.pendingCourierCount)}
          change={`${metrics.pendingCount} beklemede`}
          trend={metrics.pendingCourierCount > 0 ? "down" : undefined}
        />
        <Metric
          label="Geciken işler"
          value={String(metrics.overdueCount)}
          change={metrics.slaRate}
          trend={metrics.overdueCount > 0 ? "down" : undefined}
        />
        <Metric
          label="Aktif kurye"
          value={String(metrics.activeCourierCount)}
          change={metrics.courierUtilization}
        />
        <Metric
          label="Bugünkü hacim"
          value={metrics.todayVolume}
          change={`${metrics.todayCount} teslimat`}
        />
      </div>

      {/* Canlı Operasyon + Müdahale Kuyruğu */}
      <div className="grid gap-5 xl:grid-cols-[1.45fr_.8fr]">
        <Card>
          <CardHeader
            title="Canlı operasyon ağı"
            description="Kurye konumları, tekstil kümeleri ve terminal akışı"
            action={<Badge tone="primary">30 sn önce</Badge>}
          />
          <MiniMap active={Math.min(deliveries.length, 5)} />
        </Card>

        <Card>
          <CardHeader
            title="Müdahale kuyruğu"
            description="Operasyon ekibinin dikkatini bekleyen işler"
          />
          <div className="flex flex-col gap-1 p-2">
            {riskItems.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Şu anda müdahale gereken iş yok ✅
              </p>
            ) : (
              riskItems.slice(0, 3).map((d: any, i: number) => (
                <button
                  key={d.id}
                  onClick={() => setSelected(d)}
                  className="flex items-center justify-between gap-4 rounded-lg p-3 text-left hover:bg-muted"
                >
                  <span
                    className={`flex size-9 items-center justify-center rounded-lg ${
                      i === 0
                        ? "bg-destructive/12 text-destructive"
                        : "bg-accent/14 text-accent"
                    }`}
                  >
                    {i === 0 ? <Clock3 /> : <BadgeAlert />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-xs">
                      {i === 0
                        ? "Bekleyen teslimat gecikiyor"
                        : "Kurye ataması gerekli"}
                    </strong>
                    <small className="text-muted-foreground">
                      {d.id} · {d.route}
                    </small>
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Dispatch Board */}
      <Card>
        <CardHeader
          title="Canlı dispatch board"
          description="Eşleşme hunisi ve teslimat ilerlemesi"
          action={
            <Button variant="ghost">
              Tümünü aç <ArrowRight />
            </Button>
          }
        />
        <div className="flex gap-4 overflow-x-auto p-5">
          <DispatchColumn
            title="Talep Alındı"
            count={pending.length}
            tone="neutral"
            items={pending.slice(0, 3)}
            onSelect={setSelected}
          />
          <DispatchColumn
            title="Kurye Atandı"
            count={assigned.length}
            tone="warning"
            items={assigned.slice(0, 3)}
            onSelect={setSelected}
          />
          <DispatchColumn
            title="Yolda"
            count={inTransit.length}
            tone="primary"
            items={inTransit.slice(0, 3)}
            onSelect={setSelected}
          />
          <DispatchColumn
            title="Teslim Edildi"
            count={deliveries.filter((d: any) => d.status === "Teslim Edildi").length}
            tone="primary"
            items={[]}
            onSelect={setSelected}
          />
        </div>
      </Card>

      {/* Manuel Kurye Atama + AI Katmanı */}
      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <Card>
          <CardHeader
            title="Manuel kurye atama"
            description={
              pending.length > 0
                ? `${pending[0].id} · ${pending[0].cargo} · ${pending[0].route}`
                : "Bekleyen teslimat yok"
            }
            action={
              pending.length > 0 ? (
                <Badge tone="warning">Atama bekliyor</Badge>
              ) : undefined
            }
          />
          <div className="grid gap-4 p-5 md:grid-cols-3">
            {availableCouriers.length === 0 ? (
              <p className="col-span-3 text-center text-sm text-muted-foreground py-8">
                Müsait kurye bulunamadı
              </p>
            ) : (
              availableCouriers.map((c: any, i: number) => (
                <button
                  key={c.id}
                  disabled={assignedId !== null || pending.length === 0}
                  onClick={() => setAssignedId(c.id)}
                  className="flex flex-col gap-3 rounded-lg border p-4 text-left hover:border-primary disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-full bg-muted font-semibold">
                      {c.name
                        .split(" ")
                        .map((x: string) => x[0])
                        .join("")}
                    </span>
                    {i === 0 && <Badge tone="positive">En yakın</Badge>}
                  </div>
                  <strong className="text-sm">{c.name}</strong>
                  <span className="text-xs text-muted-foreground">
                    {c.vehicleType}
                  </span>
                  <span className="text-xs font-semibold text-primary">
                    {assignedId === c.id ? "Atandı" : "Atamaya uygun"}
                  </span>
                </button>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Gelecek operasyon katmanı"
            description="AI özellikleri henüz devrede değil"
          />
          <div className="grid gap-3 p-5">
            <div className="flex flex-col gap-2 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Truck className="size-4 text-muted-foreground" />
                <strong className="text-sm">Akıllı Kurye Atama</strong>
              </div>
              <p className="text-xs text-muted-foreground">
                Uygunluk, kapasite ve geçmiş performans ile eşleştirme.
              </p>
              <Badge tone="neutral">Yakında</Badge>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <BadgeAlert className="size-4 text-muted-foreground" />
                <strong className="text-sm">Gecikme Uyarıları</strong>
              </div>
              <p className="text-xs text-muted-foreground">
                Risk oluşmadan operasyon ekibini uyaracak tahminler.
              </p>
              <Badge tone="neutral">Yakında</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Delivery Drawer */}
      {selected && (
        <DeliveryDrawer
          delivery={selected}
          close={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function DispatchColumn({
  title,
  count,
  tone,
  items,
  onSelect,
}: {
  title: string;
  count: number;
  tone: "neutral" | "warning" | "danger" | "primary";
  items: any[];
  onSelect: (d: any) => void;
}) {
  return (
    <div className="flex min-w-[260px] flex-1 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`size-2 rounded-full ${
              tone === "danger"
                ? "bg-destructive"
                : tone === "warning"
                ? "bg-accent"
                : tone === "primary"
                ? "bg-primary"
                : "bg-muted-foreground"
            }`}
          />
          <h3 className="text-xs font-semibold">{title}</h3>
        </div>
        <Badge tone={tone}>{count}</Badge>
      </div>
      {items.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-6 text-xs text-muted-foreground">
          {title === "Teslim Edildi" ? "Bugün teslim edilen yok" : "Bu grupta iş yok"}
        </div>
      ) : (
        items.map((d: any) => (
          <button
            key={`${title}-${d.id}`}
            onClick={() => onSelect(d)}
            className="w-full text-left"
          >
            <Card className="p-3">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {d.id}
                    </span>
                    <strong className="text-xs">{d.company}</strong>
                  </div>
                  {d.risk && <Badge tone="danger">SLA</Badge>}
                </div>
                <p className="text-xs leading-relaxed">{d.route}</p>
                <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span>{d.cargo}</span>
                  <span className="font-semibold text-foreground">{d.eta}</span>
                </div>
              </div>
            </Card>
          </button>
        ))
      )}
    </div>
  );
}
