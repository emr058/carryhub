import { updateSession } from "@/lib/supabase-middleware";
import { NextResponse } from "next/server";

// Public routes — no auth required
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/callback",
  "/auth/forgot-password",
];

// Role-based route prefixes
const roleRouteMap: Record<string, string[]> = {
  COMPANY: ["/company"],
  COURIER: ["/courier"],
  ADMIN: ["/ops"],
};

export async function middleware(request: Request) {
  const { supabaseResponse, user } = await updateSession(
    request as any
  );

  const pathname = new URL(request.url).pathname;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return supabaseResponse;
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return supabaseResponse;
  }

  // Not authenticated → redirect to login
  if (!user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Get user role from DB via API
  try {
    const res = await fetch(
      new URL("/api/auth/role", request.url).toString(),
      { headers: { Cookie: request.headers.get("cookie") || "" } }
    );
    if (res.ok) {
      const { role } = await res.json();
      const allowedPaths = roleRouteMap[role] || [];

      // Check if current path is allowed for this role
      const isAllowed = allowedPaths.some((prefix) =>
        pathname.startsWith(prefix)
      );

      if (!isAllowed) {
        // Redirect to role-appropriate homepage
        const redirectTo =
          allowedPaths.length > 0 ? allowedPaths[0] : "/";
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
    }
  } catch {
    // If role check fails, still allow (but logged)
    console.warn("[middleware] Role check failed for", user.email);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Skip static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
