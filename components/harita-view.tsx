"use client";

import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet varsayılan ikon sorununu çöz
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Özel ikonlar
export function createMarkerIcon(
  color: string = "#087f6d",
  label?: string
): L.DivIcon {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background:${color};color:white;width:32px;height:32px;
      border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-size:12px;font-weight:700;border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    ">${label || "●"}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

export function createPulsingIcon(color: string = "#087f6d"): L.DivIcon {
  return L.divIcon({
    className: "pulsing-marker",
    html: `<div style="
      position:relative;width:24px;height:24px;
    ">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:${color};opacity:0.4;
        animation:pulse 1.5s ease-in-out infinite;
      "></div>
      <div style="
        position:absolute;inset:4px;border-radius:50%;
        background:${color};border:2px solid white;
      "></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// Marker türleri
export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  color?: string;
  type: "courier" | "company" | "pickup" | "dropoff" | "delivery";
  popup?: string;
  pulse?: boolean;
}

export interface MapRoute {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  color?: string;
  label?: string;
  dashed?: boolean;
  animated?: boolean;
}

interface HaritaViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  routes?: MapRoute[];
  className?: string;
  style?: React.CSSProperties;
  interactive?: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
  radiusCircles?: { lat: number; lng: number; radiusKm: number; color?: string; label?: string }[];
  maxBounds?: [[number, number], [number, number]];
}

export default function HaritaView({
  center = [41.015137, 28.97953],
  zoom = 12,
  markers = [],
  routes = [],
  className = "",
  style,
  interactive = true,
  onMarkerClick,
  radiusCircles = [],
  maxBounds = [
    [40.8, 28.5],
    [41.4, 29.5],
  ],
}: HaritaViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);

  // Haritayı başlat
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: interactive,
      scrollWheelZoom: interactive,
      dragging: interactive,
      attributionControl: false,
      maxBounds,
      maxBoundsViscosity: 1.0,
    });

    // OpenStreetMap tile layer (ücretsiz)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      minZoom: 10,
    }).addTo(map);

    mapRef.current = map;

    // Animasyonlu marker'lar için CSS
    if (!document.getElementById("harita-view-styles")) {
      const style = document.createElement("style");
      style.id = "harita-view-styles";
      style.textContent = `
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.5); opacity: 0.1; }
        }
        @keyframes marker-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animated-marker {
          animation: marker-bounce 1.2s ease-in-out infinite;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          font-size: 13px;
        }
        .leaflet-popup-content {
          margin: 8px 12px;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Merkez/zoom değişince
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center[0], center[1], zoom]);

  // Marker'ları güncelle
  useEffect(() => {
    if (!mapRef.current) return;

    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    } else {
      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    const layer = markersLayerRef.current;

    markers.forEach((m) => {
      const icon = m.pulse
        ? createPulsingIcon(m.color)
        : createMarkerIcon(m.color, m.label);
      const marker = L.marker([m.lat, m.lng], { icon });

      if (m.popup) {
        marker.bindPopup(m.popup);
      }

      if (onMarkerClick) {
        marker.on("click", () => onMarkerClick(m));
      }

      marker.addTo(layer);
    });
  }, [markers, onMarkerClick]);

  // Rotaları güncelle
  useEffect(() => {
    if (!mapRef.current) return;

    if (routesLayerRef.current) {
      routesLayerRef.current.clearLayers();
    } else {
      routesLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    const layer = routesLayerRef.current;

    routes.forEach((r) => {
      const color = r.color || "#087f6d";
      const points: [number, number][] = [
        [r.from.lat, r.from.lng],
        [r.to.lat, r.to.lng],
      ];

      // Rota polyline
      const polyline = L.polyline(points, {
        color,
        weight: 3,
        opacity: 0.7,
        dashArray: r.dashed ? "8, 8" : undefined,
      }).addTo(layer);

      if (r.animated) {
        // Animasyonlu nokta (kurye hareketi simülasyonu)
        let progress = 0;
        const animMarker = L.marker([r.from.lat, r.from.lng], {
          icon: createPulsingIcon(color),
        }).addTo(layer);

        const interval = setInterval(() => {
          progress = (progress + 0.02) % 1;
          const midLat = r.from.lat + (r.to.lat - r.from.lat) * progress;
          const midLng = r.from.lng + (r.to.lng - r.from.lng) * progress;
          animMarker.setLatLng([midLat, midLng]);
        }, 100);

        // cleanup on unmount
        (polyline as any)._animInterval = interval;
      }

      // Başlangıç ve bitiş marker'ları
      L.marker([r.from.lat, r.from.lng], {
        icon: createMarkerIcon("#10b981", "🔵"),
      }).addTo(layer);
      L.marker([r.to.lat, r.to.lng], {
        icon: createMarkerIcon("#ef4444", "🔴"),
      }).addTo(layer);
    });

    return () => {
      routes.forEach((r) => {
        // Temizlik — polyline üzerinden interval'ı bul
      });
    };
  }, [routes]);

  // Çemberleri güncelle
  useEffect(() => {
    if (!mapRef.current) return;

    if (circlesLayerRef.current) {
      circlesLayerRef.current.clearLayers();
    } else {
      circlesLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    const layer = circlesLayerRef.current;

    radiusCircles.forEach((c) => {
      L.circle([c.lat, c.lng], {
        radius: c.radiusKm * 1000,
        color: c.color || "#087f6d",
        fillColor: c.color || "#087f6d",
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: "6, 6",
      })
        .bindTooltip(c.label || `${c.radiusKm} km`, {
          permanent: true,
          direction: "center",
          className: "radius-tooltip",
        })
        .addTo(layer);
    });
  }, [radiusCircles]);

  return (
    <div
      ref={containerRef}
      className={`rounded-xl overflow-hidden border ${className}`}
      style={{ minHeight: 300, height: "100%", ...style }}
    />
  );
}
