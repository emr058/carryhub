"use server";

import prisma from "@/lib/prisma";
import { calculatePrice } from "@/lib/pricing";
import { revalidatePath } from "next/cache";
import { serializeDelivery } from "@/lib/serializers";
import { getAuthEntity } from "@/lib/auth-entity";
import { validateTransition, transitionErrorToMessage } from "@/lib/delivery-state-machine";
import type { DeliveryStatus } from "@/lib/delivery-state-machine";

export async function createDelivery(data: {
  packageType: string;
  pickupAddress: string;
  dropoffAddress: string;
  price: number;
}) {
  try {
    const { entity: company, error } = await getAuthEntity();
    if (!company || error) {
      throw new Error(error || "Firma bulunamadı.");
    }

    const pricing = calculatePrice(data.packageType, data.dropoffAddress);

    const delivery = await prisma.delivery.create({
      data: {
        companyId: (company as any).id,
        pickupAddress: data.pickupAddress,
        dropoffAddress: data.dropoffAddress,
        packageType: data.packageType,
        price: pricing.finalPrice,
        finalPrice: pricing.finalPrice,
        commissionAmount: pricing.commissionAmount,
        status: "PENDING",
      },
    });

    revalidatePath("/company");
    revalidatePath("/ops");
    revalidatePath("/ops/deliveries");
    revalidatePath("/ops/finance");

    return { success: true, delivery: serializeDelivery(delivery) };
  } catch (error: any) {
    console.error("Error creating delivery:", error);
    return { success: false, error: error.message };
  }
}

