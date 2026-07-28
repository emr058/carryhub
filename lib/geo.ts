// İstanbul koordinat verileri ve geo yardımcıları

// İstanbul Avrupa Yakası sınırları
export const ISTANBUL_CENTER = { lat: 41.015137, lng: 28.97953 } as const;
export const EUROPEAN_SIDE_BOUNDS = {
  north: 41.3,
  south: 40.85,
  east: 29.2,
  west: 28.7,
} as const;

// Önemli tekstil bölgeleri (Avrupa Yakası)
export const ISTANBUL_DISTRICTS = {
  merter: { name: "Merter", lat: 41.0047, lng: 28.8886 },
  gungoren: { name: "Güngören", lat: 41.0125, lng: 28.8803 },
  bagcilar: { name: "Bağcılar", lat: 41.0383, lng: 28.8525 },
  esenler: { name: "Esenler", lat: 41.0433, lng: 28.8761 },
  zeytinburnu: { name: "Zeytinburnu", lat: 40.9925, lng: 28.9042 },
  tekstilkent: { name: "Tekstilkent", lat: 41.0736, lng: 28.8136 },
  giyimkent: { name: "Giyimkent", lat: 41.0536, lng: 28.8236 },
  bayrampasa: { name: "Bayrampaşa", lat: 41.0467, lng: 28.9025 },
  istanbulHavalimani: { name: "İstanbul Havalimanı", lat: 41.2608, lng: 28.7422 },
  ambarlı: { name: "Ambarlı Limanı", lat: 40.9697, lng: 28.6817 },
  yenibosna: { name: "Yenibosna", lat: 40.9981, lng: 28.8375 },
} as const;

export type IstanbulDistrict = keyof typeof ISTANBUL_DISTRICTS;

// Haversine mesafe hesaplama (km cinsinden)
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Dünya yarıçapı (km)
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Mesafeye göre okunabilir etiket
export function distanceLabel(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

// Enlem/boylamı string'den parse et (örn. "41.015137,28.97953")
export function parseCoord(str: string): { lat: number; lng: number } | null {
  const parts = str.split(",").map(Number);
  if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  return { lat: parts[0], lng: parts[1] };
}

// Adresten tahmini koordinat (basit bir lookup — gerçek uygulamada geocode API kullanılır)
export function addressToCoord(address: string): { lat: number; lng: number } | null {
  const lower = address.toLowerCase();

  // İlçe bazlı eşleştirme
  if (lower.includes("merter")) return { lat: 41.0047, lng: 28.8886 };
  if (lower.includes("güngören") || lower.includes("gungoren"))
    return { lat: 41.0125, lng: 28.8803 };
  if (lower.includes("bağcılar") || lower.includes("bagcilar"))
    return { lat: 41.0383, lng: 28.8525 };
  if (lower.includes("esenler")) return { lat: 41.0433, lng: 28.8761 };
  if (lower.includes("zeytinburnu")) return { lat: 40.9925, lng: 28.9042 };
  if (lower.includes("tekstilkent")) return { lat: 41.0736, lng: 28.8136 };
  if (lower.includes("giyimkent")) return { lat: 41.0536, lng: 28.8236 };
  if (lower.includes("bayrampaşa") || lower.includes("bayrampasa"))
    return { lat: 41.0467, lng: 28.9025 };
  if (lower.includes("havalimanı") || lower.includes("havalimani") || lower.includes("i ga") || lower.includes("iga"))
    return { lat: 41.2608, lng: 28.7422 };
  if (lower.includes("ambarlı") || lower.includes("ambarli"))
    return { lat: 40.9697, lng: 28.6817 };
  if (lower.includes("yenibosna")) return { lat: 40.9981, lng: 28.8375 };

  // Varsayılan: Merter merkez
  return { lat: 41.015, lng: 28.93 };
}

// Kuryenin çalışma çemberi (km)
export type CourierRadius = 30 | 50 | 100;

// İstanbul Avrupa Yakası'nda rastgele bir nokta üret
export function randomEuropaPoint(baseLat?: number, baseLng?: number, radiusKm: number = 3): { lat: number; lng: number } {
  const center = baseLat && baseLng ? { lat: baseLat, lng: baseLng } : ISTANBUL_CENTER;
  // 1° ≈ 111km lat, 1° ≈ 85km lng (İstanbul enlemi)
  const latOffset = (Math.random() - 0.5) * (radiusKm / 111) * 2;
  const lngOffset = (Math.random() - 0.5) * (radiusKm / 85) * 2;
  return {
    lat: center.lat + latOffset,
    lng: center.lng + lngOffset,
  };
}
