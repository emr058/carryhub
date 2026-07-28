"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getActiveDeliveriesGeo, getCompaniesGeo, getAvailableCouriersGeo } from "@/app/actions/geo";
import type { MapMarker, MapRoute } from "./harita-view";

const HaritaView = dynamic(() => import("./harita-view"), { ssr: false });

interface OpsHaritaProps {
  className?: string;
}

export default function OpsHarita({ className }: OpsHaritaProps) {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [routes, setRoutes] = useState<MapRoute[]>([]);
  const [circles, setCircles] = useState<any[]>([]);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    async function load() {
      const [geoRes, compRes, courRes] = await Promise.all([
        getActiveDeliveriesGeo(),
        getCompaniesGeo(),
        getAvailableCouriersGeo(),
      ]);

      const newMarkers: MapMarker[] = [];
      const newRoutes: MapRoute[] = [];
      const newCircles: any[] = [];

      // Company markers
      if (compRes.success) {
        compRes.companies.forEach((c) => {
          newMarkers.push({
            id: `company-${c.id}`,
            lat: c.lat,
            lng: c.lng,
            label: c.name.slice(0, 2),
            color: "#087f6d",
            type: "company",
            popup: `<strong>${c.name}</strong><br/>${c.district || ""}`,
          });
        });
      }

      // Available couriers
      if (courRes.success) {
        courRes.couriers.forEach((c) => {
          newMarkers.push({
            id: `courier-${c.id}`,
            lat: c.lat,
            lng: c.lng,
            label: c.name.slice(0, 1),
            color: "#f59e0b",
            type: "courier",
            popup: `<strong>${c.name}</strong><br/>${c.vehicleType} · Müsait`,
            pulse: true,
          });
        });

        // Radius circles around first 3 couriers
        courRes.couriers.slice(0, 3).forEach((c) => {
          newCircles.push({
            lat: c.lat,
            lng: c.lng,
            radiusKm: 30,
            color: "#f59e0b",
            label: "30 km",
          });
        });
      }

      // Active delivery routes
      if (geoRes.success) {
        geoRes.deliveries.forEach((d) => {
          newMarkers.push({
            id: `pickup-${d.id}`,
            lat: d.pickupLat,
            lng: d.pickupLng,
            label: "📍",
            color: "#10b981",
            type: "pickup",
            popup: `<strong>${d.company}</strong><br/>Alış: ${d.pickupAddress}`,
          });
          newMarkers.push({
            id: `dropoff-${d.id}`,
            lat: d.dropoffLat,
            lng: d.dropoffLng,
            label: "🏁",
            color: "#ef4444",
            type: "dropoff",
            popup: `<strong>${d.company}</strong><br/>Teslimat: ${d.dropoffAddress}`,
          });
          newRoutes.push({
            from: { lat: d.pickupLat, lng: d.pickupLng },
            to: { lat: d.dropoffLat, lng: d.dropoffLng },
            color: d.status === "IN_TRANSIT" ? "#f59e0b" : "#087f6d",
            dashed: d.status === "PENDING",
            animated: d.status === "IN_TRANSIT",
            label: `${d.company}: ${d.id}`,
          });
        });
      }

      setMarkers(newMarkers);
      setRoutes(newRoutes);
      setCircles(newCircles);
      setSummary(
        `${compRes.companies.length} firma · ${courRes.couriers.length} müsait kurye · ${geoRes.deliveries.length} aktif teslimat`
      );
    }

    load();

    // Auto-refresh every 30s
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <HaritaView
        center={[41.015137, 28.93]}
        zoom={12}
        markers={markers}
        routes={routes}
        radiusCircles={circles}
        className={className || "rounded-xl border"}
        style={{ minHeight: 400, height: "100%" }}
        onMarkerClick={(m) => {
          // Could open a side panel
        }}
      />
      <div className="absolute bottom-3 left-3 rounded-lg border bg-card/90 px-3 py-2 text-xs shadow-sm backdrop-blur">
        <span className="font-medium">{summary}</span>
      </div>
    </div>
  );
}
