"use server";

import prisma from "@/lib/prisma";
import { calculatePrice } from "@/lib/pricing";
import { revalidatePath } from "next/cache";
import { serializeDelivery } from "@/lib/serializers";

export async function createDelivery(data: {
  packageType: string;
  pickupAddress: string;
  dropoffAddress: string;
  price: number;
}) {
  try {
    // Find the first company in the database
    const company = await prisma.company.findFirst();
    if (!company) {
      throw new Error("Veritabanında kayıtlı firma bulunamadı. Lütfen önce seed komutunu çalıştırın.");
    }

    // Dynamic price calculation using the pricing engine
    const pricing = calculatePrice(data.packageType, data.dropoffAddress);

    // Create the delivery record with finalPrice and commissionAmount fields
    const delivery = await prisma.delivery.create({
      data: {
        companyId: company.id,
        pickupAddress: data.pickupAddress,
        dropoffAddress: data.dropoffAddress,
        packageType: data.packageType,
        price: pricing.finalPrice,
        finalPrice: pricing.finalPrice,
        commissionAmount: pricing.commissionAmount,
        status: "PENDING",
      },
    });

    // Revalidate paths
    revalidatePath("/company");
    revalidatePath("/ops");
    revalidatePath("/ops/deliveries");
    revalidatePath("/ops/finance");

    return { success: true, delivery: serializeDelivery(delivery) };
  } catch (error: any) {
    console.error("Error creating delivery Server Action:", error);
    return { success: false, error: error.message };
  }
}

export async function getDeliveries() {
  try {
    const deliveries = await prisma.delivery.findMany({
      include: {
        company: true,
        courier: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, deliveries: (deliveries || []).map(serializeDelivery) };
  } catch (error: any) {
    console.error("Error fetching deliveries Server Action:", error);
    return { success: false, error: error.message, deliveries: [] };
  }
}

export async function getPendingDeliveries() {
  try {
    const deliveries = await prisma.delivery.findMany({
      where: {
        status: "PENDING"
      },
      include: {
        company: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    return { success: true, deliveries: (deliveries || []).map(serializeDelivery) };
  } catch (error: any) {
    console.error("Error fetching pending deliveries Server Action:", error);
    return { success: false, error: error.message, deliveries: [] };
  }
}

export async function acceptDelivery(deliveryId: string) {
  try {
    // Find the first Courier in the database
    const courier = await prisma.courier.findFirst();
    if (!courier) {
      throw new Error("Sistemde kurye bulunamadı. Lütfen önce seed komutunu çalıştırın.");
    }

    // Update delivery status and link courier
    const delivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: "ASSIGNED",
        courierId: courier.id
      }
    });

    // Revalidate paths
    revalidatePath("/", "layout");
    revalidatePath("/company");
    revalidatePath("/ops");
    revalidatePath("/ops/deliveries");
    revalidatePath("/ops/finance");

    return { success: true, delivery: serializeDelivery(delivery) };
  } catch (error: any) {
    console.error("Error accepting delivery Server Action:", error);
    return { success: false, error: error.message };
  }
}

export async function updateDeliveryStatus(
  id: string,
  status: "PENDING" | "ASSIGNED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED",
  receiverName?: string
) {
  try {
    const existing = await prisma.delivery.findUnique({
      where: { id },
      include: {
        company: { include: { user: true } },
        courier: { include: { user: true } }
      }
    });

    if (!existing) {
      throw new Error("Teslimat bulunamadı.");
    }

    const updated = await prisma.delivery.update({
      where: { id },
      data: {
        status,
        receiverName: receiverName || null
      }
    });

    // If updated to DELIVERED, automatically create transaction ledger entries
    if (status === "DELIVERED") {
      const price = Number(existing.finalPrice);
      const commission = Number(existing.commissionAmount);
      const courierAmount = price - commission;

      // 1. Debit Company (charging the company)
      await prisma.transaction.create({
        data: {
          amount: price,
          type: "DEBIT",
          status: "COMPLETED",
          deliveryId: id,
          userId: existing.company.userId
        }
      });

      // 2. Credit Courier (paying the courier)
      if (existing.courierId && existing.courier) {
        await prisma.transaction.create({
          data: {
            amount: courierAmount,
            type: "CREDIT",
            status: "COMPLETED",
            deliveryId: id,
            userId: existing.courier.userId
          }
        });
      }

      // 3. Credit Platform (Admin/Platform Commission Income)
      await prisma.transaction.create({
        data: {
          amount: commission,
          type: "CREDIT",
          status: "COMPLETED",
          deliveryId: id,
          userId: null
        }
      });
    }

    // Revalidate paths
    revalidatePath("/", "layout");
    revalidatePath("/company");
    revalidatePath("/ops");
    revalidatePath("/ops/deliveries");
    revalidatePath("/ops/finance");

    return { success: true, delivery: serializeDelivery(updated) };
  } catch (error: any) {
    console.error("Error updating delivery status Server Action:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCompanyAddress(companyId: string, address: string) {
  try {
    const company = await prisma.company.update({
      where: { id: companyId },
      data: { defaultAddress: address }
    });
    revalidatePath("/company");
    return { success: true, company };
  } catch (error: any) {
    console.error("Error updating company address Server Action:", error);
    return { success: false, error: error.message };
  }
}

export async function getCourierDeliveries() {
  try {
    const courier = await prisma.courier.findFirst();
    if (!courier) {
      return { success: false, error: "Kurye bulunamadı.", deliveries: [], courierId: null };
    }

    const deliveries = await prisma.delivery.findMany({
      where: {
        OR: [
          { status: "PENDING" },
          {
            status: "ASSIGNED",
            courierId: courier.id
          }
        ]
      },
      include: {
        company: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return { success: true, deliveries: (deliveries || []).map(serializeDelivery), courierId: courier.id };
  } catch (error: any) {
    console.error("Error fetching courier deliveries Server Action:", error);
    return { success: false, error: error.message, deliveries: [], courierId: null };
  }
}

export async function getCompany() {
  try {
    const company = await prisma.company.findFirst();
    return { success: true, company };
  } catch (error: any) {
    console.error("Error fetching company Server Action:", error);
    return { success: false, error: error.message, company: null };
  }
}

export async function getCompanyDeliveries() {
  try {
    const company = await prisma.company.findFirst();
    if (!company) {
      return { success: false, error: "Firma bulunamadı.", deliveries: [], companyId: null };
    }

    const deliveries = await prisma.delivery.findMany({
      where: {
        companyId: company.id
      },
      include: {
        company: true,
        courier: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return { success: true, deliveries: (deliveries || []).map(serializeDelivery), companyId: company.id };
  } catch (error: any) {
    console.error("Error fetching company deliveries Server Action:", error);
    return { success: false, error: error.message, deliveries: [], companyId: null };
  }
}

export async function getCourierDailyStats() {
  try {
    const courier = await prisma.courier.findFirst();
    if (!courier) {
      return { success: false, count: 0, earnings: 0 };
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const completed = await prisma.delivery.findMany({
      where: {
        courierId: courier.id,
        status: "DELIVERED",
        updatedAt: {
          gte: startOfDay
        }
      }
    });

    const count = completed.length;
    const earnings = completed.reduce((sum, d) => {
      const finalVal = Number(d.finalPrice);
      const commVal = Number(d.commissionAmount);
      return sum + (finalVal - commVal);
    }, 0);

    return { success: true, count, earnings };
  } catch (error: any) {
    console.error("Error fetching courier stats Server Action:", error);
    return { success: false, count: 0, earnings: 0 };
  }
}
