"use server";

import prisma from "@/lib/prisma";
import { getAuthEntity } from "@/lib/auth-entity";
import { revalidatePath } from "next/cache";

export async function completeCompanyOnboarding(data: {
  defaultAddress: string;
  district: string;
  taxId: string;
  phone: string;
}) {
  try {
    const { entity, role, error } = await getAuthEntity();
    if (error || !entity || role !== "COMPANY") {
      return { success: false, error: "Yetkilendirme hatası." };
    }

    await prisma.company.update({
      where: { id: (entity as any).id },
      data: {
        defaultAddress: data.defaultAddress,
        district: data.district,
        taxId: data.taxId || null,
        phone: data.phone,
        isOnboarded: true,
      },
    });

    revalidatePath("/company");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function completeCourierOnboarding(data: {
  vehicleType: string;
  district: string;
  phone: string;
}) {
  try {
    const { entity, role, error } = await getAuthEntity();
    if (error || !entity || role !== "COURIER") {
      return { success: false, error: "Yetkilendirme hatası." };
    }

    await prisma.courier.update({
      where: { id: (entity as any).id },
      data: {
        vehicleType: data.vehicleType,
        district: data.district,
        phone: data.phone,
        isOnboarded: true,
        isAvailable: true,
      },
    });

    revalidatePath("/courier");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
