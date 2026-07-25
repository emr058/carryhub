import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

/**
 * Get the currently authenticated user's role-based business entity.
 * Returns the company for COMPANY users, courier for COURIER users.
 */
export async function getAuthEntity() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, role: null, entity: null, error: "Oturum açmanız gerekiyor." };
  }

  // Get user role from DB
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    return { user, role: null, entity: null, error: "Kullanıcı profili bulunamadı. Lütfen kayıt olun." };
  }

  let entity = null;
  if (dbUser.role === "COMPANY") {
    entity = await prisma.company.findUnique({ where: { userId: user.id } });
  } else if (dbUser.role === "COURIER") {
    entity = await prisma.courier.findUnique({ where: { userId: user.id } });
  }

  return { user, role: dbUser.role, entity, error: null };
}
