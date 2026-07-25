"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Activity, ArrowRight, BarChart3, Bell, Boxes, Building2, Check, ChevronDown, ChevronRight,
  CircleDollarSign, Clock3, Command, FileCheck2, FileText, Gauge, Grid2X2, HandCoins, History,
  KeyRound, Layers3, Link2, Map, MapPin, Menu, MessageSquareText, PackageCheck, PanelLeftClose,
  Plus, QrCode, Route, Search, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, Truck,
  UserRoundCheck, UsersRound, WalletCards, Webhook, X, Edit3, Phone, Navigation,
} from "lucide-react";
import { deliveries, intelligence, priceRules, transactions, type Delivery } from "@/lib/data";
import { Badge, Button, Card, CardHeader, ComingSoon, Metric, StatusBadge } from "@/components/ui";
import { createDelivery, acceptDelivery, updateDeliveryStatus, updateCompanyAddress, getCompany, getCompanyDeliveries, getCourierDailyStats } from "@/app/actions/delivery";
import { createClient } from "@/lib/supabase-client";
const supabase = createClient();

export function MiniMap({ active = 3 }: { active?: number }) {
  const points = ["left-[16%] top-[32%]", "left-[35%] top-[55%]", "left-[55%] top-[24%]", "left-[68%] top-[62%]", "left-[83%] top-[38%]"];
  return <div className="relative min-h-64 overflow-hidden bg-muted/40 rounded-xl border">
    <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "36px 36px", transform: "rotate(-8deg) scale(1.2)" }} />
    <div className="absolute left-[7%] top-[50%] h-1 w-[82%] rotate-[-8deg] rounded-full bg-primary/30" />
    <div className="absolute left-[28%] top-[18%] h-[65%] w-1 rotate-[18deg] rounded-full bg-border" />
    {points.slice(0, active).map((point, i) => <div key={point} className={`absolute ${point} flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md`}><span className="text-[10px] font-bold">{i + 1}</span></div>)}
    <div className="absolute bottom-4 left-4 rounded-lg border bg-card/90 px-3 py-2 text-xs shadow-sm"><strong>Merter ağı</strong><span className="ml-2 text-muted-foreground">24 canlı iş · 18 kurye</span></div>
  </div>;
}

export function DeliveryTable({ onSelect, limit }: { onSelect: (delivery: Delivery) => void; limit?: number }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left text-sm"><thead className="border-b bg-muted/35 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-3">Teslimat</th><th className="px-4 py-3">Tekstil yükü</th><th className="px-4 py-3">Kurye</th><th className="px-4 py-3">Durum</th><th className="px-4 py-3">ETA</th><th className="px-4 py-3 text-right">Müşteri fiyatı</th></tr></thead><tbody>{deliveries.slice(0, limit).map(d => <tr key={d.id} onClick={() => onSelect(d)} className="cursor-pointer border-b last:border-0 hover:bg-muted/35"><td className="px-5 py-3.5"><div className="flex flex-col gap-1"><strong className="font-mono text-xs">{d.id}</strong><span className="text-xs text-muted-foreground">{d.route}</span></div></td><td className="px-4 py-3.5"><div className="flex flex-col gap-1"><strong className="text-xs">{d.cargo}</strong><span className="text-xs text-muted-foreground">{d.units} · {d.vehicle}</span></div></td><td className="px-4 py-3.5 text-xs">{d.courier}</td><td className="px-4 py-3.5"><StatusBadge status={d.status} /></td><td className={`px-4 py-3.5 text-xs font-semibold ${d.risk ? "text-destructive" : ""}`}>{d.eta}</td><td className="px-4 py-3.5 text-right font-mono text-xs font-semibold">{d.price}</td></tr>)}</tbody></table></div>;
}

