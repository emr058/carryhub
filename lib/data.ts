export type Delivery = {
  id: string; company: string; route: string; cargo: string; units: string;
  vehicle: string; price: string; courier: string; status: string; eta: string;
  risk?: boolean; batch?: string; service: string;
};

export const deliveries: Delivery[] = [
  { id: "CH-2841", company: "Mavi Çizgi Tekstil", route: "Merter → İkitelli", cargo: "24 koli hazır giyim", units: "286 kg · 3,2 m³", vehicle: "Panelvan", price: "₺2.480", courier: "Emre Kaya", status: "Yolda", eta: "14:25", service: "Aynı Gün" },
  { id: "CH-2840", company: "Akın Kumaş", route: "Güngören → Ambarlı", cargo: "12 rulo denim kumaş", units: "418 kg · 4,8 m³", vehicle: "Kamyonet", price: "₺3.260", courier: "Atama bekliyor", status: "Kurye Aranıyor", eta: "15:10", risk: true, service: "Terminal" },
  { id: "CH-2839", company: "Lale Aksesuar", route: "Merter → Laleli", cargo: "8 çuval tekstil aksesuarı", units: "94 kg · 1,1 m³", vehicle: "Motosiklet", price: "₺1.180", courier: "Can Özdemir", status: "Alımda", eta: "13:55", service: "Ekspres" },
  { id: "CH-2838", company: "Nora Export", route: "Zeytinburnu → İGA Kargo", cargo: "42 koli ihracat numunesi", units: "516 kg · 6,4 m³", vehicle: "Kamyonet", price: "₺4.890", courier: "Selin Aras", status: "Gecikiyor", eta: "+18 dk", risk: true, service: "İhracat" },
  { id: "CH-2837", company: "Form Örme", route: "Merter → Yenibosna", cargo: "18 çuval örme kumaş", units: "224 kg · 2,6 m³", vehicle: "Panelvan", price: "₺2.140", courier: "Yusuf Tekin", status: "Teslim Edildi", eta: "12:42", batch: "B-104", service: "Aynı Gün" },
];

export const priceRules = [
  { name: "Merter → İkitelli Panelvan", conditions: "Hazır giyim · 0–350 kg · Aynı Gün", minimum: "₺1.850", customer: "₺2.480", payout: "₺2.108", commission: "%15", status: "Aktif" },
  { name: "Merter → İGA İhracat", conditions: "Koli · 0–700 kg · İhracat", minimum: "₺3.900", customer: "₺4.890", payout: "₺4.058", commission: "%17", status: "Aktif" },
  { name: "Güngören → Ambarlı Kamyonet", conditions: "Kumaş rulosu · Terminal · Forklift", minimum: "₺2.700", customer: "₺3.260", payout: "₺2.738", commission: "%16", status: "Aktif" },
];

export const transactions = [
  { id: "TRX-98114", party: "Mavi Çizgi Tekstil", kind: "Teslimat tahsilatı", amount: "+₺2.480", date: "18 Tem, 13:48", status: "Tamamlandı" },
  { id: "TRX-98113", party: "Emre Kaya", kind: "Kurye hakedişi", amount: "-₺2.108", date: "18 Tem, 13:47", status: "Bekliyor" },
  { id: "TRX-98112", party: "Nora Export", kind: "Haftalık mutabakat", amount: "+₺18.740", date: "18 Tem, 11:20", status: "Tamamlandı" },
  { id: "TRX-98111", party: "Selin Aras", kind: "Kurye ödemesi", amount: "-₺7.280", date: "17 Tem, 18:00", status: "Tamamlandı" },
];

export const intelligence = [
  { label: "Aktif şirket", value: "384", change: "+%12,4" },
  { label: "Aktif kurye", value: "168", change: "+%8,1" },
  { label: "Arz / Talep", value: "1,18", change: "Dengeli" },
  { label: "Ort. yanıt", value: "2d 14sn", change: "−18 sn" },
  { label: "Kurye kullanımı", value: "%76", change: "+4,2 puan" },
  { label: "Tekrar şirket", value: "%68", change: "+3,8 puan" },
];
