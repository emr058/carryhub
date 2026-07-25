import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ role: null }, { status: 401 });
  }

  // Fetch user role via Prisma (consistent with register endpoint)
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    return NextResponse.json({
      role: dbUser?.role || null,
      email: user.email,
    });
  } catch (err) {
    console.error("[role API] Prisma error:", err);
    return NextResponse.json({ role: null }, { status: 500 });
  }
}
