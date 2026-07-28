"use server";

import prisma from "@/lib/prisma";

export async function getOpsDashboardStats() {
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // Tüm delivery'leri çek
    const allDeliveries = await prisma.delivery.findMany({
      include: { company: true, courier: true },
      orderBy: { createdAt: "desc" },
    });

    // Metric hesapları
    const activeDeliveries = allDeliveries.filter((d) =>
      ["PENDING", "ASSIGNED", "IN_TRANSIT"].includes(d.status)
    );
    const pendingCourierCount = allDeliveries.filter(
      (d) => d.status === "PENDING"
    ).length;
    const inTransitCount = allDeliveries.filter(
      (d) => d.status === "IN_TRANSIT"
    ).length;

    // Bugün oluşturulan delivery'ler
    const todayDeliveries = allDeliveries.filter(
      (d) => d.createdAt >= startOfDay
    );
    const todayVolume = todayDeliveries.reduce(
      (sum, d) => sum + Number(d.finalPrice),
      0
    );

    // Geciken iş: PENDING/ASSIGNED/IN_TRANSIT ve 2+ saat geçmiş
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const overdueDeliveries = allDeliveries.filter(
      (d) =>
        ["PENDING", "ASSIGNED", "IN_TRANSIT"].includes(d.status) &&
        d.createdAt < twoHoursAgo
    );

    // Aktif kurye sayısı
    const activeCourierCount = await prisma.courier.count({
      where: { isAvailable: true },
    });
    const totalCourierCount = await prisma.courier.count();

    // Dispatch board için status bazlı gruplama
    const pendingDeliveries = allDeliveries.filter(
      (d) => d.status === "PENDING"
    );
    const assignedDeliveries = allDeliveries.filter(
      (d) => d.status === "ASSIGNED"
    );

    // Müdahale kuyruğu: PENDING ve 1+ saat geçmiş (risk)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const riskDeliveries = allDeliveries.filter(
      (d) =>
        d.status === "PENDING" && d.createdAt < oneHourAgo
    );

    // Manuel atama için müsait kuryeler
    const availableCouriers = await prisma.courier.findMany({
      where: { isAvailable: true },
      take: 3,
    });

    // Delivery'leri serialize et (client-safe)
    const serializedDeliveries = allDeliveries.map((d) => ({
      id: d.id.slice(0, 8).toUpperCase(),
      company: d.company?.name || "Bilinmeyen Firma",
      route: `${d.pickupAddress} → ${d.dropoffAddress}`,
      cargo: d.packageType,
      units: `${Number(d.price).toFixed(0)} kg`,
      vehicle: "—",
      price: `₺${Number(d.finalPrice).toLocaleString("tr-TR")}`,
      courier: d.courier?.name || "Atama bekliyor",
      status: statusLabel(d.status),
      eta: "—",
      risk: riskDeliveries.some((r) => r.id === d.id),
    }));

    return {
      success: true,
      metrics: {
        activeCount: activeDeliveries.length,
        pendingCourierCount,
        overdueCount: overdueDeliveries.length,
        slaRate: `%${activeDeliveries.length > 0
            ? ((activeDeliveries.length - overdueDeliveries.length) / activeDeliveries.length * 100).toFixed(1)
            : "100"
          } SLA`,
        activeCourierCount,
        totalCourierCount,
        courierUtilization: totalCourierCount > 0
          ? `%${Math.round((activeCourierCount / totalCourierCount) * 100)} kullanım`
          : "%0 kullanım",
        todayVolume: `₺${todayVolume.toLocaleString("tr-TR")}`,
        todayCount: todayDeliveries.length,
        pendingCount: pendingDeliveries.length,
        assignedCount: assignedDeliveries.length,
        inTransitCount,
      },
      deliveries: serializedDeliveries,
      availableCouriers: availableCouriers.map((c) => ({
        id: c.id,
        name: c.name,
        vehicleType: c.vehicleType,
      })),
    };
  } catch (error: any) {
    console.error("Error fetching ops dashboard stats:", error);
    return {
      success: false,
      error: error.message,
      metrics: null,
      deliveries: [],
      availableCouriers: [],
    };
  }
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Talep Alındı",
    ASSIGNED: "Kurye Atandı",
    IN_TRANSIT: "Yolda",
    DELIVERED: "Teslim Edildi",
    CANCELLED: "İptal",
  };
  return labels[status] || status;
}
