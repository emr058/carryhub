import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { success: false, error: "SQL sorgusu gerekli." },
        { status: 400 }
      );
    }

    // Security: only allow SELECT queries
    const trimmed = query.trim().toUpperCase();
    if (!trimmed.startsWith("SELECT")) {
      return NextResponse.json(
        { success: false, error: "Sadece SELECT sorgularına izin verilir." },
        { status: 403 }
      );
    }

    // Block dangerous keywords
    const blocked = [
      "INFORMATION_SCHEMA", "PG_SLEEP", "PG_CANCEL", "COPY ",
      "ALTER ", "DROP ", "TRUNCATE ", "EXEC ", "EXECUTE",
      "INSERT ", "UPDATE ", "DELETE ", "CREATE ", "GRANT ",
      "REVOKE ", "LISTEN ", "NOTIFY ", "LOAD "
    ];
    for (const keyword of blocked) {
      if (trimmed.includes(keyword)) {
        return NextResponse.json(
          { success: false, error: `Güvenlik: '${keyword}' yasaklı.` },
          { status: 403 }
        );
      }
    }

    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    try {
      const result = await prisma.$queryRawUnsafe(query);
      await prisma.$disconnect();
      return NextResponse.json({ success: true, result });
    } catch (dbError: any) {
      await prisma.$disconnect();
      return NextResponse.json(
        { success: false, error: dbError.message },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
