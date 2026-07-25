import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

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

    const supabase = await createClient();

    // Create User record
    const { error: userError } = await supabase.from("User").insert({
      id,
      email,
      role,
    });

    if (userError) {
      // If user already exists, that's ok — they might be re-registering
      if (!userError.message.includes("duplicate")) {
        return NextResponse.json(
          { error: `Kullanıcı oluşturulamadı: ${userError.message}` },
          { status: 500 }
        );
      }
    }

    // Create role-specific record
    if (role === "COMPANY") {
      const { error: companyError } = await supabase
        .from("Company")
        .insert({
          userId: id,
          name,
          phone: phone || "",
          defaultAddress: "Belirtilmedi",
        });

      if (companyError && !companyError.message.includes("duplicate")) {
        return NextResponse.json(
          { error: `Firma profili oluşturulamadı: ${companyError.message}` },
          { status: 500 }
        );
      }
    } else {
      const { error: courierError } = await supabase
        .from("Courier")
        .insert({
          userId: id,
          name,
          phone: phone || "",
          vehicleType: "Motorsiklet",
          isAvailable: true,
        });

      if (courierError && !courierError.message.includes("duplicate")) {
        return NextResponse.json(
          { error: `Kurye profili oluşturulamadı: ${courierError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Beklenmeyen hata." },
      { status: 500 }
    );
  }
}
