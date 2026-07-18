export type Delivery = {
  id: string; company: string; route: string; cargo: string; units: string;
  vehicle: string; price: string; courier: string; status: string; eta: string;
  risk?: boolean; batch?: string; service: string;
};

export const deliveries: Delivery[] = [
  { id: "CH-2847", company: "Özdenim Tekstil San. ve Tic. A.Ş.", route: "Mehmet Nesih Özmen, Güngören → Giyimkent, Esenler", cargo: "36 koli yıkamalı denim pantolon", units: "428 kg · 4,6 m³", vehicle: "Panelvan", price: "₺2.680", courier: "Emre Karaca", status: "Yolda", eta: "14:25", service: "Aynı Gün" },
  { id: "CH-2846", company: "Güneşli Dokuma Ltd. Şti.", route: "15 Temmuz Mah., Bağcılar → Ambarlı Limanı", cargo: "18 rulo döşemelik dokuma kumaş", units: "612 kg · 7,2 m³", vehicle: "Kamyonet", price: "₺3.860", courier: "Atama bekliyor", status: "Kurye Aranıyor", eta: "15:10", risk: true, service: "İhracat Terminali" },
  { id: "CH-2845", company: "Merter Düğme & Aksesuar", route: "Keresteciler Sitesi, Merter → Çırpıcı, Zeytinburnu", cargo: "12 koli düğme, fermuar ve tela", units: "146 kg · 1,4 m³", vehicle: "Doblo", price: "₺1.340", courier: "Can Özdemir", status: "Alımda", eta: "13:55", service: "Ekspres" },
  { id: "CH-2844", company: "Rota Hazır Giyim Dış Ticaret", route: "Davutpaşa, Zeytinburnu → THY Kargo, İGA", cargo: "48 koli askılı ihracat konfeksiyonu", units: "584 kg · 8,1 m³", vehicle: "Kapalı Kasa Kamyonet", price: "₺5.240", courier: "Selin Aras", status: "Gecikiyor", eta: "+18 dk", risk: true, service: "Uçak Kargo" },
  { id: "CH-2843", company: "Şirin Örme Kumaş", route: "Sanayi Mah., Güngören → Yenibosna Kargo Merkezi", cargo: "22 çuval penye ve ribana kumaş", units: "318 kg · 3,8 m³", vehicle: "Panelvan", price: "₺2.320", courier: "Yusuf Tekin", status: "Teslim Edildi", eta: "12:42", batch: "B-104", service: "Aynı Gün" },
  { id: "CH-2842", company: "Bağcılar Moda Tekstil", route: "Mahmutbey, Bağcılar → Tekstilkent, Esenler", cargo: "64 askılı abiye elbise", units: "192 kg · 5,9 m³", vehicle: "Askı Aparatlı Panelvan", price: "₺2.760", courier: "Burak Yılmaz", status: "Kurye Atandı", eta: "15:35", batch: "B-105", service: "Hassas Taşıma" },
  { id: "CH-2841", company: "Akset Etiket ve Dar Dokuma", route: "Tozkoparan, Güngören → Yenidoğan, Bayrampaşa", cargo: "20 koli dokuma etiket ve lastik", units: "238 kg · 2,1 m³", vehicle: "Panelvan", price: "₺1.780", courier: "Özgür Demir", status: "Talep Alındı", eta: "16:20", service: "Standart" },
];

export const priceRules = [
  { name: "Merter → Zeytinburnu Hafif Ticari", conditions: "Aksesuar kolisi · 0–200 kg · Ekspres", minimum: "₺1.100", customer: "₺1.340", payout: "₺1.139", commission: "%15", status: "Aktif" },
  { name: "Güngören → Esenler Panelvan", conditions: "Hazır giyim · 0–500 kg · Aynı Gün", minimum: "₺2.050", customer: "₺2.680", payout: "₺2.278", commission: "%15", status: "Aktif" },
  { name: "Zeytinburnu → İGA İhracat", conditions: "Askılı konfeksiyon · 0–700 kg · Uçak Kargo", minimum: "₺4.200", customer: "₺5.240", payout: "₺4.349", commission: "%17", status: "Aktif" },
  { name: "Bağcılar → Ambarlı Kamyonet", conditions: "Kumaş rulosu · Liman teslimi · Yükleme desteği", minimum: "₺3.150", customer: "₺3.860", payout: "₺3.242", commission: "%16", status: "Aktif" },
];

export const transactions = [
  { id: "TRX-98124", party: "Özdenim Tekstil A.Ş.", kind: "Teslimat tahsilatı · CH-2847", amount: "+₺2.680", date: "18 Tem, 13:48", status: "Tamamlandı" },
  { id: "TRX-98123", party: "Emre Karaca", kind: "Kurye hakedişi · CH-2847", amount: "-₺2.278", date: "18 Tem, 13:47", status: "Bekliyor" },
  { id: "TRX-98122", party: "Rota Hazır Giyim", kind: "Haftalık cari mutabakat", amount: "+₺24.860", date: "18 Tem, 11:20", status: "Tamamlandı" },
  { id: "TRX-98121", party: "Selin Aras", kind: "Kurye ödemesi · 6 teslimat", amount: "-₺9.420", date: "17 Tem, 18:00", status: "Tamamlandı" },
  { id: "TRX-98120", party: "Merter Düğme & Aksesuar", kind: "E-fatura · Temmuz dönemi", amount: "+₺12.780", date: "17 Tem, 16:35", status: "Bekliyor" },
];

export const intelligence = [
  { label: "Aktif tekstil firması", value: "384", change: "+%12,4" },
  { label: "Aktif kurye", value: "168", change: "+%8,1" },
  { label: "Arz / Talep", value: "1,18", change: "Dengeli" },
  { label: "Ort. yanıt", value: "2 dk 14 sn", change: "−18 sn" },
  { label: "Kurye kullanımı", value: "%76", change: "+4,2 puan" },
  { label: "Tekrar sipariş", value: "%68", change: "+3,8 puan" },
];
