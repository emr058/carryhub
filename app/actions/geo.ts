"use server";

import prisma from "@/lib/prisma";
import { haversineDistance } from "@/lib/geo";
import { addressToCoord } from "@/lib/geo";

// Tüm işletmelerin konumlarını getir (harita için)
export async function getCompaniesGeo() {
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        defaultAddress: true,
        phone: true,
        district: true,
        lat: true,
        lng: true,
      },
    });

    // Konumu olmayanlara adresten tahmini koordinat ata
    const enriched = companies.map((c) => ({
      ...c,
      lat: c.lat ?? addressToCoord(c.defaultAddress)?.lat ?? 41.015,
      lng: c.lng ?? addressToCoord(c.defaultAddress)?.lng ?? 28.93,
    }));

    return { success: true, companies: enriched };
  } catch (error: any) {
    console.error("Error fetching companies geo:", error);
    return { success: false, error: error.message, companies: [] };
  }
}

// Müsait kuryelerin konumlarını getir
export async function getAvailableCouriersGeo() {
  try {
    const couriers = await prisma.courier.findMany({
      where: { isAvailable: true },
      select: {
        id: true,
        name: true,
        vehicleType: true,
        district: true,
        lat: true,
        lng: true,
        isAvailable: true,
      },
    });

    // Konumu olmayanlara ilçe bazlı tahmini koordinat
    const enriched = couriers.map((c) => {
      let lat = c.lat;
      let lng = c.lng;
      if (lat == null || lng == null) {
        const coords = addressToCoord(c.district || "Merter");
        lat = coords?.lat ?? 41.015;
        lng = coords?.lng ?? 28.93;
      }
      return { ...c, lat, lng };
    });

    return { success: true, couriers: enriched };
  } catch (error: any) {
    console.error("Error fetching couriers geo:", error);
    return { success: false, error: error.message, couriers: [] };
  }
}

// Belirli bir noktaya en yakın kuryeleri bul (çember mantığı)
export async function getNearbyCouriers(
  lat: number,
  lng: number,
  radiusKm: number = 50
) {
  try {
    const couriers = await prisma.courier.findMany({
      where: { isAvailable: true },
      select: {
        id: true,
        name: true,
        vehicleType: true,
        lat: true,
        lng: true,
        district: true,
      },
    });

    const withDistance = couriers
      .map((c) => {
        const coords = addressToCoord(c.district || "Merter");
        const cLat = c.lat ?? coords?.lat ?? 41.015;
        const cLng = c.lng ?? coords?.lng ?? 28.93;
        const distance = haversineDistance(lat, lng, cLat, cLng);
        return { ...c, lat: cLat, lng: cLng, distance: Math.round(distance * 10) / 10 };
      })
      .filter((c) => c.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return { success: true, couriers: withDistance };
  } catch (error: any) {
    console.error("Error finding nearby couriers:", error);
    return { success: false, error: error.message, couriers: [] };
  }
}

// Kurye konum güncelle (canlı takip için)
export async function updateCourierLocation(
  courierId: string,
  lat: number,
  lng: number,
  heading?: number,
  speed?: number
) {
  try {
    // Son konumu güncelle
    await prisma.courier.update({
      where: { id: courierId },
      data: { lat, lng },
    });

    // Konum geçmişine ekle
    await prisma.courierLocation.create({
      data: { courierId, lat, lng, heading, speed },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating courier location:", error);
    return { success: false, error: error.message };
  }
}

// Aktif teslimatların geo bilgisini getir
export async function getActiveDeliveriesGeo() {
  try {
    const deliveries = await prisma.delivery.findMany({
      where: {
        status: { in: ["PENDING", "ASSIGNED", "IN_TRANSIT"] },
      },
      include: {
        company: { select: { name: true, lat: true, lng: true } },
        courier: { select: { name: true, vehicleType: true, lat: true, lng: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = deliveries.map((d) => {
      const pickupCoord = addressToCoord(d.pickupAddress);
      const dropoffCoord = addressToCoord(d.dropoffAddress);

      return {
        id: d.id.slice(0, 8).toUpperCase(),
        status: d.status,
        company: d.company.name,
        courier: d.courier?.name || null,
        pickupAddress: d.pickupAddress,
        dropoffAddress: d.dropoffAddress,
        pickupLat: d.pickupLat ?? pickupCoord?.lat ?? 41.015,
        pickupLng: d.pickupLng ?? pickupCoord?.lng ?? 28.93,
        dropoffLat: d.dropoffLat ?? dropoffCoord?.lat ?? 41.015,
        dropoffLng: d.dropoffLng ?? dropoffCoord?.lng ?? 28.93,
        courierLat: d.courier?.lat,
        courierLng: d.courier?.lng,
      };
    });

    return { success: true, deliveries: mapped };
  } catch (error: any) {
    console.error("Error fetching active deliveries geo:", error);
    return { success: false, error: error.message, deliveries: [] };
  }
}
