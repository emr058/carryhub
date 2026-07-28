"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import { haversineDistance, ISTANBUL_CENTER } from "@/lib/geo";
import type { MapMarker, MapRoute } from "./harita-view";

// Dynamic import — Leaflet SSR'da çalışmaz
const HaritaView = dynamic(() => import("./harita-view"), { ssr: false });

const TEXTILE_DISTRICTS = [
  { name: "Merter", lat: 41.0047, lng: 28.8886, type: "üretim" },
  { name: "Güngören", lat: 41.0125, lng: 28.8803, type: "üretim" },
  { name: "Tekstilkent", lat: 41.0736, lng: 28.8136, type: "toplu" },
  { name: "Giyimkent", lat: 41.0536, lng: 28.8236, type: "toplu" },
  { name: "Bağcılar", lat: 41.0383, lng: 28.8525, type: "lojistik" },
  { name: "Zeytinburnu", lat: 40.9925, lng: 28.9042, type: "lojistik" },
  { name: "Esenler", lat: 41.0433, lng: 28.8761, type: "dağıtım" },
  { name: "Bayrampaşa", lat: 41.0467, lng: 28.9025, type: "dağıtım" },
];

export default function IstanbulLandingMap() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [routes, setRoutes] = useState<MapRoute[]>([]);
  const [animPhase, setAnimPhase] = useState(0);

  // District markers
  useEffect(() => {
    const districtMarkers: MapMarker[] = TEXTILE_DISTRICTS.map((d, i) => ({
      id: `district-${i}`,
      lat: d.lat,
      lng: d.lng,
      label: "",
      color: "#087f6d",
      type: "company" as const,
      popup: `<strong>${d.name}</strong><br/><span style="color:#666;font-size:11px;">${d.type} bölgesi</span>`,
      pulse: false,
    }));
    setMarkers(districtMarkers);
  }, []);

  // Animated route — cycles through districts
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimPhase((p) => (p + 1) % TEXTILE_DISTRICTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Update route when anim phase changes
  useEffect(() => {
    const from = TEXTILE_DISTRICTS[0]; // always start from Merter
    const to = TEXTILE_DISTRICTS[animPhase] || from;

    setRoutes([
      {
        from: { lat: from.lat, lng: from.lng },
        to: { lat: to.lat, lng: to.lng },
        color: "#10b981",
        label: `${from.name} → ${to.name}`,
        animated: true,
      },
    ]);
  }, [animPhase]);

  return (
    <div className="relative w-full h-full">
      <HaritaView
        center={[ISTANBUL_CENTER.lat, ISTANBUL_CENTER.lng]}
        zoom={12}
        markers={markers}
        routes={routes}
        interactive={false}
        className="w-full h-full"
        style={{ minHeight: "100%", borderRadius: 0, border: "none" }}
      />
      {/* Map overlay info */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent flex items-end px-5 pb-3">
        <div className="flex items-center gap-3 text-[10px] text-white/80">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-green-400 animate-pulse" />
            {TEXTILE_DISTRICTS[animPhase].name} bölgesine teslimat
          </span>
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-blue-400" />
            Canlı takip
          </span>
        </div>
      </div>
    </div>
  );
}
