import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ role: null }, { status: 401 });
  }

  // Fetch user role from our DB
  const { data: dbUser } = await supabase
    .from("User")
    .select("role")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    role: dbUser?.role || null,
    email: user.email,
  });
}