export function DispatchColumn({ title, count, tone, items }: { title: string; count: number; tone: "neutral" | "warning" | "danger" | "primary"; items: Delivery[] }) {
  return <div className="flex min-w-[260px] flex-1 flex-col gap-3"><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><span className={`size-2 rounded-full ${tone === "danger" ? "bg-destructive" : tone === "warning" ? "bg-accent" : tone === "primary" ? "bg-primary" : "bg-muted-foreground"}`} /><h3 className="text-xs font-semibold">{title}</h3></div><Badge tone={tone}>{count}</Badge></div>{items.map(d => <Card key={`${title}-${d.id}`} className="p-3"><div className="flex flex-col gap-3"><div className="flex items-start justify-between gap-2"><div className="flex flex-col gap-1"><span className="font-mono text-[11px] text-muted-foreground">{d.id}</span><strong className="text-xs">{d.company}</strong></div>{d.risk && <Badge tone="danger">SLA</Badge>}</div><p className="text-xs leading-relaxed">{d.route}</p><div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground"><span>{d.cargo}</span><span className="font-semibold text-foreground">{d.eta}</span></div></div></Card>)}</div>;
}

export function CommandCenter({ onSelect }: { onSelect: (d: Delivery) => void }) {
  const [assigned, setAssigned] = useState(false);
  return <div className="flex flex-col gap-5">
    <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex flex-col gap-1"><div className="flex items-center gap-2"><h1 className="text-balance text-2xl font-semibold tracking-tight">Operasyon Merkezi</h1><Badge tone="positive">CANLI</Badge></div><p className="text-sm text-muted-foreground">Merter tekstil ağının sevkiyat, eşleşme ve müdahale komuta merkezi.</p></div><div className="flex gap-2"><Button variant="outline"><Map />Harita görünümü</Button><Button><Plus />Yeni teslimat</Button></div></div>
    <div className="grid overflow-hidden rounded-xl border bg-card sm:grid-cols-2 xl:grid-cols-5"><Metric label="Canlı teslimat" value="24" change="+6 bugün" /><Metric label="Kurye bekleyen" value={assigned ? "3" : "4"} change="2 kritik" trend="down" /><Metric label="Geciken işler" value="3" change="%4,8 SLA" trend="down" /><Metric label="Aktif kurye" value="18" change="%76 kullanım" /><Metric label="Bugünkü hacim" value="₺86.4K" change="+%12,8" /></div>
    <div className="grid gap-5 xl:grid-cols-[1.45fr_.8fr]"><Card><CardHeader title="Canlı operasyon ağı" description="Kurye konumları, tekstil kümeleri ve terminal akışı" action={<Badge tone="primary">30 sn önce</Badge>} /><MiniMap active={5} /></Card><Card><CardHeader title="Müdahale kuyruğu" description="Operasyon ekibinin dikkatini bekleyen işler" /><div className="flex flex-col gap-1 p-2">{deliveries.filter(d => d.risk).map((d, i) => <button key={d.id} onClick={() => onSelect(d)} className="flex items-center justify-between gap-4 rounded-lg p-3 text-left hover:bg-muted"><span className={`flex size-9 items-center justify-center rounded-lg ${i === 0 ? "bg-destructive/12 text-destructive" : "bg-accent/14 text-accent"}`}>{i === 0 ? <Clock3 /> : <UserRoundCheck />}</span><span className="min-w-0 flex-1"><strong className="block truncate text-xs">{i === 0 ? "İhracat teslimatı gecikiyor" : "Manuel kurye ataması gerekli"}</strong><small className="text-muted-foreground">{d.id} · {d.route}</small></span><ChevronRight className="size-4 text-muted-foreground" /></button>)}</div></Card></div>
    <Card><CardHeader title="Canlı dispatch board" description="Eşleşme hunisi ve teslimat ilerlemesi" action={<Button variant="ghost">Tümünü aç <ArrowRight /></Button>} /><div className="flex gap-4 overflow-x-auto p-5"><DispatchColumn title="Talep Alındı" count={6} tone="neutral" items={[deliveries[1]]} /><DispatchColumn title="Kurye Aranıyor" count={assigned ? 3 : 4} tone="warning" items={assigned ? [] : [deliveries[1]]} /><DispatchColumn title="Alımda" count={5} tone="primary" items={[deliveries[2]]} /><DispatchColumn title="Yolda" count={9} tone="primary" items={[deliveries[0], deliveries[3]]} /></div></Card>
    <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]"><Card><CardHeader title="Manuel kurye atama" description="CH-2846 · 18 rulo dokuma kumaş · Bağcılar → Ambarlı" action={<Badge tone="warning">18 dk kaldı</Badge>} /><div className="grid gap-4 p-5 md:grid-cols-3">{[{name:"Burak Yılmaz",v:"Kamyonet",r:"4,94",d:"1,8 km"},{name:"Özgür Demir",v:"Panelvan",r:"4,88",d:"2,4 km"},{name:"Ahmet Işık",v:"Kamyonet",r:"4,91",d:"3,1 km"}].map((c,i)=><button disabled={assigned} onClick={() => setAssigned(true)} key={c.name} className="flex flex-col gap-3 rounded-lg border p-4 text-left hover:border-primary disabled:opacity-50"><div className="flex items-center justify-between"><span className="flex size-9 items-center justify-center rounded-full bg-muted font-semibold">{c.name.split(" ").map(x=>x[0]).join("")}</span>{i===0&&<Badge tone="positive">En yakın</Badge>}</div><strong className="text-sm">{c.name}</strong><span className="text-xs text-muted-foreground">{c.v} · ★ {c.r} · {c.d}</span><span className="text-xs font-semibold text-primary">{assigned ? "Atandı" : "₺2.738 hakediş"}</span></button>)}</div></Card><Card><CardHeader title="Gelecek operasyon katmanı" description="AI özellikleri henüz devrede değil" /><div className="grid gap-3 p-5"><ComingSoon title="Akıllı Kurye Atama" description="Uygunluk, kapasite ve geçmiş performans ile eşleştirme." /><ComingSoon title="Gecikme Uyarıları" description="Risk oluşmadan operasyon ekibini uyaracak tahminler." /></div></Card></div>
  </div>;
}

export function DeliveriesView({ initialDeliveries = [], onSelect }: { initialDeliveries?: any[], onSelect: (d: any) => void }) {
  const [localDeliveries, setLocalDeliveries] = useState<any[]>(initialDeliveries);
  const [statusFilter, setStatusFilter] = useState<"Tümü" | "Bekleyenler" | "Yoldakiler">("Tümü");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLocalDeliveries(initialDeliveries);
  }, [initialDeliveries]);

  useEffect(() => {
    const channel = supabase
      .channel("public:Delivery:Ops")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Delivery" },
        (payload) => {
          console.log("Realtime event in Ops Deliveries:", payload);
          if (payload.eventType === "INSERT") {
            const newDelivery = payload.new as any;
            setLocalDeliveries(prev => {
              if (prev.some(d => d.id === newDelivery.id)) return prev;
              return [
                {
                  ...newDelivery,
                  price: `₺${Number(newDelivery.price).toLocaleString("tr-TR")}`,
                  company: { name: "Merter Merkez Atölye" }
                },
                ...prev
              ];
            });
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as any;
            setLocalDeliveries(prev => prev.map(d => {
              if (d.id === updated.id) {
                const courierObj = updated.courierId ? { name: "Ahmet Yılmaz" } : null;
                return {
                  ...d,
                  ...updated,
                  price: `₺${Number(updated.price).toLocaleString("tr-TR")}`,
                  courier: courierObj
                };
              }
              return d;
            }));
          } else if (payload.eventType === "DELETE") {
            setLocalDeliveries(prev => prev.filter(d => d.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialDeliveries]);

  const handleAssign = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click opening the drawer
    const result = await acceptDelivery(id);
    if (result.success) {
      setLocalDeliveries(prev => prev.map(d => {
        if (d.id === id) {
          return {
            ...d,
            courier: { name: "Ahmet Yılmaz (Manuel)" },
            status: "ASSIGNED"
          };
        }
        return d;
      }));
    } else {
      alert(`Atama hatası: ${result.error}`);
    }
  };

  const counts = useMemo(() => {
    return {
      all: localDeliveries.length,
      pending: localDeliveries.filter(d => d.status === "PENDING").length,
      enRoute: localDeliveries.filter(d => ["ASSIGNED", "IN_TRANSIT"].includes(d.status)).length
    };
  }, [localDeliveries]);

  const filtered = useMemo(() => {
    return localDeliveries.filter(d => {
      const companyName = d.company?.name || d.company || "";
      const courierName = d.courier?.name || d.courier || "Atama Bekliyor";
      const cargoText = d.packageType || d.cargo || "";
      const routeText = d.route || `${d.pickupAddress} → ${d.dropoffAddress}`;

      const matchesSearch = d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            routeText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cargoText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            courierName.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      if (statusFilter === "Bekleyenler") {
        return d.status === "PENDING";
      }
      if (statusFilter === "Yoldakiler") {
        return ["ASSIGNED", "IN_TRANSIT"].includes(d.status);
      }
      return true;
    });
  }, [localDeliveries, searchTerm, statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Canlı Teslimatlar Kontrol Kulesi
            </h1>
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
            </span>
            <Badge tone="positive">CANLI YAYIN</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Merter lojistik ağındaki tüm sevkiyatların saniyelik hareket izleme ve kurye atama merkezi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-xs font-semibold">
            <FileText className="size-3.5" />
            Excel Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Control filters & search panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card/40 border rounded-2xl p-4">
        {/* Status Pill Buttons */}
        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl border">
          {(["Tümü", "Bekleyenler", "Yoldakiler"] as const).map((filter) => {
            const count = filter === "Tümü" ? counts.all : filter === "Bekleyenler" ? counts.pending : counts.enRoute;
            const isActive = statusFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{filter}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${isActive ? "bg-primary-foreground/20" : "bg-muted"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex min-w-72 items-center gap-2 rounded-xl border bg-background px-3 h-10">
          <Search className="size-4 text-muted-foreground" />
          <input
            aria-label="Teslimat ara"
            placeholder="Sipariş ID, firma veya rota ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-xs outline-none text-foreground placeholder-muted-foreground"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <Card className="overflow-hidden border border-white/5 shadow-xl bg-card/60 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left border-collapse text-xs">
            <thead className="border-b bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-4">Sipariş ID</th>
                <th className="px-4 py-4">Gönderici Firma</th>
                <th className="px-4 py-4">Alıcı & Rota</th>
                <th className="px-4 py-4">Kargo Tipi</th>
                <th className="px-4 py-4">Atanan Kurye</th>
                <th className="px-4 py-4">Durum</th>
                <th className="px-4 py-4 text-right">Ücret</th>
                <th className="px-5 py-4 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((d) => {
                const isPending = d.status === "PENDING";
                const isEnRoute = ["ASSIGNED", "IN_TRANSIT"].includes(d.status);

                const displayStatus = isPending ? "Kurye Bekleniyor" : isEnRoute ? "Yolda" : "Teslim Edildi";
                const badgeTone = isPending ? "warning" : isEnRoute ? "primary" : "positive";

                const from = d.pickupAddress || d.route?.split("→")[0]?.trim();
                const to = d.dropoffAddress || d.route?.split("→")[1]?.trim();
                const companyName = d.company?.name || d.company || "Bilinmeyen Firma";
                const courierName = d.courier?.name || d.courier || "Atama Bekliyor";
                const cargoText = d.packageType || d.cargo || "Kargo";
                const serviceText = d.service || "Standart";
                const unitsText = d.units || "Paket";

                return (
                  <tr
                    key={d.id}
                    onClick={() => onSelect(d)}
                    className="hover:bg-muted/30 cursor-pointer transition"
                  >
                    {/* ID */}
                    <td className="px-5 py-4 font-mono font-semibold text-foreground">
                      {d.id.substring(0, 8)}...
                    </td>

                    {/* Sender */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-0.5">
                        <strong className="text-foreground font-semibold">{companyName}</strong>
                        <span className="text-[10px] text-muted-foreground truncate max-w-48 block">{from}</span>
                      </div>
                    </td>

                    {/* Recipient */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-0.5">
                        <strong className="text-foreground font-semibold truncate max-w-48 block">{to || "Belirtilmemiş"}</strong>
                        <span className="text-[10px] text-muted-foreground">{serviceText}</span>
                      </div>
                    </td>

                    {/* Cargo Type */}
                    <td className="px-4 py-4 text-muted-foreground">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">{cargoText}</span>
                        <span className="text-[10px] text-muted-foreground">{unitsText}</span>
                      </div>
                    </td>

                    {/* Courier */}
                    <td className="px-4 py-4">
                      {courierName === "Atama Bekliyor" || courierName === "Atama bekliyor" ? (
                        <span className="font-semibold text-amber-500">Atama Bekliyor</span>
                      ) : (
                        <span className="text-foreground font-medium">{courierName}</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <Badge tone={badgeTone}>{displayStatus}</Badge>
                    </td>

                    {/* Cost */}
                    <td className="px-4 py-4 text-right font-mono font-bold text-foreground">
                      {d.price}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      {isPending ? (
                        <button
                          type="button"
                          onClick={(e) => handleAssign(d.id, e)}
                          className="inline-flex h-8 items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 text-black px-3.5 text-[11px] font-bold transition shadow-sm active:scale-[0.97]"
                        >
                          Manuel Ata
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(d);
                          }}
                          className="inline-flex h-8 items-center justify-center rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground px-3.5 text-[11px] font-bold transition"
                        >
                          Detay
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                    Aranan kriterlere uygun canlı teslimat kaydı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function CompanyView({
  initialDeliveries = [],
  companyId,
  onSelect
}: {
  initialDeliveries?: any[];
  companyId?: string | null;
  onSelect: (d: any) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const [cargoType, setCargoType] = useState<"1-5 Çuval" | "Koli" | "Top Kumaş" | "Askılı Ürün">("Koli");
  const [recipient, setRecipient] = useState("Zeytinburnu Dikimhane");
  const [customRecipientAddress, setCustomRecipientAddress] = useState("");

  const [company, setCompany] = useState<any>(null);
  const [addressInput, setAddressInput] = useState("Merter Merkez Atölye");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [companyDeliveries, setCompanyDeliveries] = useState<any[]>(initialDeliveries);

  useEffect(() => {
    async function load() {
      const res = await getCompany();
      if (res.success && res.company) {
        setCompany(res.company as any);
        setAddressInput((res.company as any).defaultAddress);
      }
    }
    load();
  }, []);

  useEffect(() => {
    setCompanyDeliveries(initialDeliveries);
  }, [initialDeliveries]);

  useEffect(() => {
    const channel = supabase
      .channel("public:Delivery:Company")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Delivery" },
        (payload) => {
          console.log("Realtime event in Company Deliveries:", payload);
          if (payload.eventType === "INSERT") {
            const newDelivery = payload.new as any;
            if (newDelivery.companyId === companyId) {
              setCompanyDeliveries(prev => {
                if (prev.some(d => d.id === newDelivery.id)) return prev;
                return [
                  {
                    ...newDelivery,
                    price: `₺${Number(newDelivery.price).toLocaleString("tr-TR")}`
                  },
                  ...prev
                ];
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as any;
            if (updated.companyId === companyId) {
              setCompanyDeliveries(prev => prev.map(d => {
                if (d.id === updated.id) {
                  const courierObj = updated.courierId ? { name: "Ahmet Yılmaz" } : null;
                  return {
                    ...d,
                    ...updated,
                    price: `₺${Number(updated.price).toLocaleString("tr-TR")}`,
                    courier: courierObj
                  };
                }
                return d;
              }));
            }
          } else if (payload.eventType === "DELETE") {
            setCompanyDeliveries(prev => prev.filter(d => d.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialDeliveries, companyId]);

  const pricingData = useMemo(() => {
    const prices = {
      "1-5 Çuval": { numericPrice: 1450, customer: "₺1.450", payout: "₺1.232", comm: "₺218 · %15", breakdown: [["Mesafe ücreti", "₺950"], ["1-5 Çuval tarifesi", "₺300"], ["Aynı gün hizmet", "₺200"]] },
      "Koli": { numericPrice: 2680, customer: "₺2.680", payout: "₺2.278", comm: "₺402 · %15", breakdown: [["Mesafe ücreti", "₺1.850"], ["Hacim ek bedeli", "₺600"], ["Askılı taşıma", "₺230"]] },
      "Top Kumaş": { numericPrice: 3860, customer: "₺3.860", payout: "₺3.242", comm: "₺618 · %16", breakdown: [["Mesafe ücreti", "₺2.250"], ["Rulo kumaş farkı", "₺980"], ["Yükleme desteği", "₺630"]] },
      "Askılı Ürün": { numericPrice: 2980, customer: "₺2.980", payout: "₺2.533", comm: "₺447 · %15", breakdown: [["Mesafe ücreti", "₺1.950"], ["Askılı araç farkı", "₺800"], ["Hassas taşıma", "₺230"]] },
    };
    return prices[cargoType];
  }, [cargoType]);

  const recipients = [
    { name: "Zeytinburnu Dikimhane", details: "Çırpıcı Mah., Zeytinburnu" },
    { name: "Güngören Depo", details: "Sanayi Mah., Güngören" },
    { name: "Ambarlı Limanı", details: "Kavaklı, Beylikdüzü" }
  ];

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);

    let dropoffAddress = "";
    if (recipient === "Manuel Adres") {
      if (!customRecipientAddress.trim()) {
        alert("Lütfen geçerli bir alıcı adresi giriniz.");
        setLoading(false);
        return;
      }
      dropoffAddress = customRecipientAddress;
    } else {
      const selectedRecipientObj = recipients.find(r => r.name === recipient);
      dropoffAddress = selectedRecipientObj ? `${selectedRecipientObj.name}, ${selectedRecipientObj.details}` : recipient;
    }

    const result = await createDelivery({
      packageType: cargoType,
      pickupAddress: company?.defaultAddress || "Merter Merkez Atölye, Mehmet Nesih Özmen Mah., Fatih Cd. No: 24, Güngören",
      dropoffAddress: dropoffAddress,
      price: pricingData.numericPrice,
    });

    setLoading(false);
    if (result.success) {
      setCreated(true);
      setCustomRecipientAddress("");
      setTimeout(() => {
        setCreated(false);
        setCargoType("Koli");
        setRecipient("Zeytinburnu Dikimhane");
      }, 3000);
    } else {
      alert(`Sipariş oluşturulamadı: ${result.error}\n\nNot: Veritabanınızın çalıştığından ve seed verisinin yüklendiğinden emin olun.`);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-balance text-2xl font-semibold tracking-tight">
            Özdenim Tekstil San. ve Tic. A.Ş.
          </h1>
          <p className="text-sm text-muted-foreground">
            Hızlı sevkiyat talebi, eşleşme ve faturalandırma çalışma alanı.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid overflow-hidden rounded-xl border bg-card sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Bu ay sevkiyat" value="86" change="+%14" />
        <Metric label="Yoldaki yük" value="12" change="3 terminal" />
        <Metric label="Aylık harcama" value="₺148.6K" change="+%8,2" />
        <Metric label="Zamanında teslimat" value="%96,4" change="+1,8 puan" />
      </div>

      {/* Form and Payout Grid */}
      <div className="grid gap-5 xl:grid-cols-[1fr_.75fr]">
        <Card className="flex flex-col">
          <CardHeader
            title="Tekstil sevkiyatı oluştur"
            description="Kargo tipi ve alıcıyı hızlıca seçerek kuryenizi çağırın."
          />
          <div className="flex flex-col gap-5 p-5">
            {/* Sender Address */}
            <div className="flex flex-col gap-2 rounded-xl border bg-muted/20 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Gönderici Adresi</span>
                <button
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="flex size-8 items-center justify-center rounded-lg border text-muted-foreground hover:bg-muted hover:text-foreground transition"
                >
                  <Edit3 className="size-3.5" />
                </button>
              </div>
              {isEditingAddress ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-lg border bg-background text-xs text-foreground outline-none focus:border-primary"
                  />
                  <button
                    onClick={async () => {
                      if (!company) return;
                      const res = await updateCompanyAddress(company.id, addressInput);
                      if (res.success && res.company) {
                        setCompany(res.company);
                        setIsEditingAddress(false);
                        alert("Adres başarıyla güncellendi!");
                      } else {
                        alert(`Adres güncellenemedi: ${res.error}`);
                      }
                    }}
                    className="h-9 px-3 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 transition shrink-0"
                  >
                    Kaydet
                  </button>
                </div>
              ) : (
                <p className="text-sm font-semibold text-foreground">
                  {company?.defaultAddress || "Merter Merkez Atölye"}
                </p>
              )}
            </div>

            {/* Cargo Type Quick Pick */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Kargo Tipi</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(["1-5 Çuval", "Koli", "Top Kumaş", "Askılı Ürün"] as const).map((type) => {
                  const isActive = cargoType === type;
                  const Icon = type === "1-5 Çuval" ? Boxes : type === "Koli" ? PackageCheck : type === "Top Kumaş" ? Layers3 : Truck;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCargoType(type)}
                      className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border text-center font-semibold text-xs transition active:scale-[0.98] ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-5" />
                      <span>{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recipient Address selection */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Alıcı Adresi</span>
              <div className="grid gap-2 sm:grid-cols-4">
                {recipients.map((rec) => {
                  const isActive = recipient === rec.name;
                  return (
                    <button
                      key={rec.name}
                      type="button"
                      onClick={() => setRecipient(rec.name)}
                      className={`flex flex-col p-3 rounded-xl border text-left transition active:scale-[0.98] ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <strong className="text-xs font-semibold">{rec.name}</strong>
                      <span className="text-[10px] opacity-75 mt-0.5 truncate">{rec.details}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setRecipient("Manuel Adres")}
                  className={`flex flex-col p-3 rounded-xl border text-left transition active:scale-[0.98] ${
                    recipient === "Manuel Adres"
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <strong className="text-xs font-semibold">Manuel Adres</strong>
                  <span className="text-[10px] opacity-75 mt-0.5 truncate">Farklı alıcı adresi yazın</span>
                </button>
              </div>

              {recipient === "Manuel Adres" && (
                <div className="mt-2 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Alıcı Adres Metni</span>
                  <textarea
                    rows={2}
                    placeholder="Örn: Güneşli, Çınar Sk. No:5, Bağcılar"
                    value={customRecipientAddress}
                    onChange={(e) => setCustomRecipientAddress(e.target.value)}
                    className="w-full p-3 rounded-lg border bg-background text-xs outline-none focus:border-primary transition"
                  />
                </div>
              )}
            </div>

            {/* Call Courier Action button */}
            <div className="mt-2 border-t pt-4">
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className={`w-full py-4 px-5 rounded-xl font-bold text-sm tracking-wide transition active:scale-[0.99] shadow-lg flex items-center justify-center gap-2 ${
                  created
                    ? "bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-600/30"
                    : loading
                    ? "bg-primary/50 cursor-not-allowed text-primary-foreground"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {created ? (
                  <>
                    <Check className="size-4" />
                    Kurye Çağrıldı
                  </>
                ) : loading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Kurye Çağrılıyor...
                  </>
                ) : (
                  <>
                    <Truck className="size-4" />
                    Kurye Çağır
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>

        {/* Pricing Detail breakdown */}
        <Card>
          <CardHeader
            title="Fiyat dökümü"
            description={`FR-214 · Güngören → ${recipient === "Manuel Adres" ? customRecipientAddress || "Manuel" : recipient.split(" ")[0]} tarifesi`}
          />
          <div className="flex flex-col gap-3 p-5">
            {pricingData.breakdown.map((x) => (
              <div key={x[0]} className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">{x[0]}</span>
                <strong>{x[1]}</strong>
              </div>
            ))}
            <div className="my-1 border-t" />
            <PriceRow label="Müşteri Fiyatı" value={pricingData.customer} />
            <PriceRow label="Kurye Kazancı" value={pricingData.payout} />
            <PriceRow label="Pazaryeri Komisyonu" value={pricingData.comm} />
          </div>
        </Card>
      </div>

      {/* Live tracking table */}
      <Card>
        <CardHeader
          title="Bugünkü Gönderilerim"
          description="Oluşturulan siparişlerinizin canlı operasyon ve kurye atama süreçleri"
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="border-b bg-muted/35 uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Sipariş ID</th>
                <th className="px-4 py-3">Alıcı Rota</th>
                <th className="px-4 py-3">Kargo Tipi</th>
                <th className="px-4 py-3">Fiyat</th>
                <th className="px-4 py-3">Atanan Kurye</th>
                <th className="px-4 py-3">Durum</th>
              </tr>
            </thead>
            <tbody>
              {companyDeliveries.map((d) => {
                const route = d.dropoffAddress;
                const priceText = typeof d.price === "string" ? d.price : `₺${Number(d.price).toLocaleString("tr-TR")}`;
                const courierName = d.courier?.name || "Kurye Bekleniyor";
                return (
                  <tr key={d.id} onClick={() => onSelect(d)} className="cursor-pointer border-b last:border-0 hover:bg-muted/35">
                    <td className="px-5 py-4 font-mono font-semibold">{d.id.substring(0, 8)}...</td>
                    <td className="px-4 py-4 truncate max-w-[240px]" title={route}>{route}</td>
                    <td className="px-4 py-4 text-muted-foreground">{d.packageType}</td>
                    <td className="px-4 py-4 font-mono font-semibold">{priceText}</td>
                    <td className="px-4 py-4 text-muted-foreground">{courierName}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={d.status} />
                    </td>
                  </tr>
                );
              })}
              {companyDeliveries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    Bugün henüz bir tekstil sevkiyat siparişi oluşturulmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function CourierView({
  initialDeliveries = [],
  courierId,
  initialStats = { count: 0, earnings: 0 }
}: {
  initialDeliveries?: any[];
  courierId?: string | null;
  initialStats?: { count: number; earnings: number };
}) {
  const [activeDeliveries, setActiveDeliveries] = useState<any[]>(initialDeliveries);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [isPoDOpen, setIsPoDOpen] = useState(false);
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    setActiveDeliveries(initialDeliveries);
  }, [initialDeliveries]);

  const refreshStats = async () => {
    const res = await getCourierDailyStats();
    if (res.success) {
      setStats({ count: res.count, earnings: res.earnings });
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("public:Delivery:Courier")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Delivery" },
        (payload) => {
          console.log("Realtime event in Courier:", payload);
          if (payload.eventType === "INSERT") {
            const newDelivery = payload.new as any;
            setActiveDeliveries(prev => {
              if (prev.some(d => d.id === newDelivery.id)) return prev;
              return [
                {
                  ...newDelivery,
                  price: `₺${Number(newDelivery.price).toLocaleString("tr-TR")}`,
                  company: { name: "Merter Merkez Atölye" } // Seed default fallback
                },
                ...prev
              ];
            });
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as any;
            if (updated.status === "DELIVERED") {
              refreshStats();
            }
            setActiveDeliveries(prev => prev.map(d => {
              if (d.id === updated.id) {
                return {
                  ...d,
                  ...updated,
                  price: `₺${Number(updated.price).toLocaleString("tr-TR")}`
                };
              }
              return d;
            }));
          } else if (payload.eventType === "DELETE") {
            setActiveDeliveries(prev => prev.filter(d => d.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialDeliveries]);

  const handleAccept = async (id: string) => {
    if (loadingId) return;
    setLoadingId(id);
    const result = await acceptDelivery(id);
    setLoadingId(null);
    if (result.success) {
      setActiveDeliveries(prev => prev.map(d => {
        if (d.id === id) {
          return {
            ...d,
            status: "ASSIGNED",
            courierId: courierId
          };
        }
        return d;
      }));
    } else {
      alert(`Hata: ${result.error}`);
    }
  };

  const handleCompleteSubmit = async (receiverName: string) => {
    if (!completingId) return;
    setIsPoDOpen(false);
    setLoadingId(completingId);
    const result = await updateDeliveryStatus(completingId, "DELIVERED", receiverName);
    setLoadingId(null);
    setCompletingId(null);
    if (result.success) {
      refreshStats();
      setActiveDeliveries(prev => prev.map(d => {
        if (d.id === completingId) {
          return { ...d, status: "DELIVERED", receiverName };
        }
        return d;
      }));
    } else {
      alert(`Hata: ${result.error}`);
    }
  };

  const pendingJobs = activeDeliveries.filter(d => d.status === "PENDING");
  const myActiveJobs = activeDeliveries.filter(d => d.status === "ASSIGNED" && d.courierId === courierId);

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto w-full px-2 py-4">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5 pb-2 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Kurye Pazaryeri
          </h1>
          <Badge tone="positive">MÜSAİT</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Yakındaki tekstil sevkiyat işleri, anlık kapasite ve performans.
        </p>
      </div>

      {/* Performance Summary Card */}
      <Card className="p-4 bg-card/60 backdrop-blur-md border border-white/5">
        <h2 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Bugünkü Performans</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground">Tamamlanan</span>
            <strong className="text-lg font-bold text-foreground">{stats.count} İş</strong>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground">Bugünkü Kazanç</span>
            <strong className="text-lg font-bold text-emerald-500">₺{stats.earnings.toLocaleString("tr-TR")}</strong>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground">Kabul Oranı</span>
            <strong className="text-lg font-bold text-primary">%92</strong>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground">Puanınız</span>
            <strong className="text-lg font-bold text-accent">★ 4.94</strong>
          </div>
        </div>
      </Card>

      {/* Active Tasks Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wider px-1 flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
          Aktif Görevim
        </h2>
        {myActiveJobs.map((d) => {
          const payout = typeof d.price === "string" ? d.price : `₺${Number(d.price).toLocaleString("tr-TR")}`;
          const isLoading = loadingId === d.id;

          return (
            <div
              key={d.id}
              className="rounded-2xl border border-amber-500/30 bg-card/40 p-5 shadow-lg flex flex-col gap-5 transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="font-mono text-xs font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                  {d.id.substring(0, 8)}...
                </span>
                <Badge tone="warning">Aktif Taşıma</Badge>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary/12 text-primary font-bold text-[10px]">A</span>
                    <div className="w-0.5 h-6 bg-border/50 my-1" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Nereden</span>
                    <p className="text-sm font-semibold text-foreground truncate">{d.pickupAddress}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="flex size-5 items-center justify-center rounded-full bg-accent/12 text-accent font-bold text-[10px]">B</span>
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-accent tracking-wider">Nereye</span>
                    <p className="text-sm font-semibold text-foreground truncate">{d.dropoffAddress}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-muted/20 rounded-xl p-3 border border-white/5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Kargo Tipi</span>
                    <p className="text-xs font-semibold text-foreground truncate">{d.packageType}</p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Gönderici Firma</span>
                    <p className="text-xs font-semibold text-foreground truncate">{d.company?.name || "Bilinmiyor"}</p>
                  </div>
                </div>
              </div>

              {/* Quick Communication and Navigation buttons */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${d.company?.phone || "+902125555555"}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 bg-muted/30 hover:bg-muted/50 text-xs font-bold text-foreground transition active:scale-[0.98]"
                >
                  <Phone className="size-3.5 text-primary" />
                  Firmayı Ara
                </a>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://maps.google.com/?q=${encodeURIComponent(d.dropoffAddress)}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 bg-muted/30 hover:bg-muted/50 text-xs font-bold text-foreground transition active:scale-[0.98]"
                >
                  <Navigation className="size-3.5 text-primary" />
                  Yol Tarifi Al
                </a>
              </div>

              {/* Action button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  setCompletingId(d.id);
                  setIsPoDOpen(true);
                }}
                className="w-full py-3.5 px-5 rounded-xl font-bold text-sm tracking-wide transition-all bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-emerald-600/50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Tamamlanıyor...
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    Teslimatı Tamamla (PoD)
                  </>
                )}
              </button>
            </div>
          );
        })}
        {myActiveJobs.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground bg-muted/5 border border-dashed rounded-2xl">
            Şu an üzerinizde aktif görev bulunmamaktadır.
          </div>
        )}
      </div>

      {/* Task Cards Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">Yeni İşler</h2>
        {pendingJobs.map((d) => {
          const payout = typeof d.price === "string" ? d.price : `₺${Number(d.price).toLocaleString("tr-TR")}`;
          const isLoading = loadingId === d.id;

          return (
            <div
              key={d.id}
              className="rounded-2xl border border-white/5 bg-card/40 p-5 shadow-lg flex flex-col gap-5 transition-all active:scale-[0.99]"
            >
              {/* Header: ID and Service Level */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="font-mono text-xs font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                  {d.id.substring(0, 8)}...
                </span>
                <Badge tone="primary">Standart</Badge>
              </div>

              {/* Body: Route Details */}
              <div className="flex flex-col gap-4">
                {/* From Address */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary/12 text-primary font-bold text-[10px]">A</span>
                    <div className="w-0.5 h-6 bg-border/50 my-1" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Nereden (Alım)</span>
                    <p className="text-sm font-semibold text-foreground truncate">{d.pickupAddress}</p>
                  </div>
                </div>

                {/* To Address */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="flex size-5 items-center justify-center rounded-full bg-accent/12 text-accent font-bold text-[10px]">B</span>
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-accent tracking-wider">Nereye (Teslim)</span>
                    <p className="text-sm font-semibold text-foreground truncate">{d.dropoffAddress}</p>
                  </div>
                </div>

                {/* Cargo Info */}
                <div className="grid grid-cols-2 gap-3 bg-muted/20 rounded-xl p-3 border border-white/5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Kargo Tipi</span>
                    <p className="text-xs font-semibold text-foreground truncate">{d.packageType}</p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Gönderici Firma</span>
                    <p className="text-xs font-semibold text-foreground truncate">{d.company?.name || "Bilinmiyor"}</p>
                  </div>
                </div>

                {/* Estimated Payout Info */}
                <div className="flex justify-between items-center bg-emerald-500/5 rounded-xl px-4 py-3 border border-emerald-500/10">
                  <span className="text-xs font-semibold text-emerald-500/90">Tahmini Kazancınız</span>
                  <strong className="text-2xl font-black text-emerald-500 tracking-tight font-mono">{payout}</strong>
                </div>
              </div>

              {/* Action Button: Wide green button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleAccept(d.id)}
                className="w-full py-3.5 px-5 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-emerald-600/50"
              >
                {isLoading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Kabul Ediliyor...
                  </>
                ) : (
                  <>
                    <ArrowRight className="size-4" />
                    İşi Kabul Et
                  </>
                )}
              </button>
            </div>
          );
        })}
        {pendingJobs.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground bg-muted/10 border border-dashed rounded-2xl">
            Şu an yakınınızda açık iş ilanı bulunmamaktadır.
          </div>
        )}
      </div>

      {/* Günün Özeti Widget */}
      <Card className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 text-xs">📊</span>
          <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Günün Özeti</h2>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">Kapatılan Teslimatlar</span>
          <strong className="text-sm font-semibold">{stats.count} İş</strong>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Net Günlük Kazanç</span>
          <strong className="text-lg font-black text-emerald-500 font-mono">₺{stats.earnings.toLocaleString("tr-TR")}</strong>
        </div>
      </Card>

      {/* Safety Actions */}
      <Card className="p-4 flex flex-col gap-3 bg-card/60 backdrop-blur-md">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Güvenli İşlemler</h2>
        <Button variant="outline" className="justify-between min-h-12 rounded-xl text-xs font-bold">
          <span className="flex items-center gap-2"><QrCode className="size-4 text-primary" /> QR Kod Doğrulama</span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Button>
        <Button variant="outline" className="justify-between min-h-12 rounded-xl text-xs font-bold">
          <span className="flex items-center gap-2"><FileCheck2 className="size-4 text-primary" /> Teslimat Kanıtı Yükle</span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Button>
        <Button variant="outline" className="justify-between min-h-12 rounded-xl text-xs font-bold">
          <span className="flex items-center gap-2"><MessageSquareText className="size-4 text-primary" /> Müşteri ile Görüş</span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Button>
      </Card>
      
      <PoDModal
        isOpen={isPoDOpen}
        onClose={() => {
          setIsPoDOpen(false);
          setCompletingId(null);
        }}
        onSubmit={handleCompleteSubmit}
      />
    </div>
  );
}

export function PricingView() {
  const [simulated, setSimulated] = useState(false);
  return <div className="flex flex-col gap-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex flex-col gap-1"><h1 className="text-balance text-2xl font-semibold tracking-tight">Fiyatlandırma Motoru</h1><p className="text-sm text-muted-foreground">AI kullanmadan, versiyonlu iş kurallarıyla müşteri fiyatı ve kurye hakedişi yönetin.</p></div><Button><Plus />Yeni fiyat kuralı</Button></div><div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]"><Card><CardHeader title="Aktif fiyat kuralları" description="Bölge, tekstil yükü, hizmet ve araç bazında önceliklendirilmiş kurallar" action={<Badge tone="positive">32 AKTİF</Badge>} /><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="border-b bg-muted/35 text-[11px] uppercase text-muted-foreground"><tr><th className="px-5 py-3">Kural</th><th className="px-4 py-3">Koşullar</th><th className="px-4 py-3">Minimum</th><th className="px-4 py-3">Komisyon</th><th className="px-4 py-3">Durum</th></tr></thead><tbody>{priceRules.map(r=><tr key={r.name} className="border-b last:border-0"><td className="px-5 py-4 text-xs font-semibold">{r.name}</td><td className="px-4 py-4 text-xs text-muted-foreground">{r.conditions}</td><td className="px-4 py-4 font-mono text-xs">{r.minimum}</td><td className="px-4 py-4 font-mono text-xs">{r.commission}</td><td className="px-4 py-4"><StatusBadge status={r.status} /></td></tr>)}</tbody></table></div></Card><Card><CardHeader title="Kural simülatörü" description="Yayınlamadan önce fiyat bileşimini doğrulayın." /><div className="flex flex-col gap-4 p-5"><Field label="Rota" value="Güngören → Giyimkent" /><Field label="Yük" value="24 koli hazır giyim · 286 kg" /><Field label="Hizmet / Araç" value="Aynı Gün · Panelvan" /><Button onClick={()=>setSimulated(true)}><Gauge />Fiyatı simüle et</Button>{simulated&&<div className="flex flex-col gap-2 rounded-lg bg-muted p-4"><PriceRow label="Müşteri Fiyatı" value="₺2.680" /><PriceRow label="Kurye Kazancı" value="₺2.278" /><PriceRow label="Komisyon" value="₺372" /><span className="mt-1 text-[11px] text-muted-foreground">FR-128 v4 kuralı eşleşti · minimum fiyat uygulanmadı.</span></div>}</div></Card></div><Card><CardHeader title="Kural parametreleri" description="Motorun değerlendirdiği yapılandırılabilir iş girdileri" /><div className="flex flex-wrap gap-2 p-5">{["Alım ilçesi","Varış ilçesi","Yük tipi","Miktar","Ağırlık","Hacim","Aciliyet","Elleçleme","Hizmet seviyesi","Kurye aracı","Minimum fiyat","Komisyon","Kurye hakedişi"].map(x=><Badge key={x} tone="neutral">{x}</Badge>)}</div></Card></div>;
}

export function FinanceView({ initialTransactions = [], summary = { totalCommission: 0, totalValue: 0, count: 0 } }: { initialTransactions?: any[], summary?: any }) {
  const [localTransactions, setLocalTransactions] = useState<any[]>(initialTransactions);

  useEffect(() => {
    setLocalTransactions(initialTransactions);
  }, [initialTransactions]);

  const pendingCollection = `₺${Number(summary.totalValue).toLocaleString("tr-TR")}`;
  const courierPayouts = `₺${Number(summary.totalValue - summary.totalCommission).toLocaleString("tr-TR")}`;
  const marketplaceCommission = `₺${Number(summary.totalCommission).toLocaleString("tr-TR")}`;
  const countText = `${summary.count} Teslimat`;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-balance text-2xl font-semibold tracking-tight">Finans & Mutabakat</h1>
          <p className="text-sm text-muted-foreground">Şirket bakiyeleri, kurye hakedişleri ve pazaryeri komisyonunun tek görünümü.</p>
        </div>
        <Button><Plus />Mutabakat oluştur</Button>
      </div>

      {/* Metrics */}
      <div className="grid overflow-hidden rounded-xl border bg-card sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Hacim (Toplam Ciro)" value={pendingCollection} change={countText} trend="up" />
        <Metric label="Kurye Hakedişleri" value={courierPayouts} change="Hesaplandı" />
        <Metric label="Pazaryeri Komisyonu" value={marketplaceCommission} change="+%15 Ortalama" />
        <Metric label="Mutabakat Durumu" value="Uyumlu" change="Tüm işlemler" />
      </div>

      {/* Transactions and Summary Split */}
      <div className="grid gap-5 xl:grid-cols-[1.4fr_.6fr]">
        <Card>
          <CardHeader title="Cüzdan ve İşlem Geçmişi" description="Teslimat, ödeme ve komisyon hareketleri" action={<Button variant="outline"><FileText />Rapor al</Button>} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="border-b bg-muted/35 uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">İşlem ID</th>
                  <th className="px-4 py-3">Taraf</th>
                  <th className="px-4 py-3">Tür</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Tutar</th>
                  <th className="px-4 py-3">Durum</th>
                </tr>
              </thead>
              <tbody>
                {localTransactions.map(t => {
                  const party = t.user?.company?.name || t.user?.courier?.name || "Pazaryeri Komisyonu";
                  const kind = t.type === "DEBIT" ? "Gider (Firma)" : "Gelir (Kurye / Admin)";
                  const date = new Date(t.createdAt).toLocaleDateString("tr-TR");
                  const amountText = `₺${Number(t.amount).toLocaleString("tr-TR")}`;
                  return (
                    <tr key={t.id} className="border-b last:border-0">
                      <td className="px-5 py-4 font-mono text-[11px]">{t.id.substring(0, 8)}...</td>
                      <td className="px-4 py-4 font-semibold">{party}</td>
                      <td className="px-4 py-4 text-muted-foreground">{kind}</td>
                      <td className="px-4 py-4 text-muted-foreground">{date}</td>
                      <td className="px-4 py-4 font-mono font-semibold">{amountText}</td>
                      <td className="px-4 py-4">
                        <Badge tone="positive">{t.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
                {localTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                      Herhangi bir finansal işlem kaydı bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Mutual Summary Card */}
        <Card>
          <CardHeader title="Finansal Mutabakat" description="Dönemsel işlem özeti" />
          <div className="flex flex-col gap-4 p-5">
            <PriceRow label="Şirket Tahsilatları" value={pendingCollection} />
            <PriceRow label="Kurye Hakedişleri" value={courierPayouts} />
            <PriceRow label="Pazaryeri Komisyonu" value={marketplaceCommission} />
            <div className="border-t" />
            <PriceRow label="Toplam Hacim" value={pendingCollection} />
            <Button><HandCoins />Mutabakatı İncele</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function IntelligenceView() {
  return <div className="flex flex-col gap-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex flex-col gap-1"><h1 className="text-balance text-2xl font-semibold tracking-tight">Pazaryeri Analitiği</h1><p className="text-sm text-muted-foreground">Tekstil lojistik ağının arz, talep, bağlılık ve yoğunluk sağlığı.</p></div></div><div className="grid overflow-hidden rounded-xl border bg-card sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{intelligence.map((m,i)=><Metric key={m.label} compact label={m.label} value={m.value} change={m.change} trend={i===2?"flat":"up"} />)}</div><div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]"><Card><CardHeader title="Pazaryeri büyümesi" description="Son 12 ay · tamamlanan tekstil sevkiyatları" action={<Badge tone="positive">+%28,6 Y/Y</Badge>} /><div className="flex h-72 items-end gap-3 p-6">{[32,39,35,48,52,58,62,71,68,79,86,94].map((v,i)=><div key={i} className="group flex h-full flex-1 items-end"><div className="w-full rounded-t bg-primary/75 transition group-hover:bg-primary" style={{height:`${v}%`}} /></div>)}</div></Card><Card><CardHeader title="Ağ yoğunluğu" description="En aktif tekstil koridorları" /><div className="flex flex-col gap-4 p-5">{[["Güngören → Giyimkent","842 iş","%92"],["Güngören → Ambarlı","618 iş","%74"],["Zeytinburnu → İGA","486 iş","%61"],["Merter → Laleli","392 iş","%52"]].map(x=><div key={x[0]} className="flex flex-col gap-2"><div className="flex justify-between text-xs"><strong>{x[0]}</strong><span className="text-muted-foreground">{x[1]}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{width:x[2]}} /></div></div>)}</div></Card></div><div className="grid gap-5 md:grid-cols-3"><ComingSoon title="Lojistik İçgörüleri" description="Ağ davranışındaki değişimleri açıklayan otomatik içgörüler." /><ComingSoon title="ETA Tahmini" description="Rota, terminal ve zaman penceresine göre dinamik varış tahmini." /><ComingSoon title="Fiyat Önerisi" description="Mevcut kural motoruna alternatif fiyat önerileri." /></div></div>;
}

export function IntegrationsView() {
  const integrations = [{name:"Logo ERP",type:"ERP sistemi",state:"Bağlı",icon:Layers3},{name:"Paraşüt",type:"Muhasebe",state:"Bağlı",icon:CircleDollarSign},{name:"WhatsApp Business",type:"İletişim",state:"Kurulum gerekli",icon:MessageSquareText},{name:"Shopify",type:"E-ticaret",state:"Yakında",icon:Boxes},{name:"Kargo şirketleri",type:"Terminal ağı",state:"Yakında",icon:Truck},{name:"REST API",type:"Geliştirici",state:"Aktif",icon:Webhook}];
  return <div className="flex flex-col gap-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex flex-col gap-1"><h1 className="text-balance text-2xl font-semibold tracking-tight">Entegrasyonlar & API</h1><p className="text-sm text-muted-foreground">CarryHub iş akışlarını ERP, muhasebe, iletişim ve mobil kanallara bağlayın.</p></div></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{integrations.map(i=><Card key={i.name} className="p-5"><div className="flex items-start justify-between gap-4"><span className="flex size-10 items-center justify-center rounded-lg bg-muted"><i.icon className="size-5" /></span><Badge tone={i.state==="Bağlı"||i.state==="Aktif"?"positive":i.state==="Yakında"?"neutral":"warning"}>{i.state}</Badge></div><div className="mt-5 flex flex-col gap-1"><h3 className="text-sm font-semibold">{i.name}</h3><p className="text-xs text-muted-foreground">{i.type}</p></div><Button disabled={i.state==="Yakında"} variant="outline" className="mt-5 w-full">Yapılandır <ArrowRight /></Button></Card>)}</div><Card><CardHeader title="Webhook olayları" description="Teslimat ve finans durumlarını kendi sistemlerinize aktarın." action={<Button variant="outline"><Plus />Endpoint ekle</Button>} /><div className="grid gap-3 p-5 md:grid-cols-3">{["delivery.status_changed","courier.assigned","settlement.completed"].map((e,i)=><div key={e} className="rounded-lg border p-4"><div className="flex items-center justify-between"><code className="text-xs font-semibold">{e}</code><Badge tone={i===2?"warning":"positive"}>{i===2?"Bekliyor":"200 OK"}</Badge></div><p className="mt-2 text-[11px] text-muted-foreground">Son çağrı: {i+2} dk önce · 148 ms</p></div>)}</div></Card></div>;
}

export function SecurityView() {
  return <div className="flex flex-col gap-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex flex-col gap-1"><h1 className="text-balance text-2xl font-semibold tracking-tight">Güven, Doğrulama & Yetkiler</h1><p className="text-sm text-muted-foreground">Pazaryeri iletişimi, teslimat kanıtı ve değişiklik izlerinin yönetimi.</p></div></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[{t:"Maskeli iletişim",d:"Telefon numaraları taraflar arasında gizli.",i:KeyRound},{t:"Güvenli mesajlaşma",d:"Teslimata bağlı kayıtlı görüşmeler.",i:MessageSquareText},{t:"QR doğrulama",d:"Alım ve teslimde tekil kod kontrolü.",i:QrCode},{t:"Dijital imza",d:"Teslim alan kişi ve zaman damgası.",i:FileCheck2}].map(x=><Card key={x.t} className="p-5"><x.i className="size-5 text-primary" /><h3 className="mt-4 text-sm font-semibold">{x.t}</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{x.d}</p><Badge tone="positive">Hazır</Badge></Card>)}</div><div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><Card><CardHeader title="Denetim izi" description="Kritik operasyon ve finans değişiklikleri" /><div className="flex flex-col">{[{a:"Ayşe K.",e:"CH-2840 kurye atamasını değiştirdi",t:"13:42 · Operasyon"},{a:"Sistem",e:"FR-128 v4 fiyat kuralını uyguladı",t:"13:39 · Pricing Engine"},{a:"Mehmet D.",e:"Nora Export faturasını onayladı",t:"12:18 · Finans"},{a:"Selin A.",e:"CH-2838 teslimat kanıtı yükledi",t:"11:54 · Mobil"}].map(x=><div key={x.e} className="flex gap-3 border-b p-4 last:border-0"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">{x.a.slice(0,2)}</span><div><p className="text-xs font-semibold">{x.e}</p><small className="text-muted-foreground">{x.a} · {x.t}</small></div></div>)}</div></Card><Card><CardHeader title="Rol yetkileri" description="En az yetki prensibi" /><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="border-b text-muted-foreground"><tr><th className="p-3 text-left">Kaynak</th><th>Ops</th><th>Finans</th><th>Şirket</th></tr></thead><tbody>{[["Kurye atama",1,0,0],["Fiyat kuralları",1,0,0],["Mutabakat",0,1,0],["Teslimat oluştur",1,0,1],["Denetim izi",1,1,0]].map(r=><tr key={String(r[0])} className="border-b last:border-0"><td className="p-3 font-medium">{r[0]}</td>{r.slice(1).map((v,i)=><td key={i} className="text-center">{v?<Check className="mx-auto size-4 text-primary" />:<span className="text-muted-foreground">—</span>}</td>)}</tr>)}</tbody></table></div></Card></div></div>;
}

export function Field({ label, value }: { label: string; value: string }) { return <label className="flex flex-col gap-1.5 text-xs font-medium"><span className="text-muted-foreground">{label}</span><input defaultValue={value} className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary" /></label>; }
export function PriceRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4"><strong className="text-xs">{label}</strong><strong className="font-mono text-sm">{value}</strong></div>; }

export function DeliveryDrawer({ delivery, close }: { delivery: any; close: () => void }) {
  const [isPoDOpen, setIsPoDOpen] = useState(false);

  const companyName = delivery.company?.name || delivery.company || "Bilinmeyen Firma";
  const courierName = delivery.courier?.name || delivery.courier || "Atama Bekliyor";
  const cargoText = delivery.packageType || delivery.cargo || "Kargo";
  const routeText = delivery.route || `${delivery.pickupAddress} → ${delivery.dropoffAddress}`;
  const priceText = typeof delivery.price === "string" ? delivery.price : `₺${Number(delivery.price).toLocaleString("tr-TR")}`;
  const unitsText = delivery.units || "Standart Paket";
  const vehicleText = delivery.vehicle || "Motor";
  const serviceText = delivery.service || "Standart";
  const etaText = delivery.eta || "Hesaplanıyor";

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30" onClick={close}>
        <aside onClick={e=>e.stopPropagation()} className="h-full w-full max-w-xl overflow-y-auto border-l bg-background shadow-2xl">
          <div className="sticky top-0 flex items-center justify-between border-b bg-background/95 p-5">
            <div>
              <span className="font-mono text-xs text-muted-foreground">{delivery.id}</span>
              <h2 className="text-lg font-semibold">{routeText}</h2>
            </div>
            <Button variant="ghost" onClick={close}><X /></Button>
          </div>
          <div className="flex flex-col gap-5 p-5">
            <div className="flex items-center justify-between">
              <StatusBadge status={delivery.status} />
              <span className="text-xs font-semibold">ETA {etaText}</span>
            </div>
            <MiniMap active={3} />
            <Card>
              <CardHeader title="Tekstil yükü" />
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <Info label="Şirket" value={companyName} />
                <Info label="Yük" value={cargoText} />
                <Info label="Kapasite" value={unitsText} />
                <Info label="Araç" value={vehicleText} />
                <Info label="Hizmet" value={serviceText} />
                <Info label="Kurye" value={courierName} />
                {delivery.receiverName && (
                  <Info label="Teslim Alan (PoD)" value={delivery.receiverName} />
                )}
              </div>
            </Card>
            <Card>
              <CardHeader title="Fiyat özeti" description="Uygulanan kural: FR-128 v4" />
              <div className="flex flex-col gap-3 p-5">
                <PriceRow label="Müşteri Fiyatı" value={priceText} />
                <PriceRow label="Kurye Kazancı" value={priceText} />
                <PriceRow label="Pazaryeri Komisyonu" value="₺0 · %0" />
                <Button variant="outline">Fiyat dökümünü aç <ChevronDown /></Button>
              </div>
            </Card>
            <Card>
              <CardHeader title="Teslimat güvenliği" />
              <div className="grid gap-3 p-5 sm:grid-cols-2">
                <Button variant="outline"><MessageSquareText />Maskeli mesaj</Button>
                <Button variant="outline"><QrCode />QR doğrulama</Button>
                <Button variant="outline"><FileCheck2 />Teslimat kanıtı</Button>
                <Button variant="outline"><History />Aktivite kaydı</Button>
              </div>
            </Card>
            {delivery.status !== "DELIVERED" && delivery.status !== "CANCELLED" && delivery.status === "ASSIGNED" && (
              <Card>
                <CardHeader title="Operasyon Kontrolü" description="Kurye yükü teslim ettikten sonra işlemi kapatın." />
                <div className="p-5">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold" onClick={() => setIsPoDOpen(true)}>
                    <Check />Teslim Edildi İşaretle
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </aside>
      </div>
      <PoDModal
        isOpen={isPoDOpen}
        onClose={() => setIsPoDOpen(false)}
        onSubmit={async (receiverName) => {
          setIsPoDOpen(false);
          const res = await updateDeliveryStatus(delivery.id, "DELIVERED", receiverName);
          if (res.success) {
            alert("Teslimat başarıyla tamamlandı ve mutabakat işlemleri yapıldı!");
            close();
          } else {
            alert(`Hata: ${res.error}`);
          }
        }}
      />
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div><span className="block text-[11px] text-muted-foreground">{label}</span><strong className="text-xs">{value}</strong></div>; }

export function PoDModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (receiverName: string) => void;
}) {
  const [receiverName, setReceiverName] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-card p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Teslimat Kapatma (PoD)</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground">Teslim Alan Kişi</label>
          <input
            autoFocus
            type="text"
            placeholder="Ad Soyad giriniz..."
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border bg-background text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary transition"
          />
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-xl border hover:bg-muted text-xs font-bold transition text-muted-foreground hover:text-foreground"
          >
            Vazgeç
          </button>
          <button
            type="button"
            disabled={!receiverName.trim()}
            onClick={() => onSubmit(receiverName)}
            className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/30 text-white text-xs font-bold transition shadow-md"
          >
            Teslimatı Tamamla
          </button>
        </div>
      </div>
    </div>
  );
}