export async function getDeliveries() {
  try {
    // 🔐 Sadece ADMIN erişebilir
    const { role, error: authErr } = await getAuthEntity();
    if (authErr || role !== "ADMIN") {
      return { success: false, error: "Bu sayfaya erişim yetkiniz yok.", deliveries: [] };
    }

    const deliveries = await prisma.delivery.findMany({
      include: { company: true, courier: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { success: true, deliveries: (deliveries || []).map(serializeDelivery) };
  } catch (error: any) {
    console.error("Error fetching deliveries:", error);
    return { success: false, error: error.message, deliveries: [] };
  }
}

export async function getPendingDeliveries() {
  try {
    // 🔐 Oturum kontrolü
    const { role, error: authErr } = await getAuthEntity();
    if (authErr) {
      return { success: false, error: "Oturum açmanız gerekiyor.", deliveries: [] };
    }

    const deliveries = await prisma.delivery.findMany({
      where: { status: "PENDING" },
      include: { company: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { success: true, deliveries: (deliveries || []).map(serializeDelivery) };
  } catch (error: any) {
    console.error("Error fetching pending deliveries:", error);
    return { success: false, error: error.message, deliveries: [] };
  }
}

export async function acceptDelivery(deliveryId: string) {
  try {
    const { entity: courier, error } = await getAuthEntity();
    if (!courier || error) {
      throw new Error(error || "Kurye bulunamadı.");
    }

    // Validate PENDING → ASSIGNED transition
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
    });
    if (!delivery) {
      throw new Error("Teslimat bulunamadı.");
    }
    const err = validateTransition(delivery.status as DeliveryStatus, "ASSIGNED", "COURIER");
    if (err) {
      throw new Error(transitionErrorToMessage(err));
    }

    const updated = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: "ASSIGNED",
        courierId: (courier as any).id,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/company");
    revalidatePath("/ops");
    revalidatePath("/ops/deliveries");
    revalidatePath("/ops/finance");

    return { success: true, delivery: serializeDelivery(delivery) };
  } catch (error: any) {
    console.error("Error accepting delivery:", error);
    return { success: false, error: error.message };
  }
}

export async function updateDeliveryStatus(
  id: string,
  status: DeliveryStatus,
  receiverName?: string
) {
  try {
    // 🔐 Önce kullanıcıyı al, sonra ownership kontrolü yap
    const { entity: userEntity, role, error: authErr } = await getAuthEntity();
    if (authErr || !userEntity) {
      throw new Error(authErr || "Oturum açmanız gerekiyor.");
    }

    const existing = await prisma.delivery.findUnique({
      where: { id },
      include: {
        company: { include: { user: true } },
        courier: { include: { user: true } },
      },
    });

    if (!existing) {
      throw new Error("Teslimat bulunamadı.");
    }

    // 🔐 Ownership kontrolü:
    // - ADMIN her şeyi yapabilir
    // - COMPANY sadece kendi teslimatlarını güncelleyebilir
    // - COURIER sadece kendine atanmış teslimatları güncelleyebilir
    if (role === "COMPANY") {
      if (existing.company?.userId !== (userEntity as any).userId) {
        throw new Error("Bu teslimatı güncelleme yetkiniz yok.");
      }
    } else if (role === "COURIER") {
      if (existing.courierId !== (userEntity as any).id) {
        throw new Error("Bu teslimat size ait değil.");
      }
    } else if (role !== "ADMIN") {
      throw new Error("Bu işlem için yetkiniz yok.");
    }

    // Validate state transition
    const err = validateTransition(existing.status as DeliveryStatus, status);
    if (err) {
      throw new Error(transitionErrorToMessage(err));
    }

    const updated = await prisma.delivery.update({
      where: { id },
      data: {
        status,
        receiverName: receiverName || null,
      },
    });

    // Auto-create transactions when DELIVERED
    if (status === "DELIVERED") {
      const price = Number(existing.finalPrice);
      const commission = Number(existing.commissionAmount);
      const courierAmount = price - commission;

      await prisma.transaction.create({
        data: {
          amount: price,
          type: "DEBIT",
          status: "COMPLETED",
          deliveryId: id,
          userId: existing.company.userId,
        },
      });

      if (existing.courierId && existing.courier) {
        await prisma.transaction.create({
          data: {
            amount: courierAmount,
            type: "CREDIT",
            status: "COMPLETED",
            deliveryId: id,
            userId: existing.courier.userId,
          },
        });
      }

      await prisma.transaction.create({
        data: {
          amount: commission,
          type: "CREDIT",
          status: "COMPLETED",
          deliveryId: id,
          userId: null,
        },
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/company");
    revalidatePath("/ops");
    revalidatePath("/ops/deliveries");
    revalidatePath("/ops/finance");

    return { success: true, delivery: serializeDelivery(updated) };
  } catch (error: any) {
    console.error("Error updating delivery status:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCompanyAddress(companyId: string, address: string) {
  try {
    // 🔐 Kullanıcıyı al, sadece kendi firmasının adresini değiştirebilsin
    const { entity: userEntity, role, error: authErr } = await getAuthEntity();
    if (authErr || !userEntity) {
      throw new Error(authErr || "Oturum açmanız gerekiyor.");
    }

    // ADMIN her firmanın adresini değiştirebilir
    // COMPANY sadece kendi adresini değiştirebilir
    if (role === "COMPANY") {
      if ((userEntity as any).id !== companyId) {
        throw new Error("Yalnızca kendi firma adresinizi değiştirebilirsiniz.");
      }
    } else if (role !== "ADMIN") {
      throw new Error("Bu işlem için yetkiniz yok.");
    }

    const company = await prisma.company.update({
      where: { id: companyId },
      data: { defaultAddress: address },
    });
    revalidatePath("/company");
    return { success: true, company };
  } catch (error: any) {
    console.error("Error updating company address:", error);
    return { success: false, error: error.message };
  }
}

export async function getCourierDeliveries() {
  try {
    const { entity: courier, error } = await getAuthEntity();
    if (!courier || error) {
      return { success: false, error: error || "Kurye bulunamadı.", deliveries: [], courierId: null };
    }

    const courierId = (courier as any).id;
    const deliveries = await prisma.delivery.findMany({
      where: {
        OR: [
          { status: "PENDING" },
          { status: "ASSIGNED", courierId },
        ],
      },
      include: { company: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return { success: true, deliveries: (deliveries || []).map(serializeDelivery), courierId };
  } catch (error: any) {
    console.error("Error fetching courier deliveries:", error);
    return { success: false, error: error.message, deliveries: [], courierId: null };
  }
}

export async function getCompany() {
  try {
    const { entity: company, error } = await getAuthEntity();
    if (!company || error) {
      return { success: false, error: error || "Firma bulunamadı.", company: null };
    }
    return { success: true, company };
  } catch (error: any) {
    console.error("Error fetching company:", error);
    return { success: false, error: error.message, company: null };
  }
}

export async function getCompanyDeliveries() {
  try {
    const { entity: company, error } = await getAuthEntity();
    if (!company || error) {
      return { success: false, error: error || "Firma bulunamadı.", deliveries: [], companyId: null };
    }

    const companyId = (company as any).id;
    const deliveries = await prisma.delivery.findMany({
      where: { companyId },
      include: { company: true, courier: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return { success: true, deliveries: (deliveries || []).map(serializeDelivery), companyId };
  } catch (error: any) {
    console.error("Error fetching company deliveries:", error);
    return { success: false, error: error.message, deliveries: [], companyId: null };
  }
}

export async function getCourierDailyStats() {
  try {
    const { entity: courier, error } = await getAuthEntity();
    if (!courier || error) {
      return { success: false, count: 0, earnings: 0 };
    }

    const courierId = (courier as any).id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const completed = await prisma.delivery.findMany({
      where: {
        courierId,
        status: "DELIVERED",
        updatedAt: { gte: startOfDay },
      },
    });

    const count = completed.length;
    const earnings = completed.reduce((sum, d) => {
      return sum + (Number(d.finalPrice) - Number(d.commissionAmount));
    }, 0);

    return { success: true, count, earnings };
  } catch (error: any) {
    console.error("Error fetching courier stats:", error);
    return { success: false, count: 0, earnings: 0 };
  }
}
