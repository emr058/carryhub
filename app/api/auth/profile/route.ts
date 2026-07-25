import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

export async function GET() {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let profile = null;
    if (dbUser.role === "COMPANY") {
      profile = await prisma.company.findUnique({ where: { userId: user.id } });
    } else if (dbUser.role === "COURIER") {
      profile = await prisma.courier.findUnique({ where: { userId: user.id } });
    }

    return NextResponse.json({
      id: user.id,
      email: dbUser.email,
      role: dbUser.role,
      profile,
    });
  } catch (e) {
    console.error("[profile/GET]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    if (dbUser.role === "COMPANY" && body.profile) {
      const { name, phone, defaultAddress, district, taxId } = body.profile;
      await prisma.company.update({
        where: { userId: user.id },
        data: {
          ...(name !== undefined && { name }),
          ...(phone !== undefined && { phone }),
          ...(defaultAddress !== undefined && { defaultAddress }),
          ...(district !== undefined && { district }),
          ...(taxId !== undefined && { taxId }),
        },
      });
    } else if (dbUser.role === "COURIER" && body.profile) {
      const { name, phone, vehicleType, district } = body.profile;
      await prisma.courier.update({
        where: { userId: user.id },
        data: {
          ...(name !== undefined && { name }),
          ...(phone !== undefined && { phone }),
          ...(vehicleType !== undefined && { vehicleType }),
          ...(district !== undefined && { district }),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[profile/PATCH]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
