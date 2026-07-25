import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { id, email, role, name, phone } = await request.json();

    if (!id || !email || !role || !name) {
      return NextResponse.json(
        { error: "Eksik bilgiler: id, email, role, name zorunludur." },
        { status: 400 }
      );
    }

    if (!["COMPANY", "COURIER"].includes(role)) {
      return NextResponse.json(
        { error: "Geçersiz rol. COMPANY veya COURIER olmalıdır." },
        { status: 400 }
      );
    }

    // Create User record via Prisma (handles UUID defaults)
    await prisma.user.upsert({
      where: { id },
      create: { id, email, role },
      update: {}, // already exists — skip
    });

    // Create role-specific record
    if (role === "COMPANY") {
      await prisma.company.upsert({
        where: { userId: id },
        create: {
          userId: id,
          name,
          phone: phone || "",
          defaultAddress: "Belirtilmedi",
        },
        update: {},
      });
    } else {
      await prisma.courier.upsert({
        where: { userId: id },
        create: {
          userId: id,
          name,
          phone: phone || "",
          vehicleType: "Motorsiklet",
          isAvailable: true,
        },
        update: {},
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: err.message || "Beklenmeyen hata." },
      { status: 500 }
    );
  }
}
