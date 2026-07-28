"use server";

import prisma from "@/lib/prisma";
import { getAuthEntity } from "@/lib/auth-entity";

export async function getOpsDashboardStats() {
  try {
    // 🔐 Sadece ADMIN erişebilir
    const { role, error: authErr } = await getAuthEntity();
    if (authErr || role !== "ADMIN") {
      return {
        success: false,
        error: "Bu sayfaya erişim yetkiniz yok.",
        metrics: null,
        deliveries: [],
        availableCouriers: [],
      };
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // 📊 DB-level sorgular — JS filtering yok
    const [activeCount, pendingCount, inTransitCount, assignedCount, todayCount, todayVolume, overdueCount, riskCount] =
      await Promise.all([
        prisma.delivery.count({ where: { status: { in: ["PENDING", "ASSIGNED", "IN_TRANSIT"] } } }),
        prisma.delivery.count({ where: { status: "PENDING" } }),
        prisma.delivery.count({ where: { status: "IN_TRANSIT" } }),
        prisma.delivery.count({ where: { status: "ASSIGNED" } }),
        prisma.delivery.count({ where: { createdAt: { gte: startOfDay } } }),
        prisma.delivery.aggregate({
          _sum: { finalPrice: true },
          where: { createdAt: { gte: startOfDay } },
        }),
        prisma.delivery.count({
          where: {
            status: { in: ["PENDING", "ASSIGNED", "IN_TRANSIT"] },
            createdAt: { lt: twoHoursAgo },
          },
        }),
        prisma.delivery.count({
          where: {
            status: "PENDING",
            createdAt: { lt: oneHourAgo },
          },
        }),
      ]);

    const todayVolumeVal = Number(todayVolume._sum.finalPrice || 0);

    // 🚛 Son 50 delivery (dispatch board)
    const recentDeliveries = await prisma.delivery.findMany({
      include: { company: true, courier: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // 👥 Müsait kuryeler
    const [activeCouriers, totalCouriers, availableCouriers] = await Promise.all([
      prisma.courier.count({ where: { isAvailable: true } }),
      prisma.courier.count(),
      prisma.courier.findMany({
        where: { isAvailable: true },
        take: 3,
      }),
    ]);

    const serializedDeliveries = recentDeliveries.map((d) => ({
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
      risk: ["PENDING"].includes(d.status) && d.createdAt < oneHourAgo,
    }));

    const slaRate =
      activeCount > 0
        ? `%${((activeCount - overdueCount) / activeCount * 100).toFixed(1)} SLA`
        : "%100 SLA";

    const courierUtilization =
      totalCouriers > 0
        ? `%${Math.round((activeCouriers / totalCouriers) * 100)} kullanım`
        : "%0 kullanım";

    return {
      success: true,
      metrics: {
        activeCount,
        pendingCourierCount: pendingCount,
        overdueCount,
        slaRate,
        activeCourierCount: activeCouriers,
        totalCourierCount: totalCouriers,
        courierUtilization,
        todayVolume: `₺${todayVolumeVal.toLocaleString("tr-TR")}`,
        todayCount,
        pendingCount,
        assignedCount,
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
